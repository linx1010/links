import pika
import json

# Configurações do RabbitMQ
rabbitmq_host = "localhost"   # ou IP do container se exposto
queue_name = "fila_teste"

# Conecta ao RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
channel = connection.channel()

# Garante que a fila exista
channel.queue_declare(queue=queue_name)

# Exemplo de mensagem (pode ser JSON)
mensagem = {
    "id": 1,
    "nome": "Leandro",
    "acao": "inserir"
}

# Envia mensagem
channel.basic_publish(exchange="", routing_key=queue_name, body=json.dumps(mensagem))
print(f"Mensagem enviada: {mensagem}")

connection.close()
