import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Criteria {
  id: number;
  nama: string;
  bobot: number;
  tipe: "benefit" | "cost";
}

// Extend jsPDF to include autoTable properties
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export class CriteriaReportGenerator {
  private doc: ExtendedJsPDF;
  private criterias: Criteria[];

  constructor(criterias: Criteria[]) {
    this.doc = new jsPDF() as ExtendedJsPDF;
    this.criterias = criterias;
  }

  private addHeader() {
    // Header utama
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LAPORAN DATA KRITERIA PENILAIAN', 105, 20, { align: 'center' });
    
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
    
    this.doc.text(`Total Kriteria: ${this.criterias.length} kriteria`, 20, 65);
    
    // Hitung total bobot
    const totalBobot = this.criterias.reduce((sum, criteria) => sum + criteria.bobot, 0);
    this.doc.text(`Total Bobot: ${totalBobot.toFixed(0)} % ${totalBobot === 1 ? '(Valid)' : '(Perlu Normalisasi)'}`, 20, 75);
  }

  private addCriteriaTable() {
    const startY = 90;
    
    // Data untuk tabel
    const tableData = this.criterias.map((criteria, index) => [
      (index + 1).toString(),
      criteria.nama,
      `${criteria.bobot.toFixed(0)} %`,
      criteria.tipe === 'benefit' ? 'Benefit (Semakin Besar Semakin Baik)' : 'Cost (Semakin Kecil Semakin Baik)',
    ]);

    // Tambahkan baris total
    const totalBobot = this.criterias.reduce((sum, criteria) => sum + criteria.bobot, 0);
    tableData.push([
      '',
      'TOTAL BOBOT',
      `${totalBobot.toFixed(0)} %`,
      totalBobot === 1 ? 'Valid' : 'Perlu Normalisasi'
    ]);

    autoTable(this.doc, {
      head: [['No', 'Nama Kriteria', 'Bobot', 'Tipe Kriteria']],
      body: tableData,
      startY: startY,
      theme: 'striped',
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: 50,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        cellPadding: 6,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 80 },
      },
      margin: { left: 20, right: 20 },
    });
  }




  public generateReport(): jsPDF {
    try {
      // Add header
      this.addHeader();

      // Add criteria table
      this.addCriteriaTable();

      return this.doc;
    } catch (error) {
      console.error('Error generating criteria report:', error);
      throw new Error('Gagal membuat laporan kriteria');
    }
  }

  public downloadReport(filename?: string): void {
    const doc = this.generateReport();
    const fileName = filename || `Laporan_Kriteria_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  public getReportBlob(): Blob {
    const doc = this.generateReport();
    return doc.output('blob');
  }

  public previewReport(): void {
    const doc = this.generateReport();
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  }
}

export default CriteriaReportGenerator;
