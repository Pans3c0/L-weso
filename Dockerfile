# ETAPA 1: BUILD - Compilación (PC potente)
FROM node:18-alpine AS builder

# 1. Copia el paquete y el lock file
WORKDIR /app
COPY package.json .
COPY package-lock.json .

# 2. Instala solo las dependencias de producción (para optimizar)
# Las de desarrollo se instalarán en la etapa de build, pero se limpiarán después
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

# 1. Copia el package.json original (Necesario para 'npm start' y dependencias)
# Lo copiamos desde la carpeta original (builder) antes de que se corrompa
COPY package.json .

# 2. Instala *solo* las dependencias de producción en la etapa RUNNER
RUN npm install --only=production

# 3. Copia los archivos necesarios desde la etapa BUILDER:
# - El core de la aplicación compilada
COPY --from=builder /app/.next ./.next

# - Los activos estáticos (la carpeta 'public' debe existir en tu repo local para que esto funcione)
COPY --from=builder /app/public ./public

# Configuración y ejecución
EXPOSE 3000
CMD ["npm", "start"]

