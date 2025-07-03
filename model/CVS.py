from paddleocr import PaddleOCR
import cv2
import re

# Load PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')  # Ganti 'en' sesuai kebutuhan

# Load and preprocess image
img_path = "SampleData/Prio2.JPG"
img = cv2.imread(img_path)

# Perform OCR using PaddleOCR
results = ocr.ocr(img_path, cls=True)

# Extract all detected lines (flatten and lowercase)
lines = []
for line in results[0]:
    text = line[1][0].strip().lower()
    if text:
        lines.append(text)

# Function to parse quantity, item, and price
def parse_line(line):
    # Pattern: "1x nasi goreng 15000" or "2 nasi goreng 15000"
    match = re.match(r"(\d+)\s*x?\s*(.+?)\s+(\d{3,})$", line)
    if match:
        qty, item, price = match.groups()
        return {'qty': int(qty), 'item': item.strip(), 'price': int(price)}

    # Pattern: "nasi goreng x1 15000"
    match = re.match(r"(.+?)\s*x\s*(\d+)\s+(\d{3,})$", line)
    if match:
        item, qty, price = match.groups()
        return {'qty': int(qty), 'item': item.strip(), 'price': int(price)}

    # Pattern: "nasi goreng 15000" (assume qty = 1)
    match = re.match(r"(.+?)\s+(\d{3,})$", line)
    if match:
        item, price = match.groups()
        return {'qty': 1, 'item': item.strip(), 'price': int(price)}

    return None

# Apply parsing to each line
parsed_items = []
for line in lines:
    parsed = parse_line(line)
    if parsed:
        parsed_items.append(parsed)

# Output results
print("\n--- Parsed Items ---")
for r in parsed_items:
    print(f"{r['qty']}x {r['item']} - Rp{r['price']}")
