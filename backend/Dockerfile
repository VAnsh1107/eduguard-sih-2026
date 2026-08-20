FROM python:3.11-slim

WORKDIR /app

# System deps for shap / xgboost / reportlab
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc g++ libgomp1 && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Seed + train artifacts live under /app but are mounted via docker-compose
RUN mkdir -p /app/data /app/model/versions

EXPOSE 5000

CMD ["python", "app.py"]
