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

# Ejecutar el worker usando node
CMD ["node", "src/index.js"]