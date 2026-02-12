import firebase_admin
from firebase_admin import credentials

from app.config import settings


def initialize_firebase() -> None:
    if firebase_admin._apps:
        return

    if settings.FIREBASE_CREDENTIALS_PATH:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    else:
        # Uses Application Default Credentials (ADC) on Cloud Run
        firebase_admin.initialize_app()
