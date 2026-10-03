import base64
import hashlib
import logging
import sqlite3
from urllib.parse import parse_qs, urlparse

import httpx
import pytest
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient

from app.api import linkedin
from app.core.config import settings
from app.main import app


@pytest.fixture
def oauth_client(tmp_path, monkeypatch):
    monkeypatch.setenv("DB_PATH", str(tmp_path / "oauth-test.db"))
    monkeypatch.setenv("LINKEDIN_CLIENT_ID", "test-client-id")
    monkeypatch.setenv("LINKEDIN_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/auth/linkedin/callback")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-that-is-long-enough-32")
    monkeypatch.setenv("FRONTEND_ORIGIN", "http://localhost:3000")
    with TestClient(app) as client:
        yield client


def _authorization_state(client: TestClient) -> tuple[str, dict[str, list[str]]]:
    response = client.get("/auth/linkedin", follow_redirects=False)
    assert response.status_code == 302
    location = response.headers["location"]
    query = parse_qs(urlparse(location).query)
    assert urlparse(location).hostname == "www.linkedin.com"
    assert set(query["scope"][0].split()) == {"openid", "profile", "w_member_social"}
    assert query["redirect_uri"] == ["http://localhost:8000/auth/linkedin/callback"]
    return query["state"][0], query


def _mock_linkedin_http(monkeypatch, token_status: int = 200, profile_status: int = 200) -> None:
    real_async_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url == httpx.URL(linkedin.LINKEDIN_TOKEN_URL):
            if token_status != 200:
                return httpx.Response(token_status, json={"error": "invalid_grant"})
            return httpx.Response(200, json={"access_token": "test-access-token", "expires_in": 3600})
        if request.url == httpx.URL(linkedin.LINKEDIN_USERINFO_URL):
            if profile_status != 200:
                return httpx.Response(profile_status, json={"error": "insufficient_scope"})
            assert request.headers["authorization"] == "Bearer test-access-token"
            return httpx.Response(200, json={
                "sub": "linkedin-member-123",
                "name": "CopyForge Test Member",
                "picture": "https://media.example/profile.jpg",
            })
        return httpx.Response(404)

    transport = httpx.MockTransport(handler)

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return real_async_client(transport=transport, timeout=timeout)

    monkeypatch.setattr(linkedin.httpx, "AsyncClient", client_factory)


def test_status_says_not_configured_when_credentials_are_missing(oauth_client, monkeypatch):
    monkeypatch.delenv("LINKEDIN_CLIENT_SECRET")
    response = oauth_client.get("/api/social/linkedin/status")
    assert response.status_code == 200
    assert response.json() == {"configured": False, "connected": False}


def test_configuration_validation_names_missing_variables_without_secret_values(monkeypatch):
    monkeypatch.setenv("LINKEDIN_CLIENT_ID", "test-client-id")
    monkeypatch.setenv("LINKEDIN_CLIENT_SECRET", "sensitive-test-secret-value")
    monkeypatch.setenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/auth/linkedin/callback")
    monkeypatch.delenv("SECRET_KEY", raising=False)

    issues = settings.LINKEDIN_CONFIGURATION_ISSUES

    assert issues == ("SECRET_KEY",)
    assert "sensitive-test-secret-value" not in repr(issues)


def test_configuration_validation_rejects_weak_secret_and_wrong_callback(monkeypatch):
    monkeypatch.setenv("LINKEDIN_CLIENT_ID", "test-client-id")
    monkeypatch.setenv("LINKEDIN_CLIENT_SECRET", "sensitive-test-secret-value")
    monkeypatch.setenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/wrong-path")
    monkeypatch.setenv("SECRET_KEY", "too-short")

    issues = settings.LINKEDIN_CONFIGURATION_ISSUES

    assert "SECRET_KEY (must be at least 32 characters)" in issues
    assert any(issue.startswith("LINKEDIN_REDIRECT_URI") for issue in issues)
    assert "sensitive-test-secret-value" not in repr(issues)


def test_startup_warns_about_missing_oauth_variables_without_logging_values(monkeypatch, tmp_path, caplog):
    monkeypatch.setenv("DB_PATH", str(tmp_path / "startup-test.db"))
    monkeypatch.setenv("LINKEDIN_CLIENT_ID", "test-client-id")
    monkeypatch.setenv("LINKEDIN_CLIENT_SECRET", "sensitive-test-secret-value")
    monkeypatch.setenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/auth/linkedin/callback")
    monkeypatch.setenv("FRONTEND_ORIGIN", "http://localhost:3000")
    monkeypatch.delenv("SECRET_KEY", raising=False)

    with caplog.at_level(logging.WARNING), TestClient(app):
        pass

    assert "LinkedIn OAuth is disabled" in caplog.text
    assert "SECRET_KEY" in caplog.text
    assert "sensitive-test-secret-value" not in caplog.text


def test_authorization_redirect_uses_official_linkedin_oauth(oauth_client):
    _, query = _authorization_state(oauth_client)
    assert query["response_type"] == ["code"]
    assert query["client_id"] == ["test-client-id"]
    assert "client_secret" not in query
    assert "state" in query
    assert linkedin.SESSION_COOKIE in oauth_client.cookies


