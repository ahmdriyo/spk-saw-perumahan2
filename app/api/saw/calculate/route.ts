import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SAWCalculator } from '@/lib/saw-calculator';
import { sawCalculationSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    const validatedData = sawCalculationSchema.parse(body);
    
    // Inisialisasi SAW Calculator
    const calculator = new SAWCalculator(
      validatedData.alternatives,
      validatedData.criterias
    );
    
    // Jalankan perhitungan SAW
    const result = calculator.calculate();
    
    // Simpan hasil ke tabel history
    const historyRecord = await prisma.history.create({
      data: {
        hasil: JSON.parse(JSON.stringify(result)), // Convert to plain object for JSON storage
        alternatifTerbaik: result.bestAlternative.namaPerumahan
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        historyId: historyRecord.id
      },
      message: 'Perhitungan SAW berhasil dan hasil disimpan ke riwayat'
    });
  } catch (error) {
    console.error('Error calculating SAW:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal melakukan perhitungan SAW' 
      },
      { status: 500 }
    );
  }
}
