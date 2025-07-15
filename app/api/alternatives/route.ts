import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ValueSchema = z.object({
  criteriaId: z.number(),
  nilai: z.number(),
});

const AlternativeSchema = z.object({
  nama: z.string().min(1, 'Nama alternatif harus diisi'),
  lokasi: z.string().min(1, 'Lokasi harus diisi'),
  gambar: z.string().optional(),
  values: z.array(ValueSchema).optional(),
});

export async function GET() {
  try {
    const alternatives = await prisma.alternative.findMany({
      include: { 
        values: {
          include: {
            criteria: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: alternatives
    });
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memuat data alternatif'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = AlternativeSchema.safeParse(body);
    
    if (!parse.success) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak valid',
        errors: parse.error.errors
      }, { status: 400 });
    }

    const { nama, lokasi, gambar, values } = parse.data;
    
    const created = await prisma.alternative.create({
      data: {
        nama,
        lokasi,
        gambar,
        values: values && values.length > 0 ? {
          create: values.map(v => ({ 
            criteriaId: v.criteriaId, 
            nilai: v.nilai 
          }))
        } : undefined,
      },
      include: { 
        values: {
          include: {
            criteria: true
          }
        }
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Alternatif berhasil ditambahkan',
      data: created
    });
  } catch (error) {
    console.error('Error creating alternative:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menambahkan alternatif'
    }, { status: 500 });
  }
}
