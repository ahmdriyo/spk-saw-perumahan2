import React, { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { AlternativeReportGenerator, Alternative } from '@/lib/alternative-report-generator';
import { CriteriaReportGenerator, Criteria } from '@/lib/criteria-report-generator';

interface AlternativePrintButtonProps {
  alternatives: Alternative[];
  disabled?: boolean;
}

interface CriteriaPrintButtonProps {
  criterias: Criteria[];
  disabled?: boolean;
}

export function AlternativePrintButton({ alternatives, disabled = false }: AlternativePrintButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadReport = async () => {
    if (alternatives.length === 0) {
      toast.error('Tidak ada data alternatif untuk dicetak');
      return;
    }

    setIsGenerating(true);
    try {
      const generator = new AlternativeReportGenerator(alternatives);
      generator.downloadPDF();
      toast.success('Laporan alternatif berhasil diunduh');
    } catch (error) {
      console.error('Error generating alternative report:', error);
      toast.error('Gagal membuat laporan alternatif');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewReport = async () => {
    if (alternatives.length === 0) {
      toast.error('Tidak ada data alternatif untuk dipratinjau');
      return;
    }

    setIsGenerating(true);
    try {
      const generator = new AlternativeReportGenerator(alternatives);
      generator.printPDF();
      toast.success('Membuka pratinjau laporan...');
    } catch (error) {
      console.error('Error previewing alternative report:', error);
      toast.error('Gagal membuka pratinjau laporan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePreviewReport}
        disabled={disabled || isGenerating || alternatives.length === 0}
        className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Pratinjau Laporan Alternatif"
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Eye className="w-4 h-4" />
        )}
        Pratinjau
      </button>
      
      <button
        onClick={handleDownloadReport}
        disabled={disabled || isGenerating || alternatives.length === 0}
        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Unduh Laporan Alternatif"
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Download className="w-4 h-4" />
        )}
        Cetak Laporan
      </button>
    </div>
  );
}

export function CriteriaPrintButton({ criterias, disabled = false }: CriteriaPrintButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadReport = async () => {
    if (criterias.length === 0) {
      toast.error('Tidak ada data kriteria untuk dicetak');
      return;
    }

    setIsGenerating(true);
    try {
      const generator = new CriteriaReportGenerator(criterias);
      generator.downloadReport();
      toast.success('Laporan kriteria berhasil diunduh');
    } catch (error) {
      console.error('Error generating criteria report:', error);
      toast.error('Gagal membuat laporan kriteria');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewReport = async () => {
    if (criterias.length === 0) {
      toast.error('Tidak ada data kriteria untuk dipratinjau');
      return;
    }

    setIsGenerating(true);
    try {
      const generator = new CriteriaReportGenerator(criterias);
      generator.previewReport();
      toast.success('Membuka pratinjau laporan...');
    } catch (error) {
      console.error('Error previewing criteria report:', error);
      toast.error('Gagal membuka pratinjau laporan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePreviewReport}
        disabled={disabled || isGenerating || criterias.length === 0}
        className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Pratinjau Laporan Kriteria"
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Eye className="w-4 h-4" />
        )}
        Pratinjau
      </button>
      
      <button
        onClick={handleDownloadReport}
        disabled={disabled || isGenerating || criterias.length === 0}
        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Unduh Laporan Kriteria"
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Download className="w-4 h-4" />
        )}
        Cetak Laporan
      </button>
    </div>
  );
}

// Export combined component for both types
interface PrintButtonsProps {
  type: 'alternative' | 'criteria';
  data: Alternative[] | Criteria[];
  disabled?: boolean;
}

export function PrintButtons({ type, data, disabled = false }: PrintButtonsProps) {
  if (type === 'alternative') {
    return <AlternativePrintButton alternatives={data as Alternative[]} disabled={disabled} />;
  } else {
    return <CriteriaPrintButton criterias={data as Criteria[]} disabled={disabled} />;
  }
}
