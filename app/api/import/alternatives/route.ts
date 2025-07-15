import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { z } from 'zod';

// Schema untuk validasi data dari file
const alternativeFromFileSchema = z.object({
  namaPerumahan: z.string().min(1, 'Nama perumahan harus diisi'),
  lokasi: z.string().min(1, 'Lokasi harus diisi'),
  harga: z.number().positive('Harga harus lebih dari 0'),
  jarak: z.number().positive('Jarak harus lebih dari 0'),
  fasilitas: z.number().int().min(1, 'Skor fasilitas minimal 1').max(10, 'Skor fasilitas maksimal 10'),
  transportasi: z.number().int().min(1, 'Skor transportasi minimal 1').max(10, 'Skor transportasi maksimal 10'),
  gambar: z.string().optional().nullable(),
});

function parseExcelData(buffer: Buffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  return jsonData as Record<string, unknown>[];
}

function parseCSVData(text: string) {
  const lines = text.split('\n');
  if (lines.length < 2) {
    throw new Error('File CSV harus memiliki minimal 2 baris (header + data)');
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      data.push(row);
    }
  }
  
  return data;
}

function normalizeData(rawData: Record<string, unknown>[]): Record<string, unknown>[] {
  return rawData.map(item => {
    // Normalize column names to match our schema
    const normalized: Record<string, unknown> = {};
    
    Object.keys(item).forEach(key => {
      const lowerKey = key.toLowerCase().replace(/\s+/g, '');
      
      if (lowerKey.includes('nama') || lowerKey.includes('perumahan')) {
        normalized.namaPerumahan = String(item[key]);
      } else if (lowerKey.includes('lokasi') || lowerKey.includes('alamat')) {
        normalized.lokasi = String(item[key]);
      } else if (lowerKey.includes('harga') || lowerKey.includes('price')) {
        normalized.harga = parseFloat(String(item[key]).replace(/[^\d.-]/g, ''));
      } else if (lowerKey.includes('jarak') || lowerKey.includes('distance')) {
        normalized.jarak = parseFloat(String(item[key]).replace(/[^\d.-]/g, ''));
      } else if (lowerKey.includes('fasilitas') || lowerKey.includes('facility')) {
        normalized.fasilitas = parseInt(String(item[key]).replace(/[^\d]/g, ''));
      } else if (lowerKey.includes('transportasi') || lowerKey.includes('transport')) {
        normalized.transportasi = parseInt(String(item[key]).replace(/[^\d]/g, ''));
      } else if (lowerKey.includes('gambar') || lowerKey.includes('image') || lowerKey.includes('foto') || lowerKey.includes('photo')) {
        const imageValue = String(item[key]).trim();
        normalized.gambar = imageValue && imageValue !== '' ? imageValue : null;
      }
    });
    
    return normalized;
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File tidak ditemukan' 
        },
        { status: 400 }
      );
    }
    
    // Validasi tipe file
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipe file tidak didukung. Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)' 
        },
        { status: 400 }
      );
    }
    
    let rawData: Record<string, unknown>[];
    
    if (file.type === 'text/csv') {
      const text = await file.text();
      rawData = parseCSVData(text);
    } else {
      const buffer = Buffer.from(await file.arrayBuffer());
      rawData = parseExcelData(buffer);
    }
    
    if (rawData.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File tidak berisi data' 
        },
        { status: 400 }
      );
    }
    
    // Normalize dan validasi data
    const normalizedData = normalizeData(rawData);
    const validatedData = [];
    const errors = [];
    
    for (let i = 0; i < normalizedData.length; i++) {
      try {
        const validated = alternativeFromFileSchema.parse(normalizedData[i]);
        validatedData.push(validated);
      } catch (error) {
        errors.push({
          row: i + 2, // +2 karena index 0 + header row
          data: normalizedData[i],
          error: error instanceof Error ? error.message : 'Data tidak valid'
        });
      }
    }
    
    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Beberapa data tidak valid',
          details: errors,
          validData: validatedData
        },
        { status: 400 }
      );
    }
    
    // Simpan data ke database
    const savedAlternatives = await prisma.alternative.createMany({
      data: validatedData,
      skipDuplicates: true
    });
    
    return NextResponse.json({
      success: true,
      data: {
        imported: savedAlternatives.count,
        total: validatedData.length
      },
      message: `Berhasil mengimpor ${savedAlternatives.count} data alternatif dari file`
    });
    
  } catch (error) {
    console.error('Error importing file:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal mengimpor file' 
      },
      { status: 500 }
    );
  }
}
