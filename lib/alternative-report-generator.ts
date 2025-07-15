import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './saw-calculator';

export interface Alternative {
  id: number;
  namaPerumahan: string;
  lokasi: string;
  harga: number;
  jarak: number;
  fasilitas: number;
  transportasi: number;
  gambar?: string;
  createdAt?: string;
}

export class AlternativeReportGenerator {
  private doc: jsPDF;
  private alternatives: Alternative[];

  constructor(alternatives: Alternative[]) {
    this.doc = new jsPDF();
    this.alternatives = alternatives;
  }

  private addHeader() {
    // Header utama
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LAPORAN DATA ALTERNATIF PERUMAHAN', 105, 20, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.text('Sistem Pendukung Keputusan (SPK)', 105, 30, { align: 'center' });
    this.doc.text('Pemilihan Perumahan Terbaik', 105, 40, { align: 'center' });

    // Garis pemisah
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 45, 190, 45);

    // Informasi laporan
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Tanggal Laporan: ${new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, 55);
    
    this.doc.text(`Total Alternatif: ${this.alternatives.length} perumahan`, 20, 65);
  }

  private addSummaryStats() {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RINGKASAN STATISTIK', 20, 80);

    if (this.alternatives.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Tidak ada data alternatif yang tersedia.', 20, 90);
      return;
    }

    // Hitung statistik
    const prices = this.alternatives.map(alt => alt.harga);
    const distances = this.alternatives.map(alt => alt.jarak);
    const facilities = this.alternatives.map(alt => alt.fasilitas);
    const transportation = this.alternatives.map(alt => alt.transportasi);

    const stats = [
      ['Kriteria', 'Minimum', 'Maksimum', 'Rata-rata'],
      [
        'Harga',
        formatCurrency(Math.min(...prices)),
        formatCurrency(Math.max(...prices)),
        formatCurrency(prices.reduce((sum, p) => sum + p, 0) / prices.length)
      ],
      [
        'Jarak (km)',
        Math.min(...distances).toFixed(1),
        Math.max(...distances).toFixed(1),
        (distances.reduce((sum, d) => sum + d, 0) / distances.length).toFixed(1)
      ],
      [
        'Fasilitas (1-10)',
        Math.min(...facilities).toString(),
        Math.max(...facilities).toString(),
        (facilities.reduce((sum, f) => sum + f, 0) / facilities.length).toFixed(1)
      ],
      [
        'Transportasi (1-10)',
        Math.min(...transportation).toString(),
        Math.max(...transportation).toString(),
        (transportation.reduce((sum, t) => sum + t, 0) / transportation.length).toFixed(1)
      ]
    ];

    autoTable(this.doc, {
      startY: 85,
      head: [stats[0]],
      body: stats.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' }
      }
    });
  }

  private addAlternativesTable() {
    const finalY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY + 15 || 120;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DAFTAR LENGKAP ALTERNATIF PERUMAHAN', 20, finalY);

    if (this.alternatives.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Tidak ada data alternatif untuk ditampilkan.', 20, finalY + 10);
      return;
    }

    const alternativesData = this.alternatives.map((alt, index) => [
      (index + 1).toString(),
      alt.namaPerumahan,
      alt.lokasi,
      formatCurrency(alt.harga),
      `${alt.jarak} km`,
      `${alt.fasilitas}/10`,
      `${alt.transportasi}/10`
    ]);

    autoTable(this.doc, {
      startY: finalY + 5,
      head: [['No', 'Nama Perumahan', 'Lokasi', 'Harga', 'Jarak', 'Fasilitas', 'Transportasi']],
      body: alternativesData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' }
      },
      didParseCell: (data) => {
        // Zebra striping untuk readability
        if (data.section === 'body' && data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [245, 247, 250];
        }
      }
    });
  }

  public generatePDF(): jsPDF {
    try {
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'normal');
      
      this.addHeader();
      this.addSummaryStats();
      this.addAlternativesTable();

      return this.doc;
    } catch (error) {
      console.error('Error generating alternatives report:', error);
      
      this.doc = new jsPDF();
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Error Generating Report', 105, 100, { align: 'center' });
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Terjadi kesalahan saat membuat laporan data alternatif.', 105, 120, { align: 'center' });
      
      return this.doc;
    }
  }

  public downloadPDF(filename?: string): void {
    const pdf = this.generatePDF();
    const defaultFilename = `Laporan_Data_Alternatif_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename || defaultFilename);
  }

  public printPDF(): void {
    const pdf = this.generatePDF();
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }
}
