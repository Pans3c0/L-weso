#!/bin/bash

# ===============================================
# SCRIPT DE DESPLIEGUE AUTOMATIZADO PARA L-WESO
# ===============================================
#
# Este script automatiza los siguientes pasos:
# 1. Construye la imagen de Docker de la aplicación.
# 2. Transfiere la imagen al servidor remoto.
# 3. Se conecta al servidor remoto vía SSH.
# 4. Carga la imagen de Docker en el servidor.
# 5. Detiene y elimina cualquier contenedor antiguo.
# 6. Crea un directorio persistente para la base de datos si no existe.
# 7. Inicia un nuevo contenedor con las variables de entorno y el volumen de datos.
# 8. Inicia ngrok para exponer la aplicación.

set -e # Termina el script si algún comando falla

# ----------------- CONFIGURACIÓN -----------------
# ¡IMPORTANTE! Rellena estas variables antes de ejecutar.
# -------------------------------------------------
REMOTE_USER="tu_usuario_remoto"                   # Ejemplo: root, ubuntu, etc.
REMOTE_HOST="tu_ip_del_servidor"                  # La dirección IP de tu servidor
DOCKER_IMAGE_NAME="l-weso-app"                    # Nombre para la imagen de Docker
DOCKER_IMAGE_TAG="latest"                         # Tag para la imagen

# Variables de entorno para el contenedor
export SELLER_REGISTRATION_CODE="TU_CODIGO_MAESTRO_AQUI"
export NEXT_PUBLIC_VAPID_PUBLIC_KEY="TU_CLAVE_PUBLICA_VAPID_AQUI"
export VAPID_PRIVATE_KEY="TU_CLAVE_PRIVADA_VAPID_AQUI"

# ----------------- PASO 1: CONSTRUCCIÓN LOCAL -----------------
echo ">>> (1/5) Construyendo la imagen de Docker: $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG..."
docker build -t $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG .
echo ">>> ¡Imagen construida con éxito!"

# ----------------- PASO 2: GUARDAR Y TRANSFERIR IMAGEN -----------------
echo ">>> (2/5) Guardando la imagen para transferirla..."
docker save $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG > ${DOCKER_IMAGE_NAME}.tar
echo ">>> (3/5) Transfiriendo la imagen a $REMOTE_HOST..."
scp ${DOCKER_IMAGE_NAME}.tar $REMOTE_USER@$REMOTE_HOST:/tmp/${DOCKER_IMAGE_NAME}.tar
echo ">>> ¡Transferencia completada!"

# ----------------- PASO 3: DESPLIEGUE REMOTO -----------------
echo ">>> (4/5) Conectando a $REMOTE_HOST para el despliegue..."

# Usamos sshpass para pasar la contraseña de forma no interactiva.
# Asegúrate de tenerlo instalado: sudo apt-get install sshpass
sshpass -p 'pacheco' ssh $REMOTE_USER@$REMOTE_HOST << EOF
  set -e
  echo ">>> Conectado al servidor. Desplegando..."

  echo ">>> Cargando la imagen de Docker desde el archivo .tar..."
  docker load < /tmp/${DOCKER_IMAGE_NAME}.tar

  echo ">>> Deteniendo y eliminando contenedor antiguo (si existe)..."
  docker stop $DOCKER_IMAGE_NAME || true
  docker rm $DOCKER_IMAGE_NAME || true

  echo ">>> Asegurando que el directorio de datos persistente exista..."
  mkdir -p /data/apps/l-weso

  echo ">>> Iniciando nuevo contenedor..."
  docker run -d \
    --name $DOCKER_IMAGE_NAME \
    -p 80:3000 \
    -v /data/apps/l-weso:/app/src/lib/db \
    -e SELLER_REGISTRATION_CODE="$SELLER_REGISTRATION_CODE" \
    -e NEXT_PUBLIC_VAPID_PUBLIC_KEY="$NEXT_PUBLIC_VAPID_PUBLIC_KEY" \
    -e VAPID_PRIVATE_KEY="$VAPID_PRIVATE_KEY" \
    --restart always \
    $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG

  echo ">>> ¡Contenedor desplegado y corriendo!"
  
  echo ">>> Limpiando archivos temporales..."
  rm /tmp/${DOCKER_IMAGE_NAME}.tar

  echo ">>> ¡Despliegue remoto completado con éxito!"
EOF

# ----------------- PASO 4: INICIAR NGROK -----------------
echo ">>> (5/5) Conectando para iniciar ngrok..."
sshpass -p 'pacheco' ssh $REMOTE_USER@$REMOTE_HOST << EOF
  set -e
  echo ">>> Iniciando ngrok en el puerto 80..."
  # Detiene cualquier proceso ngrok anterior para evitar conflictos
  killall ngrok || true
  # Inicia ngrok en segundo plano y redirige la salida para que no bloquee el script
  nohup ngrok http 80 > /dev/null 2>&1 &
  sleep 5 # Espera un poco para que ngrok se inicie y genere la URL
  echo ">>> ngrok iniciado. Revisa la URL en tu dashboard de ngrok."
EOF

# ----------------- PASO 5: LIMPIEZA LOCAL -----------------
echo ">>> Limpiando archivo .tar local..."
rm ${DOCKER_IMAGE_NAME}.tar

echo "========================================="
echo "¡DESPLIEGUE COMPLETADO!"
echo "========================================="
