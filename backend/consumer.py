import pika
import json
import mysql.connector

# Configurações do RabbitMQ
rabbitmq_host = "localhost"
queue_name = "fila_teste"

# Configurações do MySQL
mysql_config = {
    "host": "localhost",   # ou IP do Podman exposto
    "user": "root",
    "password": "123456",
    "database": "left"
}

# Conecta ao MySQL
conn = mysql.connector.connect(**mysql_config)
cursor = conn.cursor()

# Cria tabela se não existir
cursor.execute("""
CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    acao VARCHAR(255)
)
""")
conn.commit()

def callback(ch, method, properties, body):
    dados = json.loads(body)
    print(f"Mensagem recebida: {dados}")

    # Insere no MySQL
    cursor.execute("INSERT INTO mensagens (nome, acao) VALUES (%s, %s)", 
                   (dados["nome"], dados["acao"]))
    conn.commit()
    print("Dados gravados no MySQL!")

# Conecta ao RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
channel = connection.channel()

channel.queue_declare(queue=queue_name)

# Define o consumidor
channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

print("Aguardando mensagens... CTRL+C para sair")
channel.start_consuming()
