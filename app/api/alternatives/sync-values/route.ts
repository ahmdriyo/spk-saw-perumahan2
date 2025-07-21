import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Get all alternatives and criteria
    const alternatives = await prisma.alternative.findMany({
      include: {
        values: true
      }
    });
    
    const criterias = await prisma.criteria.findMany();
    
    // For each alternative, ensure it has values for all criteria
    for (const alternative of alternatives) {
      const existingCriteriaIds = alternative.values.map(v => v.criteriaId);
      
      // Find missing criteria for this alternative
      const missingCriteria = criterias.filter(c => !existingCriteriaIds.includes(c.id));
      
      if (missingCriteria.length > 0) {
        // Create default values (0) for missing criteria
        await prisma.alternativeValue.createMany({
          data: missingCriteria.map(criteria => ({
            alternativeId: alternative.id,
            criteriaId: criteria.id,
            nilai: 0
          }))
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Nilai alternatif berhasil disinkronkan'
    });
  } catch (error) {
    console.error('Error syncing alternative values:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal melakukan sinkronisasi nilai alternatif'
    }, { status: 500 });
  }
}
