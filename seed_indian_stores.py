
import uuid
import random
from datetime import datetime
from firebase_service import FirebaseService
from qr_generator import QRGenerator

# India-Specific Data
INDIAN_STORES = [
    {
        "name": "Krishna Dairy",
        "category": "Dairy",
        "image": "/static/images/stores/default.png",
        "description": "Pure and fresh dairy products including milk, curd, and paneer delivered daily.",
        "products": [
            {"name": "Full Cream Milk (1L)", "price": 66, "image": "/static/images/products/default.png", "stock": 100},
            {"name": "Fresh Paneer (200g)", "price": 85, "image": "/static/images/products/default.png", "stock": 40},
            {"name": "Artisan Curd (500g)", "price": 45, "image": "/static/images/products/default.png", "stock": 60},
            {"name": "Pure Cow Ghee (1L)", "price": 650, "image": "/static/images/products/default.png", "stock": 20},
            {"name": "Fresh Butter (100g)", "price": 55, "image": "/static/images/products/default.png", "stock": 50}
        ]
    },
    {
        "name": "Sai Mobile Center",
        "category": "Electronics",
        "image": "/static/images/stores/default.png",
        "description": "Latest smartphones, mobile accessories, and expert repair services.",
        "products": [
            {"name": "Redmi Note 12", "price": 14999, "image": "/static/images/products/default.png", "stock": 15},
            {"name": "Fast Charger 33W", "price": 999, "image": "/static/images/products/default.png", "stock": 30},
            {"name": "Bluetooth Neckband", "price": 1299, "image": "/static/images/products/default.png", "stock": 25},
            {"name": "Tempered Glass", "price": 199, "image": "/static/images/products/default.png", "stock": 100},
            {"name": "Silicon Back Cover", "price": 299, "image": "/static/images/products/default.png", "stock": 50}
        ]
    },
    {
        "name": "Laxmi Vegetable Stall",
        "category": "Groceries",
        "image": "/static/images/stores/default.png",
        "description": "Farm-fresh organic vegetables and seasonal fruits at wholesale prices.",
        "products": [
            {"name": "Organic Potatoes (1kg)", "price": 40, "image": "/static/images/products/default.png", "stock": 200},
            {"name": "Fresh Tomatoes (1kg)", "price": 60, "image": "/static/images/products/default.png", "stock": 150},
            {"name": "Green Onions (250g)", "price": 30, "image": "/static/images/products/default.png", "stock": 80},
            {"name": "Fresh Spinach (Bunch)", "price": 25, "image": "/static/images/products/default.png", "stock": 100},
            {"name": "Cauliflower (Piece)", "price": 45, "image": "/static/images/products/default.png", "stock": 50}
        ]
    },
    {
        "name": "Sharma Electronics",
        "category": "Electronics",
        "image": "/static/images/stores/default.png",
        "description": "Trusted shop for home appliances, CPUs, and electrical fittings.",
        "products": [
            {"name": "Bajaj Iron", "price": 850, "image": "/static/images/products/default.png", "stock": 12},
            {"name": "Usha Table Fan", "price": 2200, "image": "/static/images/products/default.png", "stock": 8},
            {"name": "Havells LED Bulb 9W", "price": 99, "image": "/static/images/products/default.png", "stock": 100},
            {"name": "Extension Cord 5m", "price": 450, "image": "/static/images/products/default.png", "stock": 30},
            {"name": "Electric Kettle 1.5L", "price": 1200, "image": "/static/images/products/default.png", "stock": 15}
        ]
    },
    {
        "name": "Priya Fashion Hub",
        "category": "Fashion",
        "image": "/static/images/stores/default.png",
        "description": "Beautiful ethnic wear, sarees, and party dresses for every occasion.",
        "products": [
            {"name": "Cotton Kurti Set", "price": 1299, "image": "/static/images/products/default.png", "stock": 25},
            {"name": "Silk Saree", "price": 4500, "image": "/static/images/products/default.png", "stock": 10},
            {"name": "Designer Dupatta", "price": 499, "image": "/static/images/products/default.png", "stock": 40},
            {"name": "Ethnic Earrings", "price": 250, "image": "/static/images/products/default.png", "stock": 60},
            {"name": "Party Wear Gown", "price": 3500, "image": "/static/images/products/default.png", "stock": 12}
        ]
    },
    {
        "name": "Bikaneri Sweets",
        "category": "Food",
        "image": "/static/images/stores/default.png",
        "description": "Authentic Indian sweets, snacks, and fresh namkeen since 1995.",
        "products": [
            {"name": "Gulab Jamun (1kg)", "price": 450, "image": "/static/images/products/default.png", "stock": 30},
            {"name": "Kaju Katli (500g)", "price": 600, "image": "/static/images/products/default.png", "stock": 20},
            {"name": "Mixed Namkeen (1kg)", "price": 280, "image": "/static/images/products/default.png", "stock": 40},
            {"name": "Special Samosa (10pc)", "price": 150, "image": "/static/images/products/default.png", "stock": 100},
            {"name": "Fresh Jalebi (500g)", "price": 120, "image": "/static/images/products/default.png", "stock": 50}
        ]
    },
    {
        "name": "National Pharmacy",
        "category": "Healthcare",
        "image": "/static/images/stores/default.png",
        "description": "Essential medicines, baby care products, and wellness supplements.",
        "products": [
            {"name": "Paracetamol 500mg", "price": 20, "image": "/static/images/products/default.png", "stock": 500},
            {"name": "Multivitamin Tablets", "price": 350, "image": "/static/images/products/default.png", "stock": 50},
            {"name": "Dettol Antiseptic", "price": 180, "image": "/static/images/products/default.png", "stock": 100},
            {"name": "Digital Thermometer", "price": 250, "image": "/static/images/products/default.png", "stock": 30},
            {"name": "Baby Diapers (S)", "price": 899, "image": "/static/images/products/default.png", "stock": 40}
        ]
    },
    {
        "name": "Royal Bakery",
        "category": "Food",
        "image": "/static/images/stores/default.png",
        "description": "Freshly baked cakes, cookies, and breads for your daily breakfast.",
        "products": [
            {"name": "Atta Cookies (500g)", "price": 180, "image": "/static/images/products/default.png", "stock": 25},
            {"name": "Fruit Cake (450g)", "price": 250, "image": "/static/images/products/default.png", "stock": 15},
            {"name": "Milk Bread (Large)", "price": 45, "image": "/static/images/products/default.png", "stock": 40},
            {"name": "Chocolate Brownie", "price": 65, "image": "/static/images/products/default.png", "stock": 30},
            {"name": "Bun Mask (Pair)", "price": 30, "image": "/static/images/products/default.png", "stock": 50}
        ]
    },
    {
        "name": "Apex Hardware",
        "category": "Hardware",
        "image": "/static/images/stores/default.png",
        "description": "Quality tools, paints, and plumbing fixtures for home improvement.",
        "products": [
            {"name": "Hammer & Tool Set", "price": 1250, "image": "/static/images/products/default.png", "stock": 10},
            {"name": "Asian Paints (10L)", "price": 3500, "image": "/static/images/products/default.png", "stock": 15},
            {"name": "Teflon Tape (Roll)", "price": 40, "image": "/static/images/products/default.png", "stock": 100},
            {"name": "LED Spotlight", "price": 450, "image": "/static/images/products/default.png", "stock": 20},
            {"name": "Drill Machine Kit", "price": 2800, "image": "/static/images/products/default.png", "stock": 5}
        ]
    },
    {
        "name": "Students Book Depot",
        "category": "Stationery",
        "image": "/static/images/stores/default.png",
        "description": "School books, notebooks, and office stationery at competitive rates.",
        "products": [
            {"name": "Classmate Notebooks (6)", "price": 350, "image": "/static/images/products/default.png", "stock": 50},
            {"name": "Parker Beta Pen", "price": 250, "image": "/static/images/products/default.png", "stock": 40},
            {"name": "Art & Craft Kit", "price": 899, "image": "/static/images/products/default.png", "stock": 15},
            {"name": "Geometry Box", "price": 180, "image": "/static/images/products/default.png", "stock": 30},
            {"name": "Pocket Dictionary", "price": 120, "image": "/static/images/products/default.png", "stock": 20}
        ]
    }
]

