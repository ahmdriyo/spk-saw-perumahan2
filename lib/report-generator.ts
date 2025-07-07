import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NormalizedAlternative, Criteria } from './saw-calculator';
import { formatNumber, formatCurrency } from './saw-calculator';

export interface ReportData {
  normalizedAlternatives: NormalizedAlternative[];
  criterias: Criteria[];
  bestAlternative: NormalizedAlternative;
  tanggal: Date;
}

export class ReportGenerator {
  private doc: jsPDF;
  private data: ReportData;

  constructor(data: ReportData) {
    this.doc = new jsPDF();
    this.data = data;
  }

  private addHeader() {
    // Logo atau header perusahaan (opsional)
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LAPORAN HASIL ANALISIS', 105, 20, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.text('Sistem Pendukung Keputusan (SPK)', 105, 30, { align: 'center' });
    this.doc.text('Pemilihan Perumahan Terbaik', 105, 40, { align: 'center' });
    this.doc.text('Metode SAW (Simple Additive Weighting)', 105, 50, { align: 'center' });

    // Garis pemisah
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 55, 190, 55);

    // Informasi tanggal
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Tanggal Laporan: ${this.data.tanggal.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, 65);
  }

  private addCriteriaTable() {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('1. KRITERIA DAN BOBOT', 20, 80);

    const criteriaData = this.data.criterias.map(criteria => [
      criteria.nama,
      `${criteria.bobot}%`,
      criteria.tipe === 'benefit' ? 'Keuntungan' : 'Biaya',
      criteria.tipe === 'benefit' ? 'Semakin tinggi semakin baik' : 'Semakin rendah semakin baik'
    ]);

    autoTable(this.doc, {
      startY: 85,
      head: [['Kriteria', 'Bobot', 'Jenis', 'Keterangan']],
      body: criteriaData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Blue color
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 90 }
      }
    });
  }

  private addAlternativesTable() {
    const finalY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('2. DATA ALTERNATIF PERUMAHAN', 20, finalY);

    const alternativesData = this.data.normalizedAlternatives.map(alt => [
      alt.namaPerumahan,
      alt.lokasi,
      formatCurrency(alt.harga),
      `${alt.jarak} km`,
      `${alt.fasilitas}/10`,
      `${alt.transportasi}/10`
    ]);

    autoTable(this.doc, {
      startY: finalY + 5,
      head: [['Nama Perumahan', 'Lokasi', 'Harga', 'Jarak', 'Fasilitas', 'Transportasi']],
      body: alternativesData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' }
      }
    });
  }

  private addNormalizationTable() {
    const finalY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('3. HASIL NORMALISASI', 20, finalY);

    const normalizationData = this.data.normalizedAlternatives.map(alt => [
      alt.namaPerumahan,
      formatNumber(alt.normalizedHarga),
      formatNumber(alt.normalizedJarak),
      formatNumber(alt.normalizedFasilitas),
      formatNumber(alt.normalizedTransportasi)
    ]);

    autoTable(this.doc, {
      startY: finalY + 5,
      head: [['Nama Perumahan', 'Harga (N)', 'Jarak (N)', 'Fasilitas (N)', 'Transportasi (N)']],
      body: normalizationData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 35, halign: 'center' }
      }
    });
  }

  private addRankingTable() {
    const finalY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('4. HASIL PERINGKAT', 20, finalY);

    const rankingData = this.data.normalizedAlternatives.map(alt => [
      alt.ranking.toString(),
      alt.namaPerumahan,
      formatNumber(alt.finalScore),
      alt.ranking === 1 ? 'TERBAIK' : alt.ranking <= 3 ? 'BAIK' : 'CUKUP'
    ]);

    autoTable(this.doc, {
      startY: finalY + 5,
      head: [['Peringkat', 'Nama Perumahan', 'Skor Akhir', 'Kategori']],
      body: rankingData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' }
      },
      didParseCell: (data) => {
        // Highlight baris peringkat 1
        if (data.row.index === 0 && data.section === 'body') {
          data.cell.styles.fillColor = [254, 240, 138]; // Yellow highlight
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
  }

  private addConclusion() {
    const finalY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    
    // Cek apakah perlu halaman baru
    const pageHeight = this.doc.internal.pageSize.height;
    if (finalY > pageHeight - 80) {
      this.doc.addPage();
      this.addNewPageHeader();
      this.addConclusionContent(30);
    } else {
      this.addConclusionContent(finalY);
    }
  }

  private addNewPageHeader() {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('LAPORAN HASIL ANALISIS SPK (Lanjutan)', 105, 20, { align: 'center' });
    
    // Garis pemisah
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 25, 190, 25);
  }

  private addConclusionContent(startY: number) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('5. KESIMPULAN', 20, startY);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    
    const conclusionText = [
      `Berdasarkan hasil analisis menggunakan metode SAW (Simple Additive Weighting),`,
      `perumahan terbaik adalah:`,
      '',
      `Nama: ${this.data.bestAlternative.namaPerumahan}`,
      `Lokasi: ${this.data.bestAlternative.lokasi}`,
      `Skor Akhir: ${formatNumber(this.data.bestAlternative.finalScore)}`,
      '',
      `Perumahan ini memiliki kombinasi terbaik dari semua kriteria yang telah`,
      `ditetapkan dengan mempertimbangkan bobot masing-masing kriteria.`
    ];

    let yPosition = startY + 8;
    conclusionText.forEach(line => {
      this.doc.text(line, 20, yPosition);
      yPosition += 6;
    });

    // Box untuk hasil terbaik
    const boxY = startY + 20;
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setFillColor(239, 246, 255);
    this.doc.rect(20, boxY, 170, 25, 'FD');
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246);
    this.doc.text('REKOMENDASI PERUMAHAN TERBAIK:', 25, boxY + 10);
    this.doc.text(this.data.bestAlternative.namaPerumahan, 25, boxY + 18);
    
    // Reset color untuk footer
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
  }

  private addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    const pageHeight = this.doc.internal.pageSize.height;
    
    // Tambahkan footer untuk setiap halaman
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Save current settings
      const currentFontSize = this.doc.internal.getFontSize();
      const currentFont = this.doc.internal.getFont();
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(128, 128, 128);
      
      this.doc.text('Laporan ini dibuat secara otomatis oleh Sistem Pendukung Keputusan', 105, pageHeight - 20, { align: 'center' });
      this.doc.text('SPK Pemilihan Perumahan dengan Metode SAW', 105, pageHeight - 15, { align: 'center' });
      this.doc.text(`Halaman ${i} dari ${pageCount}`, 105, pageHeight - 10, { align: 'center' });
      
      // Restore settings
      this.doc.setFontSize(currentFontSize);
      this.doc.setFont(currentFont.fontName, currentFont.fontStyle);
      this.doc.setTextColor(0, 0, 0);
    }
  }

  public generatePDF(): jsPDF {
    try {
      // Reset text color untuk memastikan warna default
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'normal');
      
      this.addHeader();
      this.addCriteriaTable();
      this.addAlternativesTable();
      this.addNormalizationTable();
      this.addRankingTable();
      this.addConclusion();
      this.addFooter();

      return this.doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Return a minimal PDF with error message
      this.doc = new jsPDF();
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Error Generating Report', 105, 100, { align: 'center' });
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Terjadi kesalahan saat membuat laporan PDF.', 105, 120, { align: 'center' });
      this.doc.text('Silakan coba lagi atau hubungi administrator.', 105, 135, { align: 'center' });
      return this.doc;
    }
  }

  public downloadPDF(filename?: string): void {
    const pdf = this.generatePDF();
    const defaultFilename = `Laporan_SPK_Perumahan_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename || defaultFilename);
  }

  public printPDF(): void {
    const pdf = this.generatePDF();
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Buka di window baru untuk print
    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }
}
