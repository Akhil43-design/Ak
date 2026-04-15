from firebase_service import FirebaseService
import json

fb = FirebaseService()
stores = fb.get_all_stores()
print(f"Found {len(stores)} stores.")
for sid, data in stores.items():
    print(f"- {data.get('name')} (Products: {len(data.get('products', {}))})")
