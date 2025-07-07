'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface FileUploadProps {
  onUploadComplete?: () => void;
  className?: string;
}

export default function FileUpload({ onUploadComplete, className = '' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const axiosError = error as { response?: { data?: { details?: unknown[]; error?: string } } };
        
        if (axiosError.response?.data?.details) {
          const errors = axiosError.response.data.details;
          toast.error(`Gagal mengimpor beberapa data. ${Array.isArray(errors) ? errors.length : 0} baris memiliki error.`);
          
          // Show detailed errors
          console.log('Import errors:', errors);
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

  const downloadTemplate = () => {
    // Create a sample template CSV
    const template = `Nama Perumahan,Lokasi,Harga,Jarak,Fasilitas,Transportasi
Perumahan Indah,Jakarta Selatan,500000000,5.2,8,9
Green Valley,Bogor,350000000,15.7,7,6
Modern City,Tangerang,750000000,8.3,9,8`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_data_perumahan.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success('Template berhasil didownload');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Template Download */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Template File</h4>
            <p className="text-sm text-blue-700">Download template untuk format yang benar</p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          Download Template
        </button>
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
            <li>• Harga (dalam Rupiah)</li>
            <li>• Jarak (dalam km)</li>
            <li>• Fasilitas (skor 1-10)</li>
            <li>• Transportasi (skor 1-10)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
