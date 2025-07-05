import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { alternativeSchema } from '@/lib/validations';

export async function GET() {
  try {
    const alternatives = await prisma.alternative.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      data: alternatives
    });
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal mengambil data alternatif' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    const validatedData = alternativeSchema.parse(body);
    
    const alternative = await prisma.alternative.create({
      data: validatedData
    });
    
    return NextResponse.json({
      success: true,
      data: alternative,
      message: 'Alternatif perumahan berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error creating alternative:', error);
    
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
        error: 'Gagal menambahkan alternatif' 
      },
      { status: 500 }
    );
  }
}
