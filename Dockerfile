# ETAPA 1: BUILD - Compilación (PC potente)
FROM node:18-alpine AS builder

# 1. Copia el paquete y el lock file
WORKDIR /app
COPY package.json .
COPY package-lock.json .

# 2. Instala solo las dependencias de producción (para optimizar)
RUN npm install

# 3. Copia el resto del código y construye la aplicación
COPY . .
RUN npm run build

# --------------------------------------------------------------------------
# ETAPA 2: RUNTIME - Ejecución ligera (Servidor 2GB RAM)
FROM node:18-alpine AS runner

# Variables de entorno
ENV NODE_ENV production
WORKDIR /app

# 1. Copia el package.json original
COPY package.json .

# 2. Instala *solo* las dependencias de producción en la etapa RUNNER
RUN npm install ---omit=dev

# 3. Copia los archivos necesarios desde la etapa BUILDER:
# - El core de la aplicación compilada
COPY --from=builder /app/.next ./.next

# - Los activos estáticos (la carpeta 'public' debe existir en tu repo local para que esto funcione)
COPY --from=builder /app/public ./public

# >>>>>>>>>>>>>>>>>> LÍNEA CORREGIDA PARA COPIAR LOS JSON <<<<<<<<<<<<<<<<<<<<
# COPIA EXPLÍCITA DE LA CARPETA QUE CONTIENE TUS ARCHIVOS JSON
COPY --from=builder /app/src/lib/db ./src/lib/db
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# Configuración y ejecución
EXPOSE 3000
CMD ["npm", "start"]

