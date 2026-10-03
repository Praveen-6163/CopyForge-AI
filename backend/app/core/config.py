import os
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
    def DB_PATH(self) -> str:
        return os.getenv("DB_PATH", "copyforge.db")
        
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
    def FRONTEND_ORIGIN(self) -> str:
        return os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").strip().rstrip("/")

    @property
    def LINKEDIN_CONFIGURED(self) -> bool:
        return all((
            self.LINKEDIN_CLIENT_ID,
            self.LINKEDIN_CLIENT_SECRET,
            self.LINKEDIN_REDIRECT_URI,
            self.SECRET_KEY,
        )) and len(self.SECRET_KEY) >= 32

    @property
    def LINKEDIN_COOKIE_SECURE(self) -> bool:
        return self.LINKEDIN_REDIRECT_URI.lower().startswith("https://")
    
    @property
    def is_demo_mode(self) -> bool:
        key = self.OPENAI_API_KEY
        return len(key) == 0 or key.startswith("your_") or "sk-demo" in key or "placeholder" in key

settings = Settings()
