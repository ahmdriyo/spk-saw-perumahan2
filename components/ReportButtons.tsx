'use client';

import { useState } from 'react';
import { ReportGenerator, ReportData } from '@/lib/report-generator';
import { Download, Printer, FileText } from 'lucide-react';

interface ReportButtonsProps {
  data: ReportData;
  className?: string;
}

export default function ReportButtons({ data, className = '' }: ReportButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const reportGenerator = new ReportGenerator(data);
      reportGenerator.downloadPDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat laporan PDF. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPDF = async () => {
    setIsGenerating(true);
    try {
      const reportGenerator = new ReportGenerator(data);
      reportGenerator.printPDF();
    } catch (error) {
      console.error('Error printing PDF:', error);
      alert('Gagal mencetak laporan. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {isGenerating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download size={16} />
        )}
        Download PDF
      </button>

      <button
        onClick={handlePrintPDF}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {isGenerating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Printer size={16} />
        )}
        Cetak Laporan
      </button>

      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
        <FileText size={16} />
        <span className="text-sm">
          Laporan Perhitungan SAW
        </span>
      </div>
    </div>
  );
}
