import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReportGenerator } from '@/lib/report-generator';
import { NormalizedAlternative, Criteria } from '@/lib/saw-calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { historyId } = body;
    
    if (!historyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'History ID diperlukan' 
        },
        { status: 400 }
      );
    }
    
    // Ambil data history
    const history = await prisma.history.findUnique({
      where: { id: historyId }
    });
    
    if (!history) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data riwayat tidak ditemukan' 
        },
        { status: 404 }
      );
    }
    
    // Parse hasil JSON
    const sawResult = history.hasil as unknown as {
      normalizedAlternatives: NormalizedAlternative[];
      criterias: Criteria[];
      bestAlternative: NormalizedAlternative;
    };
    
    const reportData = {
      normalizedAlternatives: sawResult.normalizedAlternatives,
      criterias: sawResult.criterias,
      bestAlternative: sawResult.bestAlternative,
      tanggal: history.tanggal
    };
    
    // Generate PDF
    const reportGenerator = new ReportGenerator(reportData);
    const pdf = reportGenerator.generatePDF();
    
    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Laporan_SPK_${history.id}_${history.tanggal.toISOString().split('T')[0]}.pdf"`
      }
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal membuat laporan' 
      },
      { status: 500 }
    );
  }
}
