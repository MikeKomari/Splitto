
# 2. Imports
from transformers import DonutProcessor, VisionEncoderDecoderModel
from PIL import Image
import torch

# 3. Load processor and model (with trust_remote_code for Donut)
processor = DonutProcessor.from_pretrained("naver-clova-ix/donut-base-finetuned-rvlcdip")
model = VisionEncoderDecoderModel.from_pretrained(
    "naver-clova-ix/donut-base-finetuned-rvlcdip",
    trust_remote_code=True,
)

# 4. Move model to GPU if available
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
model.eval()

# (Optional) Lower precision to reduce memory footprint
# model.half()

# 5. Load your image
image = Image.open("your_receipt.jpg").convert("RGB")




# 6. Preprocess input with DonutProcessor
pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)

# 7. Generate output
with torch.no_grad():
    output_ids = model.generate(
        pixel_values,
        max_length=512,
        # optionally `torch_dtype=model.dtype` if using half()
    )

# 8. Decode result
result = processor.batch_decode(output_ids, skip_special_tokens=True)[0]
print(result)
