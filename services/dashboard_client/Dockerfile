FROM node:18-alpine

# Configuración de entorno
ENV NODE_ENV=production

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --production

# Copiar código fuente
COPY src ./src
COPY public ./public

# Variables y puerto
ENV PORT=8080
EXPOSE 8080

# Ejecutar el servicio usando node
CMD ["node", "src/server.js"]