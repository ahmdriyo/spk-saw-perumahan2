'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Criteria {
  id: number;
  nama: string;
  tipe: 'benefit' | 'cost';
  bobot: number;
}

interface FileUploadProps {
  onUploadComplete?: () => void;
  className?: string;
}

export default function FileUpload({ onUploadComplete, className = '' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch criterias
  useEffect(() => {
    const fetchCriterias = async () => {
      try {
        const response = await axios.get('/api/criterias');
        if (response.data.success) {
          setCriterias(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching criterias:', error);
      }
    };

    fetchCriterias();
  }, []);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validasi tipe file
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipe file tidak didukung. Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)');
      return;
    }
    
    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 5MB');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/import/alternatives', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        onUploadComplete?.();
      }
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { details?: unknown[]; error?: string; validData?: unknown[] } } };
        
        if (axiosError.response?.data?.details && Array.isArray(axiosError.response.data.details)) {
          const errors = axiosError.response.data.details;
          const validData = axiosError.response.data.validData;
          
          // Show detailed error information
          toast.error(
            `Gagal mengimpor ${errors.length} baris data. ${Array.isArray(validData) ? validData.length : 0} baris berhasil divalidasi.`,
            { duration: 5000 }
          );
          
          // Log detailed errors for debugging
          console.log('Import errors detail:', errors);
          
          // Show first few errors
          (errors as { row: number; error: string }[]).slice(0, 3).forEach((err, index) => {
            setTimeout(() => {
              toast.error(`Baris ${err.row}: ${err.error}`, { duration: 4000 });
            }, (index + 1) * 1000);
          });
          
        } else {
          toast.error(axiosError.response?.data?.error || 'Gagal mengupload file');
        }
      } else {
        toast.error('Gagal mengupload file');
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-data-perumahan.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Template Excel berhasil didownload');
      } else {
        throw new Error('Gagal mendownload template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Gagal mendownload template');
    }
  };

  const downloadCSVExample = async () => {
    try {
      const response = await fetch('/api/template/csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contoh-data-perumahan.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Contoh file CSV berhasil didownload');
      } else {
        throw new Error('Gagal mendownload contoh CSV');
      }
    } catch (error) {
      console.error('Error downloading CSV example:', error);
      toast.error('Gagal mendownload contoh CSV');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Template Download */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Template Excel</h4>
              <p className="text-sm text-blue-700">Template dengan struktur kolom dinamis</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Download
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Contoh CSV</h4>
              <p className="text-sm text-green-700">File CSV dengan contoh data</p>
            </div>
          </div>
          <button
            onClick={downloadCSVExample}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-4">
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
          )}
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploading ? 'Mengupload file...' : 'Upload File Data Perumahan'}
            </h3>
            <p className="text-gray-600">
              Drag & drop file atau klik untuk memilih
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Mendukung Excel (.xlsx, .xls) dan CSV (.csv) - Maksimal 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Format Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-900">Format yang Didukung</h4>
          </div>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Excel (.xlsx, .xls)</li>
            <li>• CSV (.csv)</li>
            <li>• Encoding UTF-8</li>
          </ul>
        </div>
        
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h4 className="font-medium text-amber-900">Kolom yang Diperlukan</h4>
          </div>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Nama Perumahan</li>
            <li>• Lokasi</li>
            {criterias.map((criteria) => (
              <li key={criteria.id}>• {criteria.nama}</li>
            ))}
            <li>• Gambar (URL, opsional)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
