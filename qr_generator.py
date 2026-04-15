import qrcode
import io
import base64
from PIL import Image

class QRGenerator:
    def __init__(self, base_url=None):
        # Default placeholder URL if none provided
        self.base_url = base_url or "https://smart-qr-shopping.vercel.app"

    def generate_product_qr(self, store_id, product_id):
        """
        Generate a QR code for a product and return as a Base64 string.
        The QR contains the product details URL.
        """
        # Create the data for the QR code
        # Format can be a URL or a JSON string. 
        # The current app uses the global product ID for lookups.
        data = f"{self.base_url}/product/{store_id}/{product_id}"
        
        # Also include a JSON version for the mobile scanner if needed
        # data = f'{{"id": "{product_id}", "store_id": "{store_id}"}}'

        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)

        # Create an image from the QR Code instance
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to a bytes buffer
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        
        # Encode to base64
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"

    def save_qr_to_file(self, store_id, product_id, filepath):
        """Legacy method to save to a file if needed"""
        base64_qr = self.generate_product_qr(store_id, product_id)
        # Extract the base64 part
        img_data = base64.b64decode(base64_qr.split(',')[1])
        with open(filepath, 'wb') as f:
            f.write(img_data)
        return filepath
