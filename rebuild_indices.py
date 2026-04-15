
import requests
from firebase_service import FirebaseService

def rebuild_indices():
    print("Starting Index Reconstruction...")
    firebase = FirebaseService()
    
    # 1. Index Users by Email
    print("\nIndexing Users...")
    users_url = firebase._get_url("users")
    users = requests.get(users_url).json()
    
    if users and isinstance(users, dict):
        for uid, user_data in users.items():
            if not isinstance(user_data, dict): continue
            email = user_data.get('email')
            if email:
                safe_email = firebase._safe_key(email)
                print(f"  - [{email}] -> {uid}")
                requests.put(firebase._get_url(f"lookup/emails/{safe_email}"), json=uid)
    else:
        print("  - No users found.")

    # 2. Index Products & Link Stores to Owners
    print("\nIndexing Stores and Products...")
    stores_url = firebase._get_url("stores")
    stores = requests.get(stores_url).json()
    
    if stores and isinstance(stores, dict):
        for sid, sdata in stores.items():
            if not isinstance(sdata, dict): continue
            
            # Link store to owner profile
            owner_id = sdata.get('owner_id')
            if owner_id:
                print(f"  - Store [{sid}] linked to Owner [{owner_id}]")
                firebase.update_user(owner_id, {'store_id': sid})
            
            # Index products
            products = sdata.get('products', {})
            if products and isinstance(products, dict):
                for pid, pdata in products.items():
                    if not isinstance(pdata, dict): continue
                    print(f"    * Product [{pid}] -> Store [{sid}]")
                    index_data = {
                        "store_id": sid,
                        "name": pdata.get('name'),
                        "price": pdata.get('price')
                    }
                    requests.put(firebase._get_url(f"lookup/products/{pid}"), json=index_data)
    else:
        print("  - No stores found.")

    print("\nIndexing Complete!")

if __name__ == "__main__":
    rebuild_indices()
