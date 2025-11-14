import express from "express";
import bodyParser from "body-parser";
import amqp from "amqplib";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// const RABBITMQ_URL = "amqp://localhost";
const rabbitHost = process.env.RABBITMQ_HOST || "rabbitmq-compose";
const rabbitPort = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_URL = `amqp://${rabbitHost}:${rabbitPort}`;

const QUEUE_NAME = "users_rpc_queue";

let channel;

// Função para enviar RPC para o RabbitMQ
async function sendRpcMessage(message) {
  const correlationId = Math.random().toString();
  const replyQueue = await channel.assertQueue("", { exclusive: true });
    console.log("📤 Enviando mensagem:", message, "correlationId:", correlationId);


  return new Promise((resolve) => {
    channel.consume(
      replyQueue.queue,
      (msg) => {
        if (msg.properties.correlationId === correlationId) {
            console.log("📥 Resposta recebida:", msg.content.toString());
          resolve(JSON.parse(msg.content.toString()));
        }
      },
      { noAck: true }
    );

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      correlationId,
      replyTo: replyQueue.queue,
    });
  });
}

// Rotas REST users
app.get("/users", async (req, res) => {
  const response = await sendRpcMessage({ 
    source: "users",
    action: "read" });
  res.json(response);
});

app.get("/users/:id", async (req, res) => {
  const response = await sendRpcMessage({
    source: "users",
    action: "read_by_id",
    data: { id: parseInt(req.params.id) }
  });
  res.json(response);
});


app.post("/users", async (req, res) => {
  const response = await sendRpcMessage({ 
    source: "users",
    action: "create", data: req.body });
  res.json(response);
});

app.put("/users/:id", async (req, res) => {
  const response = await sendRpcMessage({
    
    source: "users",
    action: "update",
    data: { id: parseInt(req.params.id), ...req.body },
  });
  res.json(response);
});

app.delete("/users/:id", async (req, res) => {
  const response = await sendRpcMessage({
    
    source: "users",
    action: "delete",
    data: { id: parseInt(req.params.id) },
  });
  res.json(response);
});


// Rotas REST clients
app.get("/clients", async (req, res) => {
  const response = await sendRpcMessage({ 
    source: "clients",
    action: "read" });
  res.json(response);
});

app.post("/clients", async (req, res) => {
  const response = await sendRpcMessage({ 
    source: "clients",
    action: "create", data: req.body });
  res.json(response);
});

app.put("/clients/:id", async (req, res) => {
  const response = await sendRpcMessage({
    
    source: "clients",
    action: "update",
    data: { id: parseInt(req.params.id), ...req.body },
  });
  res.json(response);
});

app.delete("/clients/:id", async (req, res) => {
  const response = await sendRpcMessage({
    
    source: "clients",
    action: "delete",
    data: { id: parseInt(req.params.id) },
  });
  res.json(response);
});


//Rotas Calendar
app.get("/calendar", async (req, res) => {
  const origType = req.query.type; // 'cliente' ou 'recurso'
  const clientId = parseInt(req.query.id);

  if (!origType || isNaN(clientId)) {
    return res.status(400).json({ error: "Parâmetros 'type' e 'id' são obrigatórios" });
  }

  const response = await sendRpcMessage({ 
    source: "calendar",
    action: "read",
    data: { 
      type: origType,
      id: clientId
    }
  });

  res.json(response);
});

app.post("/calendar", async (req, res) => {
  const response = await sendRpcMessage({ 
    source: "calendar",
    action: "create", data: req.body });
  res.json(response);
});
app.put("/calendar", async (req, res) => {
  const response = await sendRpcMessage({ 
    source: "calendar",
    action: "update", data: req.body });
  res.json(response);
});

app.delete("/calendar", async (req, res) => {
  const response = await sendRpcMessage({ 
    source: "calendar",
    action: "delete", data: req.body });
  res.json(response);
});


// Rotas Timesheet

// Buscar timesheet da semana
app.post("/timesheet/read", async (req, res) => {
  const response = await sendRpcMessage({
    source: "timesheet",
    action: "read",
    data: req.body
  });
  res.json(response);
});

// Salvar lançamentos
app.post("/timesheet/save", async (req, res) => {
  const response = await sendRpcMessage({
    source: "timesheet",
    action: "save",
    data: req.body
  });
  res.json(response);
});

// Enviar para aprovação
app.post("/timesheet/submit", async (req, res) => {
  const response = await sendRpcMessage({
    source: "timesheet",
    action: "submit",
    data: req.body
  });
  res.json(response);
});

// Aprovar timesheet
app.post("/timesheet/approve", async (req, res) => {
  const response = await sendRpcMessage({
    source: "timesheet",
    action: "approve",
    data: req.body
  });
  res.json(response);
});

// Rejeitar timesheet
app.post("/timesheet/reject", async (req, res) => {
  const response = await sendRpcMessage({
    source: "timesheet",
    action: "reject",
    data: req.body
  });
  res.json(response);
});

// Listar pendentes
app.get("/timesheet/pending", async (req, res) => {
  const response = await sendRpcMessage({
    source: "timesheet",
    action: "list_pending",
    data: {}
  });
  res.json(response);
});


// Rota de login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: false, message: "Email e senha são obrigatórios" });
  }

  try {
    const response = await sendRpcMessage({
      source: "users",
      action: "login",
      data: { email, password }
    });

    res.json(response);
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ status: false, message: "Erro interno no servidor" });
  }
});


//Rotas Módulos
app.get("/modules", async (req, res) => {
  const response = await sendRpcMessage({
    source: "modules",
    action: "read"
  });
  res.json(response);
});





async function connectRabbitMQ() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    channel = await conn.createChannel();
    console.log("✅ Conectado ao RabbitMQ");

    app.listen(3000, () => {
      console.log("🚀 API rodando em http://localhost:3000");
    });
  } catch (err) {
    console.error("❌ Erro ao conectar no RabbitMQ:", err.message);
    setTimeout(connectRabbitMQ, 5000); // tenta novamente após 5 segundos
  }
}

connectRabbitMQ();
