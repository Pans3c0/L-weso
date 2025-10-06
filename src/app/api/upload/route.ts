'use server';

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs-extra';

// CONFIGURACIÓN CLAVE:
// Aumenta el límite de tamaño del cuerpo de la petición para esta ruta API.
// Esta es la forma garantizada de que funcione en producción.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('imageFile') as File | null;

    if (!imageFile) {
      return NextResponse.json({ success: false, error: 'No se ha enviado ningún archivo.' }, { status: 400 });
    }

    // Directorio de subida (funciona tanto en desarrollo como en producción Docker)
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    await fs.ensureDir(uploadDir);

    // Nombre de archivo único
    const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);

    // Guardar el archivo
    await fs.writeFile(filePath, fileBuffer);

    // Construir y devolver la URL pública relativa. Es más robusto que construir una URL absoluta.
    const publicUrl = `/images/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error: any) {
    // Manejar el error de límite de tamaño específico que puede ocurrir
    if (error.type === 'entity.too.large' || (error.message && error.message.includes('body exceeded'))) {
        return NextResponse.json(
            { success: false, error: `El archivo es demasiado grande. El límite es de 10 MB.` },
            { status: 413 } // 413 Payload Too Large
        );
    }

    console.error('Error al subir la imagen:', error);
    return NextResponse.json(
        { success: false, error: 'Error interno del servidor al subir la imagen.' },
        { status: 500 }
    );
  }
}
