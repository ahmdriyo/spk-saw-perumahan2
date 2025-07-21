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
  gambar: z.string().nullable().optional(),
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
    console.log('Creating alternative with body:', JSON.stringify(body, null, 2));
    
    const parse = AlternativeSchema.safeParse(body);
    
    if (!parse.success) {
      console.log('Validation errors:', parse.error.errors);
      return NextResponse.json({
        success: false,
        message: 'Data tidak valid',
        errors: parse.error.errors
      }, { status: 400 });
    }

    const { nama, lokasi, gambar, values } = parse.data;
    
    const created = await prisma.$transaction(async (tx) => {
      // Create the alternative first
      const alternative = await tx.alternative.create({
        data: {
          nama,
          lokasi,
          gambar,
        },
      });

      // Create values if provided
      if (values && values.length > 0) {
        // Filter out any invalid criteria
        const validValues = [];
        for (const value of values) {
          // Check if criteria exists
          const criteriaExists = await tx.criteria.findUnique({
            where: { id: value.criteriaId }
          });
          
          if (criteriaExists) {
            validValues.push({
              alternativeId: alternative.id,
              criteriaId: value.criteriaId,
              nilai: value.nilai
            });
          }
        }
        
        if (validValues.length > 0) {
          await tx.alternativeValue.createMany({
            data: validValues
          });
        }
      }

      // Return created alternative with values
      return await tx.alternative.findUnique({
        where: { id: alternative.id },
        include: { 
          values: {
            include: {
              criteria: true
            }
          }
        }
      });
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