def seed_database():
    print("Starting Database Seeding (Indian Stores)...")
    
    firebase = FirebaseService()
    qr_gen = QRGenerator()
    
    created_count = 0
    
    for i, store_info in enumerate(INDIAN_STORES):
        try:
            # 1. Create Store Owner Profile
            owner_id = str(uuid.uuid4())
            owner_email = f"owner_{store_info['name'].lower().replace(' ', '_')}@example.com"
            # Creating a predictable email for testing if needed
            
            print(f"Creating Owner: {owner_email}")
            firebase.create_user(owner_id, owner_email, "store_owner")
            
            # 2. Create Store
            store_id = str(uuid.uuid4())
            store_data = {
                'name': store_info['name'],
                'owner_id': owner_id,
                'description': store_info['description'],
                'category': store_info['category'],
                'created_at': datetime.now().isoformat(),
                'products': {}
            }
            firebase.create_store(store_id, store_data)
            
            # 2.1 Link store to owner for fast dashboard retrieval
            firebase.update_user(owner_id, {'store_id': store_id})
            
            # 3. Add Products
            for prod in store_info['products']:
                product_id = str(uuid.uuid4())
                
                # Generate QR
                qr_path = qr_gen.generate_product_qr(store_id, product_id)
                
                product_data = {
                    'id': product_id,
                    'name': prod['name'],
                    'price': prod['price'],
                    'size': 'Standard',
                    'color': 'Standard',
                    'description': f"Best quality {prod['name']}",
                    'stock': prod['stock'],
                    'image': prod['image'],
                    'qr_code': qr_path,
                    'scan_count': random.randint(0, 10),
                    'created_at': datetime.now().isoformat()
                }
                
                firebase.add_product(store_id, product_id, product_data)
                
            created_count += 1
            print(f"Completed Store: {store_info['name']}")
            
        except Exception as e:
            print(f"Error creating {store_info['name']}: {e}")
            
    print("\n" + "="*50)
    print(f"Seeding Complete! Created {created_count} stores.")
    print("="*50)

if __name__ == "__main__":
    seed_database()
