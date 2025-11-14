FROM node:18

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Executa o servidor
CMD ["node", "server.js"]
