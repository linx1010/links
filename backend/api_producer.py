# api_producer.py
from flask import Flask, request, jsonify
import pika
import json

app = Flask(__name__)

# Configurações do RabbitMQ
rabbitmq_host = "localhost"
queue_name = "fila_teste"

def enviar_para_rabbitmq(mensagem):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
    channel = connection.channel()
    channel.queue_declare(queue=queue_name)
    channel.basic_publish(exchange="", routing_key=queue_name, body=json.dumps(mensagem))
    connection.close()

@app.route("/mensagem", methods=["POST"])
def mensagem():
    dados = request.json
    enviar_para_rabbitmq(dados)
    return jsonify({"status": "Mensagem enviada com sucesso!", "dados": dados}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
