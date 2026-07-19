import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang ditemukan.' }, { status: 400 });
    }

    if (!file.name.endsWith('.chm') && !file.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'Hanya file .chm atau .zip yang diizinkan.' }, { status: 400 });
    }

    // Prepare upload directory
    const uploadDir = path.join(process.cwd(), 'chm-uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, file.name);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePath, buffer);

    // Note: To automatically extract the CHM and add it to index.json, 
    // we would need a native dependency (like extract-chm) or we just instruct 
    // the user to run `node parse_chm.js` after extracting manually, 
    // which is the current workflow.

    return NextResponse.json({ 
      success: true, 
      message: 'File berhasil disimpan.',
      path: filePath
    });
    
  } catch (error) {
    console.error('Error during file upload:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal.' }, { status: 500 });
  }
}
