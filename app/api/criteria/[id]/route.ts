import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const CriteriaSchema = z.object({
  nama: z.string().min(1, 'Nama kriteria harus diisi'),
  tipe: z.enum(['benefit', 'cost']),
  bobot: z.number().min(0).max(100),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: 'ID tidak valid'
      }, { status: 400 });
    }

    const criteria = await prisma.criteria.findUnique({
      where: { id }
    });

    if (!criteria) {
      return NextResponse.json({
        success: false,
        message: 'Kriteria tidak ditemukan'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: criteria
    });
  } catch (error) {
    console.error('Error fetching criteria:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memuat data kriteria'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: 'ID tidak valid'
      }, { status: 400 });
    }

    const body = await req.json();
    const parse = CriteriaSchema.safeParse(body);
    
    if (!parse.success) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak valid',
        errors: parse.error.errors
      }, { status: 400 });
    }

    const updated = await prisma.criteria.update({
      where: { id },
      data: parse.data
    });

    return NextResponse.json({
      success: true,
      message: 'Kriteria berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    console.error('Error updating criteria:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memperbarui kriteria'
    }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: 'ID tidak valid'
      }, { status: 400 });
    }

    // Check if criteria has related data
    const relatedValues = await prisma.alternativeValue.findMany({
      where: { criteriaId: id }
    });

    if (relatedValues.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Kriteria tidak dapat dihapus karena masih terdapat data alternatif yang terkait'
      }, { status: 400 });
    }

    await prisma.criteria.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Kriteria berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting criteria:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus kriteria'
    }, { status: 500 });
  }
}
