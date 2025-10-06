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

    // Directorio de subida
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    await fs.ensureDir(uploadDir);

    // Nombre de archivo único
    const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);

    // Guardar el archivo
    await fs.writeFile(filePath, fileBuffer);

    // Construir y devolver la URL pública relativa
    const publicUrl = `/images/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error: any) {
    if (error.type === 'entity.too.large' || (error.message && error.message.includes('body exceeded'))) {
        return NextResponse.json(
            { success: false, error: `El archivo es demasiado grande. El límite es de 10 MB.` },
            { status: 413 }
        );
    }
    console.error('Error al subir la imagen:', error);
    return NextResponse.json(
        { success: false, error: 'Error interno del servidor al subir la imagen.' },
        { status: 500 }
    );
  }
}
