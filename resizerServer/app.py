from flask import Flask, request, jsonify, send_file
from PIL import Image, ImageOps
from rembg import remove
import io
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def resize_image(image, width, height):
    return image.resize((width, height), Image.LANCZOS)

def compress_image(image, format, target_size):
    quality = 95  # Start with high quality
    buffer = io.BytesIO()
    
    while buffer.tell() < target_size:
        buffer.seek(0)
        image.save(buffer, format=format, quality=quality)
        if buffer.tell() > target_size:
            buffer = io.BytesIO()
            quality -= 5  # Decrease quality step-by-step

    buffer.seek(0)
    return buffer
def get_target_size_kb(size_kb):
    """
    Convert the size_kb field to bytes. If the field is empty or invalid, return 0.
    """
    try:
        return int(size_kb) * 1024 if size_kb else 0  # Convert KB to bytes
    except ValueError:
        return 0
@app.route('/process_image', methods=['POST'])
def process_image():
    print("processing...",request.form)
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    width = int(request.form['width'])
    height = int(request.form['height'])
    format = request.form['format'].upper()
    size_kb = request.form.get('size_kb', '')
    remove_bg = request.form.get('remove_bg') == 'true'
    
    target_size_kb = get_target_size_kb(size_kb)
    image = Image.open(file)

    if remove_bg:
        image = remove(image)
        

    image = resize_image(image, width, height)

    if format == 'JPEG':
        image = image.convert('RGB')

    if target_size_kb > 0:
        buffer = compress_image(image, format, target_size_kb)
    else:
        buffer = io.BytesIO()
        image.save(buffer, format=format)
        buffer.seek(0)

    return send_file(buffer, mimetype=f'image/{format.lower()}')

if __name__ == '__main__':
    app.run(debug=True)
