import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
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
    
    await prisma.alternative.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Alternatif berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting alternative:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal menghapus alternatif' 
      },
      { status: 500 }
    );
  }
}
