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
    def is_demo_mode(self) -> bool:
        key = self.OPENAI_API_KEY
        return len(key) == 0 or key.startswith("your_") or "sk-demo" in key or "placeholder" in key

settings = Settings()
