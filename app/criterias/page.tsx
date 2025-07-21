"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Save, Info, Plus, Edit, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { CriteriaPrintButton } from "@/components/PrintButtons";

interface Criteria {
  id: number;
  nama: string;
  bobot: number;
  tipe: "benefit" | "cost";
}

interface CriteriaForm {
  criterias: Criteria[];
}

interface CriteriaFormData {
  nama: string;
  tipe: "benefit" | "cost";
  bobot: number;
}

export default function CriteriasPage() {
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null);
  const [deletingCriteria, setDeletingCriteria] = useState<Criteria | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CriteriaForm>();

  const {
    register: registerModal,
    handleSubmit: handleSubmitModal,
    reset: resetModal,
    formState: { errors: errorsModal, isSubmitting: isSubmittingModal },
  } = useForm<CriteriaFormData>();

  // Watch all criteria weights to calculate total
  const watchedCriterias = watch("criterias") || [];
  const totalBobot = watchedCriterias.reduce(
    (sum, criteria) => sum + (Number(criteria?.bobot) || 0),
    0
  );

  // Fetch criterias
  const fetchCriterias = useCallback(async () => {
    try {
      const response = await axios.get("/api/criterias");
      if (response.data.success) {
        setCriterias(response.data.data);
        setValue("criterias", response.data.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data kriteria");
      console.error("Error fetching criterias:", error);
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    fetchCriterias();
  }, [fetchCriterias]);

  // Handle form submission
  const onSubmit = async (data: CriteriaForm) => {
    try {
      const response = await axios.post("/api/criterias", data);

      if (response.data.success) {
        toast.success(response.data.message);
        setCriterias(response.data.data);
      }
    } catch (error) {
      toast.error("Gagal memperbarui kriteria");
      console.error("Error updating criterias:", error);
    }
  };

  // Handle create/edit criteria
  const onSubmitModal = async (data: CriteriaFormData) => {
    try {
      if (editingCriteria) {
        // Update existing criteria
        const response = await axios.put(
          `/api/criteria/${editingCriteria.id}`,
          data
        );
        if (response.data.success) {
          toast.success(response.data.message);
          fetchCriterias();
          setShowModal(false);
          setEditingCriteria(null);
          resetModal();
        }
      } else {
        // Create new criteria
        const response = await axios.post("/api/criteria", data);
        if (response.data.success) {
          toast.success(response.data.message);
          fetchCriterias();
          setShowModal(false);
          resetModal();
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Gagal menyimpan kriteria";
      toast.error(errorMessage);
      console.error("Error saving criteria:", error);
    }
  };

  // Handle delete criteria
  const handleDelete = async (criteria: Criteria) => {
    try {
      const response = await axios.delete(`/api/criteria/${criteria.id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCriterias();
        setDeletingCriteria(null);
      }
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Gagal menghapus kriteria";
      toast.error(errorMessage);
      console.error("Error deleting criteria:", error);
    }
  };

  // Handle edit
  const handleEdit = (criteria: Criteria) => {
    setEditingCriteria(criteria);
    resetModal({
      nama: criteria.nama,
      tipe: criteria.tipe,
      bobot: criteria.bobot,
    });
    setShowModal(true);
  };

  // Handle create
  const handleCreate = () => {
    setEditingCriteria(null);
    resetModal({
      nama: "",
      tipe: "benefit",
      bobot: 0,
    });
    setShowModal(true);
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
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Pengaturan Bobot Kriteria
              </h1>
              <p className="text-white/80">
                Sesuaikan bobot untuk setiap kriteria. Total bobot harus tepat
                100%.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} className="btn-primary">
              <div className="flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2" />
                Tambah Kriteria
              </div>
            </button>
            {criterias.length > 0 && (
              <CriteriaPrintButton criterias={criterias} />
            )}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-300 mt-1 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Penjelasan Kriteria
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-300 mb-1">Harga (Cost)</h4>
                <p className="text-white/80">
                  Semakin rendah harga, semakin baik (cost criteria)
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-300 mb-1">Jarak (Cost)</h4>
                <p className="text-white/80">
                  Semakin dekat ke pusat kota, semakin baik (cost criteria)
                </p>
              </div>
              <div>
                <h4 className="font-medium text-green-300 mb-1">
                  Fasilitas (Benefit)
                </h4>
                <p className="text-white/80">
                  Semakin tinggi skor fasilitas, semakin baik (benefit criteria)
                </p>
              </div>
              <div>
                <h4 className="font-medium text-green-300 mb-1">
                  Transportasi (Benefit)
                </h4>
                <p className="text-white/80">
                  Semakin mudah akses transportasi, semakin baik (benefit
                  criteria)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Form */}
      {criterias.length > 0 ? (
        <div className="glass-card p-6 rounded-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              {criterias.map((criteria, index) => (
                <div
                  key={criteria.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          criteria.tipe === "benefit"
                            ? "bg-green-400"
                            : "bg-blue-400"
                        }`}
                      ></div>
                      <h3 className="text-lg font-semibold text-white">
                        {criteria.nama}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          criteria.tipe === "benefit"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {criteria.tipe}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(criteria)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                        title="Edit Kriteria"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCriteria(criteria)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                        title="Hapus Kriteria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="block text-white/80 text-sm mb-2">
                        Bobot Kriteria (%)
                      </label>
                      <input
                        {...register(`criterias.${index}.bobot`, {
                          required: "Bobot harus diisi",
                          min: { value: 0, message: "Bobot minimal 0%" },
                          max: { value: 100, message: "Bobot maksimal 100%" },
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25"
                      />
                    </div>

                    <div className="w-20 text-center">
                      <div className="text-2xl font-bold text-white">%</div>
                    </div>
                  </div>

                  {/* Hidden fields for id, nama, and tipe */}
                  <input
                    type="hidden"
                    {...register(`criterias.${index}.id`)}
                    value={criteria.id}
                  />
                  <input
                    type="hidden"
                    {...register(`criterias.${index}.nama`)}
                    value={criteria.nama}
                  />
                  <input
                    type="hidden"
                    {...register(`criterias.${index}.tipe`)}
                    value={criteria.tipe}
                  />
                </div>
              ))}
            </div>

            {/* Total Weight Display */}
            <div className="p-4 bg-white/10 rounded-lg border border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">
                  Total Bobot:
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      Math.abs(totalBobot - 100) < 0.01
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {totalBobot.toFixed(1)}%
                  </span>
                  {Math.abs(totalBobot - 100) < 0.01 ? (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  )}
                </div>
              </div>

              {Math.abs(totalBobot - 100) >= 0.01 && (
                <p className="text-red-300 text-sm mt-2">
                  ⚠️ Total bobot harus tepat 100% untuk dapat melakukan
                  perhitungan SAW
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || Math.abs(totalBobot - 100) >= 0.01}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center">
                  <Save className="w-5 h-5 mr-2" />
                  <span>
                    {isSubmitting ? "Menyimpan..." : "Simpan Bobot Kriteria"}
                  </span>
                </div>
              </button>
            </div>

            {errors.criterias && (
              <p className="text-red-300 text-sm">
                {errors.criterias.message ||
                  "Terjadi kesalahan pada pengisian form"}
              </p>
            )}
          </form>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-xl text-center">
          <div className="mb-6">
            <Settings className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Belum Ada Kriteria
            </h3>
            <p className="text-white/80">
              Mulai dengan menambahkan kriteria pertama untuk sistem pengambilan
              keputusan Anda.
            </p>
          </div>
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Tambah Kriteria Pertama
          </button>
        </div>
      )}
      {/* Next Step */}
      {criterias.length > 0 && Math.abs(totalBobot - 100) < 0.01 && (
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Bobot Kriteria Siap!
              </h3>
              <p className="text-white/80">
                Total bobot sudah 100%, siap untuk perhitungan SAW
              </p>
            </div>
            <a href="/calculation" className="btn-primary">
              Lanjut ke Perhitungan
            </a>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingCriteria ? "Edit Kriteria" : "Tambah Kriteria"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCriteria(null);
                  resetModal();
                }}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitModal(onSubmitModal)}
              className="space-y-4"
            >
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Nama Kriteria
                </label>
                <input
                  {...registerModal("nama", {
                    required: "Nama kriteria harus diisi",
                  })}
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama kriteria"
                />
                {errorsModal.nama && (
                  <p className="text-red-300 text-sm mt-1">
                    {errorsModal.nama.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Tipe Kriteria
                </label>
                <select
                  {...registerModal("tipe", {
                    required: "Tipe kriteria harus dipilih",
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="benefit">
                    Benefit (Semakin tinggi semakin baik)
                  </option>
                  <option value="cost">
                    Cost (Semakin rendah semakin baik)
                  </option>
                </select>
                {errorsModal.tipe && (
                  <p className="text-red-300 text-sm mt-1">
                    {errorsModal.tipe.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Bobot (%)
                </label>
                <input
                  {...registerModal("bobot", {
                    required: "Bobot harus diisi",
                    min: { value: 0, message: "Bobot minimal 0%" },
                    max: { value: 100, message: "Bobot maksimal 100%" },
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25"
                />
                {errorsModal.bobot && (
                  <p className="text-red-300 text-sm mt-1">
                    {errorsModal.bobot.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCriteria(null);
                    resetModal();
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModal}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingModal
                    ? "Menyimpan..."
                    : editingCriteria
                    ? "Perbarui"
                    : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCriteria && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Konfirmasi Hapus</h2>
              <button
                onClick={() => setDeletingCriteria(null)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-white/80 mb-2">
                Apakah Anda yakin ingin menghapus kriteria ini?
              </p>
              <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-semibold">
                  {deletingCriteria.nama}
                </p>
                <p className="text-red-300/80 text-sm">
                  Tipe: {deletingCriteria.tipe} | Bobot:{" "}
                  {deletingCriteria.bobot}%
                </p>
              </div>
              <p className="text-yellow-300 text-sm mt-2">
                ⚠️ Tindakan ini tidak dapat dibatalkan!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingCriteria(null)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deletingCriteria)}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
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
