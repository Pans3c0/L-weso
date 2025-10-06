'use server';

import {NextResponse} from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime-types';

export async function GET(request: Request, {params}: {params: {filename: string[]}}) {
  const filename = params.filename.join('/');
  const filePath = path.join(process.cwd(), 'public', 'images', filename);

  try {
    const fileExists = await fs.pathExists(filePath);
    if (!fileExists) {
      return new NextResponse('Image not found', {status: 404});
    }

    const fileBuffer = await fs.readFile(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Length', fileBuffer.length.toString());

    return new NextResponse(fileBuffer, {status: 200, headers});
  } catch (error) {
    console.error(`Failed to serve image ${filename}:`, error);
    return new NextResponse('Internal Server Error', {status: 500});
  }
}
