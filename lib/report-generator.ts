import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NormalizedAlternative, Criteria } from './saw-calculator';
import { formatNumber } from './saw-calculator';

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
    this.doc.text('Menggunakan Metode SAW', 105, 50, { align: 'center' });

    // Informasi waktu
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Tanggal: ${this.data.tanggal.toLocaleDateString('id-ID')}`, 20, 65);
    this.doc.text(`Waktu: ${this.data.tanggal.toLocaleTimeString('id-ID')}`, 150, 65);
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
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 90 }
      }
    });
  }

  private addNormalizationTable() {
    const finalY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('2. HASIL NORMALISASI', 20, finalY);

    // Build dynamic headers for normalization
    const headers = ['Nama Perumahan', 'Lokasi'];
    this.data.criterias.forEach(criteria => {
      headers.push(`${criteria.nama} (N)`);
    });

    const normalizationData = this.data.normalizedAlternatives.map(alt => {
      const row = [alt.nama, alt.lokasi];
      
      // Add normalized values for each criteria
      this.data.criterias.forEach(criteria => {
        const normalizedValue = alt.normalizedValues[criteria.id];
        row.push(normalizedValue ? formatNumber(normalizedValue) : '0');
      });
      
      return row;
    });

    autoTable(this.doc, {
      startY: finalY + 5,
      head: [headers],
      body: normalizationData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 }
      }
    });
  }

  private addRankingTable() {
    const finalY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('3. HASIL RANKING', 20, finalY);

    const rankingData = this.data.normalizedAlternatives
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((alt, index) => [
        index + 1,
        alt.nama,
        alt.lokasi,
        formatNumber(alt.finalScore)
      ]);

    autoTable(this.doc, {
      startY: finalY + 5,
      head: [['Ranking', 'Nama Perumahan', 'Lokasi', 'Skor Akhir']],
      body: rankingData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 60 },
        3: { cellWidth: 30, halign: 'center' }
      }
    });
  }

  // private addConclusion() {
  //   const finalY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    
  //   this.doc.setFontSize(14);
  //   this.doc.setFont('helvetica', 'bold');
  //   this.doc.text('4. KESIMPULAN', 20, finalY);

  //   // Box untuk kesimpulan
  //   const boxY = finalY + 5;
  //   this.doc.setFillColor(255, 248, 220); // Light yellow background
  //   this.doc.rect(20, boxY, 170, 30, 'F');
  //   this.doc.setDrawColor(255, 193, 7); // Yellow border
  //   this.doc.rect(20, boxY, 170, 30, 'S');

  //   this.doc.setFontSize(12);
  //   this.doc.setFont('helvetica', 'bold');
  //   this.doc.setTextColor(0, 0, 0);
  //   this.doc.text('🏆 PERUMAHAN TERBAIK:', 25, boxY + 10);
    
  //   this.doc.setFontSize(14);
  //   this.doc.text(this.data.bestAlternative.nama, 25, boxY + 20);
    
  //   this.doc.setFontSize(10);
  //   this.doc.setFont('helvetica', 'normal');
  //   this.doc.text(`Lokasi: ${this.data.bestAlternative.lokasi}`, 25, boxY + 28);
  //   this.doc.text(`Skor Akhir: ${formatNumber(this.data.bestAlternative.finalScore)}`, 140, boxY + 28);

  //   // Penjelasan metode
  //   const explanationY = boxY + 40;
  //   this.doc.setFontSize(10);
  //   this.doc.setFont('helvetica', 'normal');
  //   this.doc.setTextColor(0, 0, 0);
    
  //   const explanationText = [
  //     'Hasil analisis ini diperoleh menggunakan metode Simple Additive Weighting (SAW).',
  //     'Metode SAW menghitung skor akhir berdasarkan nilai normalisasi setiap kriteria',
  //     'yang dikalikan dengan bobot masing-masing kriteria.',
  //     '',
  //     'Perumahan dengan skor tertinggi adalah pilihan terbaik berdasarkan kriteria yang telah ditentukan.'
  //   ];
    
  //   explanationText.forEach((text, index) => {
  //     this.doc.text(text, 20, explanationY + (index * 6));
  //   });
  // }

  public generatePDF(): jsPDF {
    this.addHeader();
    this.addCriteriaTable();
    this.addNormalizationTable();
    this.addRankingTable();
    // this.addConclusion();
    
    return this.doc;
  }

  public downloadPDF(filename: string = 'laporan-spk-saw.pdf') {
    const doc = this.generatePDF();
    doc.save(filename);
  }

  public getPDFBlob(): Blob {
    const doc = this.generatePDF();
    return doc.output('blob');
  }
}

// Utility function untuk membuat laporan cepat
export function generateQuickReport(data: ReportData): void {
  const generator = new ReportGenerator(data);
  generator.downloadPDF();
}
