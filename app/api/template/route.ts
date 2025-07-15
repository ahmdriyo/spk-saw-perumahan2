import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Template data
    const templateData = [
      {
        'Nama Perumahan': 'Perumahan Griya Indah',
        'Lokasi': 'Bandung, Jawa Barat',
        'Harga': 500000000,
        'Jarak': 5.2,
        'Fasilitas': 8,
        'Transportasi': 7,
        'Gambar': 'https://example.com/rumah1.jpg'
      },
      {
        'Nama Perumahan': 'Villa Harmoni',
        'Lokasi': 'Jakarta Selatan',
        'Harga': 750000000,
        'Jarak': 8.5,
        'Fasilitas': 9,
        'Transportasi': 8,
        'Gambar': 'https://example.com/rumah2.jpg'
      },
      {
        'Nama Perumahan': 'Cluster Mewah',
        'Lokasi': 'Surabaya, Jawa Timur',
        'Harga': 650000000,
        'Jarak': 3.1,
        'Fasilitas': 7,
        'Transportasi': 9,
        'Gambar': '/uploads/rumah3.jpg'
      }
    ];

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Perumahan');

    // Set column widths
    const wscols = [
      { wch: 25 }, // Nama Perumahan
      { wch: 25 }, // Lokasi
      { wch: 15 }, // Harga
      { wch: 10 }, // Jarak
      { wch: 12 }, // Fasilitas
      { wch: 15 }, // Transportasi
      { wch: 30 }, // Gambar
    ];
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
