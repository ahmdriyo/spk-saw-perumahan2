"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, Building } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { formatCurrency } from "@/lib/saw-calculator";

interface Alternative {
  id: number;
  namaPerumahan: string;
  lokasi: string;
  harga: number;
  jarak: number;
  fasilitas: number;
  transportasi: number;
  createdAt: string;
}

interface AlternativeForm {
  namaPerumahan: string;
  lokasi: string;
  harga: number;
  jarak: number;
  fasilitas: number;
  transportasi: number;
}

export default function AlternativesPage() {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AlternativeForm>();

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
    fetchAlternatives();
  }, []);

  // Handle form submission
  const onSubmit = async (data: AlternativeForm) => {
    try {
      const response = await axios.post("/api/alternatives", {
        ...data,
        harga: Number(data.harga),
        jarak: Number(data.jarak),
        fasilitas: Number(data.fasilitas),
        transportasi: Number(data.transportasi),
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowForm(false);
        reset();
        fetchAlternatives();
      }
    } catch (error) {
      toast.error("Gagal menambahkan alternatif");
      console.error("Error creating alternative:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus alternatif ini?")) return;

    try {
      const response = await axios.delete(`/api/alternatives/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAlternatives();
      }
    } catch (error) {
      toast.error("Gagal menghapus alternatif");
      console.error("Error deleting alternative:", error);
    }
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
              Input Alternatif Perumahan
            </h1>
            <p className="text-white/80">
              Tambahkan data perumahan dengan kriteria yang akan dievaluasi
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <div className="flex flex-col items-center justify-center">
              <Plus className="w-5 h-5 mr-2" />
              <p>Tambah Alternatif</p>
            </div>
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              Tambah Alternatif Baru
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Nama Perumahan *
                  </label>
                  <input
                    {...register("namaPerumahan", {
                      required: "Nama perumahan harus diisi",
                    })}
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Perumahan Griya Indah"
                  />
                  {errors.namaPerumahan && (
                    <p className="text-red-300 text-sm mt-1">
                      {errors.namaPerumahan.message}
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

                <div>
                  <label className="block text-white font-medium mb-2">
                    Harga (Rp) *
                  </label>
                  <input
                    {...register("harga", {
                      required: "Harga harus diisi",
                      min: { value: 1, message: "Harga harus lebih dari 0" },
                    })}
                    type="number"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500000000"
                  />
                  {errors.harga && (
                    <p className="text-red-300 text-sm mt-1">
                      {errors.harga.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Jarak ke Pusat Kota (km) *
                  </label>
                  <input
                    {...register("jarak", {
                      required: "Jarak harus diisi",
                      min: { value: 0.1, message: "Jarak harus lebih dari 0" },
                    })}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5.5"
                  />
                  {errors.jarak && (
                    <p className="text-red-300 text-sm mt-1">
                      {errors.jarak.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Fasilitas (1-10) *
                  </label>
                  <select
                    {...register("fasilitas", {
                      required: "Skor fasilitas harus dipilih",
                      min: { value: 1, message: "Minimal skor 1" },
                      max: { value: 10, message: "Maksimal skor 10" },
                    })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Skor</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-gray-800">
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  {errors.fasilitas && (
                    <p className="text-red-300 text-sm mt-1">
                      {errors.fasilitas.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Akses Transportasi (1-10) *
                  </label>
                  <select
                    {...register("transportasi", {
                      required: "Skor transportasi harus dipilih",
                      min: { value: 1, message: "Minimal skor 1" },
                      max: { value: 10, message: "Maksimal skor 10" },
                    })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Skor</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-gray-800">
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  {errors.transportasi && (
                    <p className="text-red-300 text-sm mt-1">
                      {errors.transportasi.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Alternatif"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    reset();
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
                    Nama Perumahan
                  </th>
                  <th className="text-left text-white font-semibold py-3 px-2">
                    Lokasi
                  </th>
                  <th className="text-left text-white font-semibold py-3 px-2">
                    Harga
                  </th>
                  <th className="text-left text-white font-semibold py-3 px-2">
                    Jarak (km)
                  </th>
                  <th className="text-left text-white font-semibold py-3 px-2">
                    Fasilitas
                  </th>
                  <th className="text-left text-white font-semibold py-3 px-2">
                    Transportasi
                  </th>
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
                    <td className="py-4 px-2 text-white font-medium">
                      {alt.namaPerumahan}
                    </td>
                    <td className="py-4 px-2 text-white/80 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {alt.lokasi}
                    </td>
                    <td className="py-4 px-2 text-white/80">
                      <p className="text-sm">{formatCurrency(alt.harga)}</p>
                    </td>
                    <td className="py-4 px-2 text-white/80">{alt.jarak} km</td>
                    <td className="py-4 px-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                        {alt.fasilitas}/10
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                        {alt.transportasi}/10
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex gap-2">
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
    </div>
  );
}
