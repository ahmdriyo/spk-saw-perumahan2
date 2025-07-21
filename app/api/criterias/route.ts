import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const CriteriaSchema = z.object({
  nama: z.string().min(1, 'Nama kriteria harus diisi'),
  tipe: z.enum(['benefit', 'cost']),
  bobot: z.number().min(0).max(100),
});

const CriteriasUpdateSchema = z.object({
  criterias: z.array(CriteriaSchema.extend({
    id: z.number()
  }))
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
    
    // Check if it's bulk update (criterias array) or single create
    if (body.criterias && Array.isArray(body.criterias)) {
      // Bulk update for criterias weights
      const parse = CriteriasUpdateSchema.safeParse(body);
      if (!parse.success) {
        return NextResponse.json({
          success: false,
          message: 'Data tidak valid',
          errors: parse.error.errors
        }, { status: 400 });
      }

      // Update all criterias
      const updatedCriterias = await Promise.all(
        parse.data.criterias.map(criteria => 
          prisma.criteria.update({
            where: { id: criteria.id },
            data: {
              nama: criteria.nama,
              tipe: criteria.tipe,
              bobot: criteria.bobot
            }
          })
        )
      );

      return NextResponse.json({
        success: true,
        message: 'Bobot kriteria berhasil diperbarui',
        data: updatedCriterias
      });
    } else {
      // Single create
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

      // Auto-sync values for existing alternatives
      try {
        const alternatives = await prisma.alternative.findMany();
        
        if (alternatives.length > 0) {
          await prisma.alternativeValue.createMany({
            data: alternatives.map(alt => ({
              alternativeId: alt.id,
              criteriaId: created.id,
              nilai: 0
            }))
          });
        }
      } catch (syncError) {
        console.error('Error syncing alternative values:', syncError);
        // Don't fail the request if sync fails
      }

      return NextResponse.json({
        success: true,
        message: 'Kriteria berhasil ditambahkan',
        data: created
      });
    }
  } catch (error) {
    console.error('Error in POST criterias:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 });
  }
}
