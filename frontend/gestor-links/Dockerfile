FROM node:18

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o restante do projeto
COPY . .

# Executa o Angular em modo dev
CMD ["npm", "run", "start:docker"]
