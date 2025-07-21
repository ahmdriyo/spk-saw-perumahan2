import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const CriteriaSchema = z.object({
  nama: z.string().min(1, 'Nama kriteria harus diisi'),
  tipe: z.enum(['benefit', 'cost']),
  bobot: z.number().min(0).max(100),
});

export async function GET() {
  try {
    const criterias = await prisma.criteria.findMany({
      orderBy: { id: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: criterias
    });
  } catch (error) {
    console.error('Error fetching criterias:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memuat data kriteria'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = CriteriaSchema.safeParse(body);
    
    if (!parse.success) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak valid',
        errors: parse.error.errors
      }, { status: 400 });
    }

    const created = await prisma.criteria.create({
      data: parse.data
    });

    return NextResponse.json({
      success: true,
      message: 'Kriteria berhasil ditambahkan',
      data: created
    });
  } catch (error) {
    console.error('Error creating criteria:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menambahkan kriteria'
    }, { status: 500 });
  }
}
