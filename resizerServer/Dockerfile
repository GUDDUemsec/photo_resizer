# Use an official Python runtime as a parent image
FROM python:3.9

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    wget

COPY . .
# Install Flask
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir Flask
# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Expose port
EXPOSE 5000

# Start the Flask app
CMD ["flask", "run", "--host=0.0.0.0"]
