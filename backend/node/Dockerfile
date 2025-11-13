FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd dos2unix && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Convertir finales de linea y dar permisos de ejecucion
RUN dos2unix wait-for-db.sh && chmod +x wait-for-db.sh

EXPOSE 3000

CMD ["./wait-for-db.sh", "node", "index.js"]
