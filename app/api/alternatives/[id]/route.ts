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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: 'ID tidak valid'
      }, { status: 400 });
    }

    const alternative = await prisma.alternative.findUnique({
      where: { id },
      include: { 
        values: {
          include: {
            criteria: true
          }
        }
      }
    });

    if (!alternative) {
      return NextResponse.json({
        success: false,
        message: 'Alternatif tidak ditemukan'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: alternative
    });
  } catch (error) {
    console.error('Error fetching alternative:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memuat data alternatif'
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
    console.log('Received body:', JSON.stringify(body, null, 2));
    
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
    
    // Update alternative and handle values
    const updated = await prisma.$transaction(async (tx) => {
      // Update basic alternative data
      await tx.alternative.update({
        where: { id },
        data: { nama, lokasi, gambar },
      });

      // Update values if provided
      if (values && values.length > 0) {
        // Delete existing values for this alternative
        await tx.alternativeValue.deleteMany({
          where: { alternativeId: id }
        });
        
        // Create new values - filter out any invalid criteria
        const validValues = [];
        for (const value of values) {
          // Check if criteria exists
          const criteriaExists = await tx.criteria.findUnique({
            where: { id: value.criteriaId }
          });
          
          if (criteriaExists) {
            validValues.push({
              alternativeId: id,
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

      // Return updated alternative with values
      return await tx.alternative.findUnique({
        where: { id },
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
      message: 'Alternatif berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    console.error('Error updating alternative:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memperbarui alternatif'
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

    await prisma.alternative.delete({ 
      where: { id } 
    });

    return NextResponse.json({
      success: true,
      message: 'Alternatif berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting alternative:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus alternatif'
    }, { status: 500 });
  }
}
