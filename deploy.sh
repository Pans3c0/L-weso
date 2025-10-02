#!/bin/bash

# --- CONFIGURACIÓN ---
# La IP de tu servidor
SERVER_IP="192.168.0.12"
# Tu nombre de usuario en el servidor
SERVER_USER="pacheco"
# Nombre base de la imagen (ej: l-weso)
IMAGE_BASE_NAME="l-weso"
# Puerto interno de tu app React (generalmente 3000)
CONTAINER_PORT="3000"
# Puerto externo del servidor (donde quieres que se acceda, ej: 80)
HOST_PORT="80"
# ---------------------

# --- VERIFICACIÓN DE ENTRADA ---
if [ -z "$1" ]; then
    echo "ERROR: Debes proporcionar el número de versión (ej: ./deploy.sh 1.0.5)"
    exit 1
fi

NEW_VERSION="$1"
IMAGE_TAG="${IMAGE_BASE_NAME}:${NEW_VERSION}"
TAR_FILE="${IMAGE_BASE_NAME}_v${NEW_VERSION}.tar"
OLD_CONTAINER_NAME="${IMAGE_BASE_NAME}"

echo "=================================================="
echo " INICIO DE DESPLIEGUE AUTOMATIZADO"
echo "=================================================="
echo "Versión a construir: $NEW_VERSION"
echo "Nombre de la imagen: $IMAGE_TAG"
echo "Archivo TAR: $TAR_FILE"
echo "--------------------------------------------------"

# --- PASO 1: CONSTRUIR LA IMAGEN LOCALMENTE (FORZANDO SIN CACHÉ) ---
echo "1. Construyendo la imagen de Docker localmente (forzando --no-cache)..."
# El flag --no-cache asegura que los archivos JSON se copien de nuevo.
docker build --no-cache -t "$IMAGE_TAG" .

if [ $? -ne 0 ]; then
    echo "ERROR: Falló la construcción de la imagen de Docker. Abortando."
    exit 1
fi
echo "   -> Imagen construida con éxito."
echo "--------------------------------------------------"


# --- PASO 2: EXPORTAR LA IMAGEN A UN ARCHIVO TAR ---
echo "2. Exportando la imagen a $TAR_FILE..."
docker save "$IMAGE_TAG" > "$TAR_FILE"
if [ $? -ne 0 ]; then
    echo "ERROR: Falló la exportación de la imagen. Abortando."
    exit 1
fi
echo "   -> Exportación completa."
echo "--------------------------------------------------"


# --- PASO 3: COPIAR EL ARCHIVO TAR AL SERVIDOR ---
echo "3. Copiando $TAR_FILE al servidor $SERVER_IP..."
scp "$TAR_FILE" "${SERVER_USER}@${SERVER_IP}:/home/${SERVER_USER}/"
if [ $? -ne 0 ]; then
    echo "ERROR: Falló la copia SCP. Asegúrate de que el servidor está encendido y el SSH funciona."
    exit 1
fi
echo "   -> Copia SSH completa."
echo "--------------------------------------------------"


# --- PASO 4: EJECUTAR COMANDOS EN EL SERVIDOR REMOTO ---
echo "4. Ejecutando comandos de Docker en el servidor remoto..."

SSH_COMMANDS="
# Cargar la nueva imagen
echo '   -> Cargando la imagen $IMAGE_TAG...'
docker load < /home/${SERVER_USER}/$TAR_FILE

# Detener y eliminar el contenedor antiguo
echo '   -> Deteniendo y eliminando el contenedor antiguo ($OLD_CONTAINER_NAME)...'
docker stop $OLD_CONTAINER_NAME 2>/dev/null || true
docker rm $OLD_CONTAINER_NAME 2>/dev/null || true

# Eliminar el archivo .tar cargado (limpieza)
echo '   -> Limpiando archivo TAR...'
rm /home/${SERVER_USER}/$TAR_FILE

# Lanzar el nuevo contenedor
echo '   -> Lanzando el nuevo contenedor $OLD_CONTAINER_NAME...'
docker run -d \\
    --restart always \\
    --name $OLD_CONTAINER_NAME \\
    -p ${HOST_PORT}:${CONTAINER_PORT} \\
    $IMAGE_TAG
"

# Ejecutar el bloque de comandos a través de SSH
ssh "${SERVER_USER}@${SERVER_IP}" "$SSH_COMMANDS"

if [ $? -ne 0 ]; then
    echo "ERROR: Falló la ejecución de comandos SSH. Revisa la salida en el servidor."
    exit 1
fi
echo "--------------------------------------------------"

# --- FINALIZACIÓN ---
echo "=================================================="
echo " ✅ DESPLIEGUE FINALIZADO CON ÉXITO: $IMAGE_TAG"
echo "   -> Contenedor '$OLD_CONTAINER_NAME' corriendo en $SERVER_IP:$HOST_PORT"
echo "=================================================="
