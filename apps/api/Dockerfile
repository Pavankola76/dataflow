FROM python:3.9-slim

WORKDIR /app

# Copy the entire monorepo context to preserve paths
COPY . /app

WORKDIR /app/apps/api

# Install build tools and pip dependencies
RUN apt-get update && apt-get install -y gcc g++ libpq-dev && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -e .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Start the uvicorn ASGI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
