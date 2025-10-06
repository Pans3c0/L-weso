'use server';

import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

// This API route handles the image upload.
// The client will compress the image before sending it, so we don't need a large body size limit here.
// However, to be safe, we set a reasonable limit.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb', // A bit over 1MB to be safe after compression and encoding
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
    
    // The size check is now less critical due to client-side compression, but good to have.
    if (imageFile.size > 2 * 1024 * 1024) { // 2MB
        return NextResponse.json({ success: false, error: 'El archivo excede el límite de 2 MB.' }, { status: 413 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'images');
    await fs.ensureDir(uploadDir);

    const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
    // Create a unique filename to avoid collisions
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, fileBuffer);
    
    // Return the relative URL, which is the most robust way
    const newImageUrl = `/images/${fileName}`;

    return NextResponse.json({ success: true, url: newImageUrl });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return NextResponse.json({ success: false, error: 'No se pudo subir la imagen en el servidor.' }, { status: 500 });
  }
}
