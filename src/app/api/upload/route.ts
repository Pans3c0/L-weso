'use server';

import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

// This API route handles the image upload.
// The client compresses the image before sending it, so we don't need a large body size limit here.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb', // Keep a safe limit just in case
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
    
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    await fs.ensureDir(uploadDir);

    const fileBuffer = Buffer.from(await imageFile.arrayBuffer());

    // --- FIX: Robust Unique Filename Generation ---
    // Get the original file extension safely
    const fileExtension = path.extname(imageFile.name) || '.jpg'; // Fallback to .jpg
    // Generate a unique suffix using timestamp and a random number
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    // Combine to create the new filename
    const fileName = `upload-${uniqueSuffix}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    // --- END FIX ---

    await fs.writeFile(filePath, fileBuffer);
    
    const newImageUrl = `/images/${fileName}`;

    return NextResponse.json({ success: true, url: newImageUrl });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return NextResponse.json({ success: false, error: 'No se pudo subir la imagen en el servidor.' }, { status: 500 });
  }
}
