import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get current criterias
    const criterias = await prisma.criteria.findMany({
      orderBy: { id: 'asc' }
    });

    // Build dynamic template headers
    const headers: Record<string, unknown> = {
      'Nama Perumahan': 'Perumahan Griya Indah',
      'Lokasi': 'Bandung, Jawa Barat',
    };

    // Add criteria columns
    criterias.forEach(criteria => {
      headers[criteria.nama] = criteria.tipe === 'cost' ? 500000000 : 8; // Example values
    });


    // Create multiple example rows
    const templateData = [
      // Row 1
      (() => {
        const row: Record<string, unknown> = {
          'Nama Perumahan': 'Perumahan Griya Indah',
          'Lokasi': 'Bandung, Jawa Barat',
        };
        criterias.forEach((criteria, index) => {
          if (criteria.tipe === 'cost') {
            row[criteria.nama] = [500000000, 750000000, 350000000][index % 3];
          } else {
            row[criteria.nama] = [8, 9, 7][index % 3];
          }
        });
        return row;
      })(),
      
      // Row 2
      (() => {
        const row: Record<string, unknown> = {
          'Nama Perumahan': 'Villa Harmoni',
          'Lokasi': 'Jakarta Selatan',
        };
        criterias.forEach((criteria, index) => {
          if (criteria.tipe === 'cost') {
            row[criteria.nama] = [750000000, 350000000, 500000000][index % 3];
          } else {
            row[criteria.nama] = [9, 7, 8][index % 3];
          }
        });
        return row;
      })(),
      
      // Row 3
      (() => {
        const row: Record<string, unknown> = {
          'Nama Perumahan': 'Cluster Mewah',
          'Lokasi': 'Surabaya, Jawa Timur',
        };
        criterias.forEach((criteria, index) => {
          if (criteria.tipe === 'cost') {
            row[criteria.nama] = [350000000, 500000000, 750000000][index % 3];
          } else {
            row[criteria.nama] = [7, 8, 9][index % 3];
          }
        });
        return row;
      })()
    ];

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Perumahan');

    // Set column widths dynamically
    const wscols = [
      { wch: 25 }, // Nama Perumahan
      { wch: 25 }, // Lokasi
    ];
    
    // Add column widths for criteria
    criterias.forEach(() => {
      wscols.push({ wch: 15 });
    });
    
    wscols.push({ wch: 30 }); // Gambar
    
    ws['!cols'] = wscols;

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Create response with appropriate headers
    const response = new NextResponse(buffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', 'attachment; filename="template-data-perumahan.xlsx"');
    
    return response;

  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal membuat template file',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
