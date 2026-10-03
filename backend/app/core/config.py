import os
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "CopyForge AI"
    TAGLINE: str = "Turn product ideas into platform-ready content."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    @property
    def OPENAI_API_KEY(self) -> str:
        return os.getenv("OPENAI_API_KEY", "").strip()

    @property
    def OPENAI_MODEL(self) -> str:
        return os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

    @property
    def OPENAI_IMAGE_MODEL(self) -> str:
        return os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1").strip()

    @property
    def AI_CONFIGURED(self) -> bool:
        return bool(self.OPENAI_API_KEY) and not self.OPENAI_API_KEY.lower().startswith(
            ("your_", "placeholder")
        )
    
    @property
    def DB_PATH(self) -> str:
        return os.getenv("DB_PATH", "copyforge.db")

    @property
    def DATABASE_URL(self) -> str:
        return os.getenv("DATABASE_URL", "").strip()
        
    @property
    def PORT(self) -> int:
        return int(os.getenv("PORT", "8000"))

    @property
    def SECRET_KEY(self) -> str:
        return os.getenv("SECRET_KEY", "").strip()

    @property
    def LINKEDIN_CLIENT_ID(self) -> str:
        return os.getenv("LINKEDIN_CLIENT_ID", "").strip()

    @property
    def LINKEDIN_CLIENT_SECRET(self) -> str:
        return os.getenv("LINKEDIN_CLIENT_SECRET", "").strip()

    @property
    def LINKEDIN_REDIRECT_URI(self) -> str:
        return os.getenv("LINKEDIN_REDIRECT_URI", "").strip()

    @property
    def LINKEDIN_API_VERSION(self) -> str:
        return os.getenv("LINKEDIN_API_VERSION", "202510").strip()

    @property
    def META_APP_ID(self) -> str:
        return os.getenv("META_APP_ID", "").strip()

    @property
    def META_APP_SECRET(self) -> str:
        return os.getenv("META_APP_SECRET", "").strip()

    @property
    def META_REDIRECT_URI(self) -> str:
        return os.getenv("META_REDIRECT_URI", "").strip()

    @property
    def META_GRAPH_API_VERSION(self) -> str:
        return os.getenv("META_GRAPH_API_VERSION", "v22.0").strip()

    @property
    def META_CONFIGURED(self) -> bool:
        try:
            redirect = urlparse(self.META_REDIRECT_URI)
            return (
                bool(self.META_APP_ID and self.META_APP_SECRET)
                and redirect.scheme == "https"
                and bool(redirect.hostname)
                and redirect.path == "/auth/instagram/callback"
                and not redirect.query
                and not redirect.fragment
                and not redirect.username
                and not redirect.password
            )
        except ValueError:
            return False

    @property
    def FRONTEND_URL(self) -> str:
        return os.getenv(
            "FRONTEND_URL",
            os.getenv("FRONTEND_ORIGIN", "http://localhost:3000"),
        ).strip().rstrip("/")

    @property
    def FRONTEND_ORIGIN(self) -> str:
        return self.FRONTEND_URL

    @property
    def PUBLIC_BACKEND_URL(self) -> str:
        configured_url = os.getenv("PUBLIC_BACKEND_URL", "").strip().rstrip("/")
        if configured_url:
            return configured_url
        redirect = urlparse(self.LINKEDIN_REDIRECT_URI)
        if redirect.scheme and redirect.netloc:
            return f"{redirect.scheme}://{redirect.netloc}"
        return "http://localhost:8000"

    @property
    def CORS_ALLOWED_ORIGINS(self) -> list[str]:
        configured = os.getenv("CORS_ALLOWED_ORIGINS", "")
        origins = {
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://copyforge-aiauto.netlify.app",
            self.FRONTEND_URL,
        }
        origins.update(
            origin.strip().rstrip("/")
            for origin in configured.split(",")
            if origin.strip() and origin.strip() != "*"
        )
        return sorted(origins)

    @property
    def LINKEDIN_CONFIGURED(self) -> bool:
        return all((
            self.LINKEDIN_CLIENT_ID,
            self.LINKEDIN_CLIENT_SECRET,
            self.LINKEDIN_REDIRECT_URI,
            self.SECRET_KEY,
        )) and len(self.SECRET_KEY) >= 32

    @property
    def LINKEDIN_CONFIGURATION_ISSUES(self) -> tuple[str, ...]:
        required = {
            "LINKEDIN_CLIENT_ID": self.LINKEDIN_CLIENT_ID,
            "LINKEDIN_CLIENT_SECRET": self.LINKEDIN_CLIENT_SECRET,
            "LINKEDIN_REDIRECT_URI": self.LINKEDIN_REDIRECT_URI,
            "SECRET_KEY": self.SECRET_KEY,
        }
        issues = [name for name, value in required.items() if not value]

        if self.SECRET_KEY and len(self.SECRET_KEY) < 32:
            issues.append("SECRET_KEY (must be at least 32 characters)")

        if self.LINKEDIN_REDIRECT_URI:
            try:
                redirect = urlparse(self.LINKEDIN_REDIRECT_URI)
                hostname = redirect.hostname
                port = redirect.port
                valid_redirect = (
                    redirect.scheme in {"http", "https"}
                    and bool(hostname)
                    and (redirect.scheme == "https" or hostname in {"localhost", "127.0.0.1"})
                    and (port is None or 1 <= port <= 65535)
                    and redirect.path == "/auth/linkedin/callback"
                    and not redirect.query
                    and not redirect.username
                    and not redirect.password
                    and not redirect.fragment
                )
            except ValueError:
                valid_redirect = False
            if not valid_redirect:
                issues.append(
                    "LINKEDIN_REDIRECT_URI (must use HTTPS, or localhost HTTP, "
                    "and end with /auth/linkedin/callback)"
                )

        return tuple(issues)

    @property
    def LINKEDIN_COOKIE_SECURE(self) -> bool:
        return self.LINKEDIN_REDIRECT_URI.lower().startswith("https://")
    
settings = Settings()
