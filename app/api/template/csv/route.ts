import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'contoh-data-perumahan.csv');
    const fileBuffer = await fs.readFile(filePath);
    
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', 'attachment; filename="contoh-data-perumahan.csv"');
    
    return response;
  } catch (error) {
    console.error('Error serving CSV file:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'File contoh tidak ditemukan' 
      },
      { status: 404 }
    );
  }
}
