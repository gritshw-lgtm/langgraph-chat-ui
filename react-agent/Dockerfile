FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy project files needed for installation
COPY pyproject.toml ./
COPY src/ ./src/

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -e . && \
    pip install --no-cache-dir "langgraph-cli[inmem]>=0.1.71"

# Copy remaining application code
COPY . .

# Expose LangGraph server port
EXPOSE 2024

# Run LangGraph server
CMD ["langgraph", "dev", "--host", "0.0.0.0", "--port", "2024"]
