import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ValueSchema = z.object({
  nilai: z.number(),
});

export async function GET(_req: NextRequest, { params }: { params: { alternativeId: string, criteriaId: string } }) {
  try {
    const alternativeId = Number(params.alternativeId);
    const criteriaId = Number(params.criteriaId);
    
    if (isNaN(alternativeId) || isNaN(criteriaId)) {
      return NextResponse.json({
        success: false,
        message: 'ID tidak valid'
      }, { status: 400 });
    }

    const value = await prisma.alternativeValue.findUnique({
      where: { alternativeId_criteriaId: { alternativeId, criteriaId } },
      include: {
        alternative: true,
        criteria: true
      }
    });

    if (!value) {
      return NextResponse.json({
        success: false,
        message: 'Nilai alternatif tidak ditemukan'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: value
    });
  } catch (error) {
    console.error('Error fetching alternative value:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memuat data nilai alternatif'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { alternativeId: string, criteriaId: string } }) {
  try {
    const alternativeId = Number(params.alternativeId);
    const criteriaId = Number(params.criteriaId);
    
    if (isNaN(alternativeId) || isNaN(criteriaId)) {
      return NextResponse.json({
        success: false,
        message: 'ID tidak valid'
      }, { status: 400 });
    }

    const body = await req.json();
    const parse = ValueSchema.safeParse(body);
    
    if (!parse.success) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak valid',
        errors: parse.error.errors
      }, { status: 400 });
    }

    const updated = await prisma.alternativeValue.update({
      where: { alternativeId_criteriaId: { alternativeId, criteriaId } },
      data: { nilai: parse.data.nilai },
      include: {
        alternative: true,
        criteria: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Nilai alternatif berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    console.error('Error updating alternative value:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memperbarui nilai alternatif'
    }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { alternativeId: string, criteriaId: string } }) {
  try {
    const alternativeId = Number(params.alternativeId);
    const criteriaId = Number(params.criteriaId);
    
    if (isNaN(alternativeId) || isNaN(criteriaId)) {
      return NextResponse.json({
        success: false,
        message: 'ID tidak valid'
      }, { status: 400 });
    }

    await prisma.alternativeValue.delete({
      where: { alternativeId_criteriaId: { alternativeId, criteriaId } },
    });

    return NextResponse.json({
      success: true,
      message: 'Nilai alternatif berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting alternative value:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus nilai alternatif'
    }, { status: 500 });
  }
}
