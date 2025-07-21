import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ValueSchema = z.object({
  alternativeId: z.number(),
  criteriaId: z.number(),
  nilai: z.number(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const criteriaId = searchParams.get('criteriaId');
    const alternativeId = searchParams.get('alternativeId');
    
    let where = {};
    if (criteriaId) {
      where = { criteriaId: Number(criteriaId) };
    }
    if (alternativeId) {
      where = { ...where, alternativeId: Number(alternativeId) };
    }
    
    const values = await prisma.alternativeValue.findMany({ 
      where,
      include: {
        alternative: true,
        criteria: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: values
    });
  } catch (error) {
    console.error('Error fetching alternative values:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memuat data nilai alternatif'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = ValueSchema.safeParse(body);
    
    if (!parse.success) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak valid',
        errors: parse.error.errors
      }, { status: 400 });
    }

    const created = await prisma.alternativeValue.create({ 
      data: parse.data,
      include: {
        alternative: true,
        criteria: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Nilai alternatif berhasil ditambahkan',
      data: created
    });
  } catch (error) {
    console.error('Error creating alternative value:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menambahkan nilai alternatif'
    }, { status: 500 });
  }
}
