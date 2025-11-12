import pika
import json
import mysql.connector
from users import Users
from clients import Clients
from calendario import Calendar
from timesheet import Timesheet
from modules import Modules

# Configurações do RabbitMQ
rabbitmq_host = "localhost"
queue_name = "users_rpc_queue"

# Configurações do MySQL
mysql_config = {
    "host": "localhost",    # ou IP do Podman exposto
    "user": "root",
    "password": "123456",
    "database": "left"
}

# expedidor
def on_request(ch, method, props, body):
    conn = mysql.connector.connect(**mysql_config)
    
    try:
        request = json.loads(body)
        action = request.get("action")
        source = request.get("source")
        data = request.get("data", {})

        print(f" ✅ Requisição recebida origem {source} ação: {action}")

        if source =='users':   
            users = Users(conn) 
            if action == "create":
                response = users.create_user(data)
            elif action == "read":
                response = users.read_users()
            elif action == 'read_by_id':
                response = users.read_user_by_id(data)
            elif action == "update":
                response = users.update_user(data)
            elif action == "delete":
                response = users.delete_user(data)
            
            elif action == "login":
                response = users.login(data)  
            
            else:
                response = {"status": False, "message": "invalid action!"}

        elif source == 'modules':
            module = Modules(conn)
            if action =='read':
                response = module.read_modules()
            else:
                response = {"status": False, "message": "invalid action!"}
                
        elif source =='clients':
            clients = Clients(conn)
            if action == "read":
                response = clients.read_clients()
            elif action == "create":
                response = clients.create_client(data['data'])
            elif action == "update":
                response = clients.update_client(data)
            elif action == "delete":
                response = clients.delete_client(data)
            else:
                response = {"status": False, "message": "invalid action!"}
        
        elif source =='calendar':
            calendar = Calendar(conn)
            if action == 'read':
                response = calendar.getCalendar(data)
            elif action == 'create':
                response = calendar.createCalendar(data)
            elif action == 'delete':
                response = calendar.deleteCalendar(data)
            elif action == 'update':
                response = calendar.updateCalendar(data)
            else:
                response = {"status": False, "message": "invalid action!"}

        elif source == 'timesheet':
            timesheet = Timesheet(conn)
            if action == 'read':
                response = timesheet.read_timesheet(data)
            elif action == 'save':
                response = timesheet.save_timesheet(data)
            else:
                response = {"status": False, "message": "invalid action!"}


    except Exception as e:
        response = {"status": False, "message": str(e)}

    # Envia resposta
    ch.basic_publish(
        exchange='',
        routing_key=props.reply_to,
        properties=pika.BasicProperties(correlation_id=props.correlation_id),
        body=json.dumps(response, default=str)
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)

# Conexão RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
channel = connection.channel()
channel.queue_declare(queue=queue_name)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue=queue_name, on_message_callback=on_request)

print("🕰️  Aguardando requisições RPC de usuários (create, read, update, delete)...")
channel.start_consuming()
