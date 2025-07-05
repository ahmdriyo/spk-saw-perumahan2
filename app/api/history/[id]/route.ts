import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID tidak valid' 
        },
        { status: 400 }
      );
    }
    
    const history = await prisma.history.findUnique({
      where: { id }
    });
    
    if (!history) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Riwayat tidak ditemukan' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching history detail:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal mengambil detail riwayat' 
      },
      { status: 500 }
    );
  }
}
