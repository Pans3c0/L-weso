'use server';

import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

// CONFIGURACIÓN CLAVE:
// Aumenta el límite de tamaño del cuerpo de la petición para esta ruta API.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('imageFile') as File | null;

    if (!imageFile) {
      return NextResponse.json({ success: false, error: 'No se proporcionó ningún archivo.' }, { status: 400 });
    }

    if (imageFile.size > 10 * 1024 * 1024) { // 10MB
        return NextResponse.json({ success: false, error: 'El archivo excede el límite de 10 MB.' }, { status: 413 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'images');
    await fs.ensureDir(uploadDir);

    const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, fileBuffer);
    const newImageUrl = `/images/${fileName}`;

    return NextResponse.json({ success: true, url: newImageUrl });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return NextResponse.json({ success: false, error: 'No se pudo subir la imagen en el servidor.' }, { status: 500 });
  }
}
