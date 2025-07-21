import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { z } from 'zod';

// Schema untuk validasi data dari file
const alternativeFromFileSchema = z.object({
  nama: z.string().min(1, 'Nama perumahan harus diisi'),
  lokasi: z.string().min(1, 'Lokasi harus diisi'),
  gambar: z.string().optional().nullable(),
  values: z.record(z.string(), z.number()).optional(),
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

function normalizeData(rawData: Record<string, unknown>[], criterias: { id: number; nama: string; tipe: string; bobot: number }[]): Record<string, unknown>[] {
  return rawData.map(item => {
    // Normalize column names to match our schema
    const normalized: Record<string, unknown> = {
      values: {}
    };
    
    Object.keys(item).forEach(key => {
      const lowerKey = key.toLowerCase().replace(/\s+/g, '');
      
      if (lowerKey.includes('nama') || lowerKey.includes('perumahan')) {
        normalized.nama = String(item[key]);
      } else if (lowerKey.includes('lokasi') || lowerKey.includes('alamat')) {
        normalized.lokasi = String(item[key]);
      } else if (lowerKey.includes('gambar') || lowerKey.includes('image') || lowerKey.includes('foto') || lowerKey.includes('photo')) {
        const imageValue = String(item[key]).trim();
        normalized.gambar = imageValue && imageValue !== '' ? imageValue : null;
      } else {
        // Check if this key matches any criteria name
        const matchingCriteria = criterias.find(c => 
          c.nama.toLowerCase().replace(/\s+/g, '') === lowerKey ||
          key.toLowerCase() === c.nama.toLowerCase()
        );
        
        if (matchingCriteria) {
          const numericValue = parseFloat(String(item[key]).replace(/[^\d.-]/g, ''));
          if (!isNaN(numericValue)) {
            (normalized.values as Record<string, number>)[matchingCriteria.id.toString()] = numericValue;
          }
        }
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

    // Get all criterias first
    const criterias = await prisma.criteria.findMany({
      orderBy: { id: 'asc' }
    });

    if (criterias.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tidak ada kriteria yang ditemukan. Tambahkan kriteria terlebih dahulu.' 
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
    const normalizedData = normalizeData(rawData, criterias);
    const validatedData: { nama: string; lokasi: string; gambar?: string | null; values: Record<string, number> }[] = [];
    const errors = [];
    
    for (let i = 0; i < normalizedData.length; i++) {
      try {
        const validated = alternativeFromFileSchema.parse(normalizedData[i]);
        
        // Ensure all criteria have values
        const valuesMap: Record<string, number> = {};
        criterias.forEach(criteria => {
          const value = validated.values?.[criteria.id.toString()];
          valuesMap[criteria.id.toString()] = value || 0;
        });
        
        validatedData.push({
          ...validated,
          values: valuesMap
        });
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
    
    // Simpan data ke database dengan transaction
    const result = await prisma.$transaction(async (prismaTransaction) => {
      const savedAlternatives = [];
      
      for (const data of validatedData) {
        // Create alternative
        const alternative = await prismaTransaction.alternative.create({
          data: {
            nama: data.nama,
            lokasi: data.lokasi,
            gambar: data.gambar || null,
          }
        });
        
        // Create alternative values
        const valuePromises = Object.entries(data.values).map(([criteriaId, nilai]) => 
          prismaTransaction.alternativeValue.create({
            data: {
              alternativeId: alternative.id,
              criteriaId: parseInt(criteriaId),
              nilai: Number(nilai)
            }
          })
        );
        
        await Promise.all(valuePromises);
        savedAlternatives.push(alternative);
      }
      
      return savedAlternatives;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        imported: result.length,
        total: validatedData.length
      },
      message: `Berhasil mengimpor ${result.length} data alternatif dari file`
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
