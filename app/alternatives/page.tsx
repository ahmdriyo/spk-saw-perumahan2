"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, Building, Upload, Edit, X } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";

interface Criteria {
  id: number;
  nama: string;
  bobot: number;
  tipe: "benefit" | "cost";
}

interface AlternativeValue {
  id: number;
  nilai: number;
  criteriaId: number;
  criteria: Criteria;
}

interface Alternative {
  id: number;
  nama: string;
  lokasi: string;
  gambar?: string;
  createdAt: string;
  values: AlternativeValue[];
}

interface AlternativeFormData {
  nama: string;
  lokasi: string;
  gambar?: string;
  values: Record<string, number>; // Use Record<string, number> for dynamic keys
}

export default function AlternativesPage() {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editingAlternative, setEditingAlternative] = useState<Alternative | null>(null);
  const [deletingAlternative, setDeletingAlternative] = useState<Alternative | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AlternativeFormData>();

  // Fetch criterias
  const fetchCriterias = async () => {
    try {
      const response = await axios.get("/api/criterias");
      if (response.data.success) {
        setCriterias(response.data.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data kriteria");
      console.error("Error fetching criterias:", error);
    }
  };

  // Fetch alternatives
  const fetchAlternatives = async () => {
    try {
      const response = await axios.get("/api/alternatives");
      if (response.data.success) {
        setAlternatives(response.data.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data alternatif");
      console.error("Error fetching alternatives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriterias();
    fetchAlternatives();
  }, []);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to server
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data.url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Gagal mengupload gambar');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: AlternativeFormData) => {
    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast.error('Gagal mengupload gambar');
          return;
        }
      }

      // Prepare values array from form data
      const values = Object.entries(data.values || {}).map(([criteriaId, nilai]) => ({
        criteriaId: Number(criteriaId),
        nilai: Number(nilai)
      }));

      const payload = {
        nama: data.nama,
        lokasi: data.lokasi,
        gambar: imageUrl || data.gambar,
        values: values.length > 0 ? values : undefined
      };

      if (editingAlternative) {
        // Update existing alternative
        const response = await axios.put(`/api/alternatives/${editingAlternative.id}`, payload);
        if (response.data.success) {
          toast.success(response.data.message);
          handleCloseForm();
          fetchAlternatives();
        }
      } else {
        // Create new alternative
        const response = await axios.post("/api/alternatives", payload);
        if (response.data.success) {
          toast.success(response.data.message);
          handleCloseForm();
          fetchAlternatives();
        }
      }
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : "Gagal menyimpan alternatif";
      toast.error(errorMessage);
      console.error("Error saving alternative:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    const alternative = alternatives.find(alt => alt.id === id);
    if (!alternative) return;
    
    setDeletingAlternative(alternative);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingAlternative) return;
    
    try {
      const response = await axios.delete(`/api/alternatives/${deletingAlternative.id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAlternatives();
        setDeletingAlternative(null);
      }
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : "Gagal menghapus alternatif";
      toast.error(errorMessage);
      console.error("Error deleting alternative:", error);
    }
  };

  // Handle edit
  const handleEdit = (alternative: Alternative) => {
    setEditingAlternative(alternative);
    
    // Set form values
    const valuesMap: Record<string, number> = {};
    alternative.values.forEach(value => {
      valuesMap[value.criteriaId.toString()] = value.nilai;
    });
    
    reset({
      nama: alternative.nama,
      lokasi: alternative.lokasi,
      gambar: alternative.gambar,
      values: valuesMap
    });
    
    if (alternative.gambar) {
      setImagePreview(alternative.gambar);
    }
    
    setShowForm(true);
  };

  // Handle create
  const handleCreate = () => {
    setEditingAlternative(null);
    const emptyValues: { [key: number]: number } = {};
    criterias.forEach(criteria => {
      emptyValues[criteria.id] = 0;
    });
    
    reset({
      nama: "",
      lokasi: "",
      gambar: "",
      values: emptyValues
    });
    
    setSelectedImage(null);
    setImagePreview(null);
    setShowForm(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAlternative(null);
    setSelectedImage(null);
    setImagePreview(null);
    reset();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card p-8 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Input Alternatif
            </h1>
            <p className="text-white/80">
              Tambahkan data alternatif dengan nilai kriteria yang akan dievaluasi
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowUpload(true)}
              className="btn-secondary"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload File
            </button>
            <button onClick={handleCreate} className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Tambah Manual
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingAlternative ? "Edit Alternatif" : "Tambah Alternatif Baru"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Nama Alternatif *
                  </label>
                  <input
                    {...register("nama", {
                      required: "Nama alternatif harus diisi",
                    })}
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Perumahan Griya Indah"
                  />
                  {errors.nama && (
                    <p className="text-red-300 text-sm mt-1">
                      {errors.nama.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Lokasi *
                  </label>
                  <input
                    {...register("lokasi", { required: "Lokasi harus diisi" })}
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Bandung, Jawa Barat"
                  />
                  {errors.lokasi && (
                    <p className="text-red-300 text-sm mt-1">
                      {errors.lokasi.message}
                    </p>
                  )}
                </div>

                {/* Gambar Upload */}
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">
                    Gambar Perumahan (Opsional)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    />
                    {imagePreview && (
                      <div className="relative inline-block">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={128}
                          height={128}
                          className="w-32 h-32 object-cover rounded-lg border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <p className="text-white/60 text-xs">
                      Format yang didukung: JPEG, PNG, WebP. Maksimal 5MB.
                    </p>
                  </div>
                </div>

                {/* Dynamic Criteria Fields */}
                {criterias.map((criteria) => (
                  <div key={criteria.id}>
                    <label className="block text-white font-medium mb-2">
                      {criteria.nama} *
                    </label>
                    <input
                      {...register(`values.${criteria.id}`, {
                        required: `${criteria.nama} harus diisi`,
                      })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Masukkan ${criteria.nama.toLowerCase()}`}
                    />
                    {errors.values?.[criteria.id.toString()] && (
                      <p className="text-red-300 text-sm mt-1">
                        {errors.values[criteria.id.toString()]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage}
                  className="btn-primary disabled:opacity-50"
                >
                  {uploadingImage 
                    ? "Mengupload gambar..." 
                    : isSubmitting 
                    ? "Menyimpan..." 
                    : "Simpan Alternatif"
                  }
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="btn-secondary"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Upload File Data Perumahan
              </h2>
              <button
                onClick={() => setShowUpload(false)}
                className="btn-secondary"
              >
                Tutup
              </button>
            </div>

            <div className="text-center py-8">
              <Upload className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Fitur import Excel/CSV untuk alternatif</p>
              <p className="text-white/40 text-sm">Akan tersedia dalam update mendatang</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-6">
          Daftar Alternatif Perumahan
        </h2>

        {alternatives.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">Belum ada data alternatif</p>
            <p className="text-white/40">Tambahkan alternatif pertama Anda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-white font-semibold py-3 px-2">
                    Gambar
                  </th>
                  <th className="text-left text-white font-semibold py-3 px-2">
                    Nama Perumahan
                  </th>
                  <th className="text-left text-white font-semibold py-3 px-2">
                    Lokasi
                  </th>
                  {criterias.map((criteria) => (
                    <th key={criteria.id} className="text-left text-white font-semibold py-3 px-2">
                      {criteria.nama}
                    </th>
                  ))}
                  <th className="text-left text-white font-semibold py-3 px-2">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {alternatives.map((alt) => (
                  <tr
                    key={alt.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="py-4 px-2">
                      {alt.gambar ? (
                        <Image
                          src={alt.gambar}
                          alt={alt.nama}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-lg border border-white/20"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                          <Building className="w-6 h-6 text-white/40" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-2 text-white font-medium">
                      {alt.nama}
                    </td>
                    <td className="py-4 px-2 text-white/80">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {alt.lokasi}
                      </div>
                    </td>
                    {criterias.map((criteria) => {
                      const value = alt.values.find(v => v.criteriaId === criteria.id);
                      return (
                        <td key={criteria.id} className="py-4 px-2 text-white/80">
                          {value ? (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                              {value.nilai}
                            </span>
                          ) : (
                            <span className="text-white/40">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-4 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(alt)}
                          className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(alt.id)}
                          className="p-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {alternatives.length > 0 && (
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Total Alternatif
              </h3>
              <p className="text-white/80">
                {alternatives.length} perumahan telah ditambahkan
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">
                Siap untuk perhitungan SAW?
              </p>
              <a href="/calculation" className="inline-block btn-primary mt-2">
                Lanjut ke Perhitungan
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAlternative && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-white/80 mb-6">
              Apakah Anda yakin ingin menghapus alternatif{" "}
              <span className="font-semibold text-white">
                {deletingAlternative.nama}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingAlternative(null)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
