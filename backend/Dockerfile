FROM python:3.11-slim

WORKDIR /app

# Copia arquivos do backend
COPY . /app

# Instala dependências
RUN pip install --no-cache-dir -r requirements.txt

# Comando padrão
CMD ["python", "consumer_rpc.py"]
