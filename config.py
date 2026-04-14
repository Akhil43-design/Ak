import os

# Firebase Configuration
# Environment variables should be set in Vercel for production
FIREBASE_CONFIG = {
    "apiKey": os.environ.get("FIREBASE_API_KEY", "AIzaSyCmibl11RoHkMTAP_slal6Ea7YTYuZsZZQ"),
    "authDomain": os.environ.get("FIREBASE_AUTH_DOMAIN", "edt-22ba3.firebaseapp.com"),
    "databaseURL": os.environ.get("FIREBASE_DATABASE_URL", "https://edt-22ba3-default-rtdb.firebaseio.com"),
    "projectId": os.environ.get("FIREBASE_PROJECT_ID", "edt-22ba3"),
    "storageBucket": os.environ.get("FIREBASE_STORAGE_BUCKET", "edt-22ba3.firebasestorage.app"),
    "messagingSenderId": os.environ.get("FIREBASE_MESSAGING_SENDER_ID", "142653765460"),
    "appId": os.environ.get("FIREBASE_APP_ID", "1:142653765460:web:27c93d592eb345cb3f7ac1")
}

# Flask Configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-this-in-production")
DEBUG = os.environ.get("VERCEL") is None # True locally, False on Vercel
HOST = "0.0.0.0" # Bind to all interfaces for deployment
PORT = int(os.environ.get("PORT", 5000))

