# Use a small official Python image
FROM python:3.13-slim

# Set working directory inside container
WORKDIR /app

# Keep Python output unbuffered and disable .pyc cache
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1

# Install dependencies first
COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

# Copy the rest of the backend code
COPY . /app

# Add execute permission to the entrypoint script
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Run the entrypoint script
CMD ["/app/entrypoint.sh"]
