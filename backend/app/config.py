# import os
# from dotenv import load_dotenv

# load_dotenv()

# class Settings:
#     app_name = os.getenv("APP_NAME", "Context-Aware AI Code Review")
#     database_path = os.getenv("DATABASE_PATH", "./data/reviews.db")
#     knowledge_dir = os.getenv("KNOWLEDGE_DIR", "./knowledge")
#     github_token = os.getenv("GITHUB_TOKEN", "")
#     github_webhook_secret = os.getenv("GITHUB_WEBHOOK_SECRET", "")
#     openai_api_key = os.getenv("OPENAI_API_KEY", "")
#     openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
#     cors_origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:4200").split(",")]

# settings = Settings()


import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    app_name = os.getenv(
        "APP_NAME",
        "Context-Aware AI Code Review"
    )

    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://code_review:YOUR_PASSWORD@localhost:5432/code_review_db"
    )

    knowledge_dir = os.getenv(
        "KNOWLEDGE_DIR",
        "./knowledge"
    )

    github_token = os.getenv(
        "GITHUB_TOKEN",
        ""
    )

    github_webhook_secret = os.getenv(
        "GITHUB_WEBHOOK_SECRET",
        ""
    )

    openai_api_key = os.getenv(
        "OPENAI_API_KEY",
        ""
    )

    openai_model = os.getenv(
        "OPENAI_MODEL",
        "gpt-4o-mini"
    )

    cors_origins = [
        x.strip()
        for x in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:4200"
        ).split(",")
    ]


settings = Settings()