def test_successful_callback_stores_encrypted_token_and_status(oauth_client, monkeypatch, tmp_path):
    _mock_linkedin_http(monkeypatch)
    state, _ = _authorization_state(oauth_client)

    callback = oauth_client.get(
        "/auth/linkedin/callback",
        params={"code": "valid-one-time-code", "state": state},
        follow_redirects=False,
    )
    assert callback.status_code == 302
    assert callback.headers["location"] == "http://localhost:3000/social/linkedin?linkedin=connected"

    status_response = oauth_client.get("/api/social/linkedin/status")
    status_data = status_response.json()
    assert status_data["configured"] is True
    assert status_data["connected"] is True
    assert status_data["provider"] == "linkedin"
    assert status_data["member_id"] == "linkedin-member-123"
    assert status_data["display_name"] == "CopyForge Test Member"
    assert status_data["profile_image"] == "https://media.example/profile.jpg"
    assert "access_token" not in status_data
    assert "test-access-token" not in status_response.text

    database_path = tmp_path / "oauth-test.db"
    with sqlite3.connect(database_path) as database:
        stored_token = database.execute(
            "SELECT access_token_ciphertext FROM linkedin_connections"
        ).fetchone()[0]
    encryption_key = base64.urlsafe_b64encode(hashlib.sha256(
        b"test-secret-key-that-is-long-enough-32"
    ).digest())
    assert stored_token != "test-access-token"
    assert Fernet(encryption_key).decrypt(stored_token.encode()).decode() == "test-access-token"

    disconnected = oauth_client.post(
        "/api/social/linkedin/disconnect",
        headers={"Origin": "http://localhost:3000"},
    )
    assert disconnected.status_code == 200
    assert disconnected.json() == {"disconnected": True}
    assert oauth_client.get("/api/social/linkedin/status").json()["connected"] is False


def test_cancelled_oauth_is_returned_without_exchanging_code(oauth_client):
    state, _ = _authorization_state(oauth_client)
    callback = oauth_client.get(
        "/auth/linkedin/callback",
        params={"error": "user_cancelled_login", "state": state},
        follow_redirects=False,
    )
    assert callback.headers["location"] == "http://localhost:3000/social/linkedin?linkedin=cancelled"


def test_invalid_state_is_rejected(oauth_client):
    callback = oauth_client.get(
        "/auth/linkedin/callback",
        params={"code": "never-used", "state": "invalid-state"},
        follow_redirects=False,
    )
    assert callback.headers["location"] == "http://localhost:3000/social/linkedin?linkedin=failed&reason=state"


def test_oauth_state_cannot_be_replayed(oauth_client):
    state, _ = _authorization_state(oauth_client)
    first = oauth_client.get(
        "/auth/linkedin/callback",
        params={"error": "user_cancelled_login", "state": state},
        follow_redirects=False,
    )
    replay = oauth_client.get(
        "/auth/linkedin/callback",
        params={"code": "replayed-code", "state": state},
        follow_redirects=False,
    )
    assert first.headers["location"] == "http://localhost:3000/social/linkedin?linkedin=cancelled"
    assert replay.headers["location"] == "http://localhost:3000/social/linkedin?linkedin=failed&reason=state"


def test_invalid_authorization_code_is_reported_safely(oauth_client, monkeypatch):
    _mock_linkedin_http(monkeypatch, token_status=400)
    state, _ = _authorization_state(oauth_client)
    callback = oauth_client.get(
        "/auth/linkedin/callback",
        params={"code": "invalid-code", "state": state},
        follow_redirects=False,
    )
    assert callback.headers["location"] == "http://localhost:3000/social/linkedin?linkedin=failed&reason=code"


def test_missing_member_posting_permission_is_reported(oauth_client, monkeypatch):
    _mock_linkedin_http(monkeypatch, profile_status=403)
    state, _ = _authorization_state(oauth_client)
    callback = oauth_client.get(
        "/auth/linkedin/callback",
        params={"code": "valid-code", "state": state},
        follow_redirects=False,
    )
    assert callback.headers["location"] == "http://localhost:3000/social/linkedin?linkedin=failed&reason=permissions"


def test_expired_access_token_is_not_reported_as_connected(oauth_client, monkeypatch, tmp_path):
    _mock_linkedin_http(monkeypatch)
    state, _ = _authorization_state(oauth_client)
    oauth_client.get(
        "/auth/linkedin/callback",
        params={"code": "valid-code", "state": state},
        follow_redirects=False,
    )

    with sqlite3.connect(tmp_path / "oauth-test.db") as database:
        database.execute("UPDATE linkedin_connections SET token_expires_at = 1")
        database.commit()

    response = oauth_client.get("/api/social/linkedin/status")
    assert response.json() == {
        "configured": True,
        "connected": False,
        "error": "token_expired",
    }


def test_disconnect_requires_configured_frontend_origin(oauth_client):
    response = oauth_client.post(
        "/api/social/linkedin/disconnect",
        headers={"Origin": "https://malicious.example"},
    )
    assert response.status_code == 403
