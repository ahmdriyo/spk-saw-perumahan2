import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const histories = await prisma.history.findMany({
      orderBy: { tanggal: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      data: histories
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal mengambil data riwayat' 
      },
      { status: 500 }
    );
  }
}
