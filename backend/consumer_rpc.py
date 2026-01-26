import pika
import json
import mysql.connector
import os, time, sys
from users import Users
from clients import Clients
from calendario import Calendar
from timesheet import Timesheet
from modules import Modules
from reports import Reports
from financial import Financial
from operational import Operational


# Configurações do RabbitMQ
rabbitmq_host = os.getenv("RABBITMQ_HOST")
if not rabbitmq_host:
    # Se não tiver variável definida, assume localhost
    rabbitmq_host = "localhost"

rabbitmq_port = int(os.getenv("RABBITMQ_PORT", "5672"))
queue_name = "users_rpc_queue"

# Configurações do MySQL
mysql_config = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "123456"),
    "database": os.getenv("MYSQL_DB", "left")
}

# expedidor
def on_request(ch, method, props, body):
    conn = mysql.connector.connect(**mysql_config)
    status = True
    try:
        request = json.loads(body)
        action = request.get("action")
        source = request.get("source")
        data = request.get("data", {})

        print(f"🌀 Requisição recebida origem {source} ação: {action}", flush=True)

        if source == 'users':
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
            elif action == "change_password":
                response = users.change_password(data)

            else:
                response = {"status": False, "message": "invalid action!"}
                status = False

        elif source == 'modules':
            module = Modules(conn)
            if action == 'read':
                response = module.read_modules()
            else:
                response = {"status": False, "message": "invalid action!"}
                status = False

        elif source == 'clients':
            clients = Clients(conn)

            # -----------------------------
            # CLIENTES
            # -----------------------------
            if action == "read":
                response = clients.read_clients()

            elif action == "create":
                response = clients.create_client(data['data'])

            elif action == "update":
                response = clients.update_client(data)

            elif action == "delete":
                response = clients.delete_client(data)

            # -----------------------------
            # CONTATOS  (FALTAVA ESSE BLOCO)
            # -----------------------------
            elif action == "get_contacts":
                response = clients.get_contacts(data["client_id"])

            elif action == "add_contact":
                response = clients.add_contact(data)

            elif action == "delete_contact":
                response = clients.delete_contact(data)

            # -----------------------------
            # CONTRATOS
            # -----------------------------
            elif action == "get_contracts":
                response = clients.get_contracts(data["client_id"])

            elif action == "add_contract":
                response = clients.add_contract(data)

            elif action == "delete_contract":
                response = clients.delete_contract(data)

            # -----------------------------
            # INVOICES
            # -----------------------------
            elif action == "get_invoices":
                response = clients.get_invoices(data["client_id"])

            elif action == "add_invoice":
                response = clients.add_invoice(data)

            elif action == "delete_invoice":
                response = clients.delete_invoice(data)

                # HORAS DO CONTRATO
            elif action == "get_contract_balance":
                response = clients.get_contract_balance(data["contract_id"])

            elif action == "get_contract_history":
                response = clients.get_contract_history(data["contract_id"])

            elif action == "consume_contract_hours":
                response = clients.consume_contract_hours(data)

            elif action == "expire_contract_hours":
                response = clients.expire_old_hours(data["contract_id"])


            else:
                response = {"status": False, "message": "invalid action!"}
                status = False

        elif source == 'calendar':
            calendar = Calendar(conn)
            if action == 'read':
                response = calendar.getCalendar(data)
            elif action == 'create':
                response = calendar.createCalendar(data)
            elif action == 'create_batch':  
                response = calendar.createCalendarBatch(data)
            elif action == 'delete':
                response = calendar.deleteCalendar(data)
            elif action == 'update':
                response = calendar.updateCalendar(data)
            else:
                response = {"status": False, "message": "invalid action!"}
                status = False

        elif source == 'timesheet':
            timesheet = Timesheet(conn)
            if action == 'read':
                response = timesheet.read_timesheet(data)
            elif action == 'save':
                response = timesheet.save_timesheet(data)
            else:
                response = {"status": False, "message": "invalid action!"}
                status = False
        
        elif source == "reports":
            reports = Reports(conn)

            if action == "upload":
                response = reports.upload(data)

            elif action == "list":
                response = reports.list(data)

            elif action == "download":
                response = reports.download(data)

            elif action == "approve":
                response = reports.approve(data)

            elif action == "pending_by_lead":
                response = reports.pending_by_lead(data)
            
            elif action == "list_by_user_status":
                response = reports.list_by_user_status(data)
           
            elif action == "dashboard_totals":
                response = reports.dashboard_totals(data)
            
            elif action == "update_status":
                response = reports.update_status(data)

            else:
                response = {"status": False, "message": "invalid reports action"}
                status = False
        
        elif source == "financial":
            financial = Financial(conn)
            if action=="kpis":
                response = financial.get_kpis()
            else:
                response = {"status": False, "message": "invalid financial action"}
                status = False

        elif source == "operational":
            operational = Operational(conn)
            if action == "hours_by_client":
                response = operational.hours_by_client()
            elif action == "hours_by_resource":
                response = operational.hours_by_resource()
            elif action == "timesheet_resources":
                mes = data.get("mes") 
                ano = data.get("ano")
                response = operational.get_timesheet_resources(mes,ano)

            else:
                response = {"status": False, "message": "invalid operational action"}
                status = False

        

    except Exception as e:
        response = {"status": False, "message": str(e)}
        status = False
    if status:
        print(f'👍 {source},{action}')
    else:
        print(f'🙅 {source},{action}')
    ch.basic_publish(
        exchange='',
        routing_key=props.reply_to,
        properties=pika.BasicProperties(correlation_id=props.correlation_id),
        body=json.dumps(response, default=str)
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)


# Conexão RabbitMQ com retry
connection = None
while connection is None:
    try:
        print(f"Tentando conectar ao RabbitMQ em {rabbitmq_host}:{rabbitmq_port}...", flush=True)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=rabbitmq_host, port=rabbitmq_port)
        )
        print("✅ Conectado ao RabbitMQ", flush=True)
    except pika.exceptions.AMQPConnectionError:
        print("❌ RabbitMQ não está pronto, tentando novamente em 5s...", flush=True)
        time.sleep(5)

channel = connection.channel()
channel.queue_declare(queue=queue_name)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue=queue_name, on_message_callback=on_request)

print("🕰️  Aguardando requisições RPC...", flush=True)
channel.start_consuming()
