import requests

url = "http://localhost:5000/process_image"
image_path = "WhatsApp Image 2024-06-24 at 10.36.08 PM.jpeg"
output_path = "processed_image.png"
width = 800
height = 600
output_format = "PNG"

files = {'image': open(image_path, 'rb')}
data = {
    # 'width': width,
    # 'height': height,
    'format': output_format
}

response = requests.post(url, files=files, data=data)

if response.status_code == 200:
    with open(output_path, 'wb') as f:
        f.write(response.content)
    print(f"Processed image saved to {output_path}")
else:
    print(f"Failed to process image. Status code: {response.status_code}")
    print(response.json())
