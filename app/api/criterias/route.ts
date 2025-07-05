import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { criteriaSchema } from '@/lib/validations';

export async function GET() {
  try {
    let criterias = await prisma.criteria.findMany({
      orderBy: { id: 'asc' }
    });
    
    // Jika belum ada kriteria, buat kriteria default
    if (criterias.length === 0) {
      const defaultCriterias = [
        { nama: 'Harga', bobot: 25, tipe: 'cost' as const },
        { nama: 'Jarak', bobot: 25, tipe: 'cost' as const },
        { nama: 'Fasilitas', bobot: 25, tipe: 'benefit' as const },
        { nama: 'Transportasi', bobot: 25, tipe: 'benefit' as const },
      ];
      
      await prisma.criteria.createMany({
        data: defaultCriterias
      });
      
      criterias = await prisma.criteria.findMany({
        orderBy: { id: 'asc' }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: criterias
    });
  } catch (error) {
    console.error('Error fetching criterias:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal mengambil data kriteria' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    const validatedData = criteriaSchema.parse(body);
    
    // Update semua kriteria dalam satu transaksi
    await prisma.$transaction(async (tx) => {
      for (const criteria of validatedData.criterias) {
        await tx.criteria.update({
          where: { id: criteria.id },
          data: {
            bobot: criteria.bobot
          }
        });
      }
    });
    
    const updatedCriterias = await prisma.criteria.findMany({
      orderBy: { id: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedCriterias,
      message: 'Bobot kriteria berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating criterias:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data tidak valid', 
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal memperbarui kriteria' 
      },
      { status: 500 }
    );
  }
}
