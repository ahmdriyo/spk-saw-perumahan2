"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Save, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";

interface Criteria {
  id: number;
  nama: string;
  bobot: number;
  tipe: "benefit" | "cost";
}

interface CriteriaForm {
  criterias: Criteria[];
}

export default function CriteriasPage() {
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CriteriaForm>();

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
        <div className="flex items-center gap-3 mb-4">
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
              <div className="flex flex-col items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                <p>{isSubmitting ? "Menyimpan..." : "Simpan Bobot Kriteria"}</p>
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

      {/* Quick Presets */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">
          Preset Bobot Cepat
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setValue("criterias.0.bobot", 25);
              setValue("criterias.1.bobot", 25);
              setValue("criterias.2.bobot", 25);
              setValue("criterias.3.bobot", 25);
            }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-left transition-colors"
          >
            <div className="font-medium text-white">Bobot Seimbang</div>
            <div className="text-sm text-white/60">
              25% untuk setiap kriteria
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setValue("criterias.0.bobot", 40);
              setValue("criterias.1.bobot", 20);
              setValue("criterias.2.bobot", 20);
              setValue("criterias.3.bobot", 20);
            }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-left transition-colors"
          >
            <div className="font-medium text-white">Prioritas Harga</div>
            <div className="text-sm text-white/60">Harga 40%, lainnya 20%</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setValue("criterias.0.bobot", 20);
              setValue("criterias.1.bobot", 40);
              setValue("criterias.2.bobot", 20);
              setValue("criterias.3.bobot", 20);
            }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-left transition-colors"
          >
            <div className="font-medium text-white">Prioritas Lokasi</div>
            <div className="text-sm text-white/60">Jarak 40%, lainnya 20%</div>
          </button>
        </div>
      </div>

      {/* Next Step */}
      {Math.abs(totalBobot - 100) < 0.01 && (
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
    </div>
  );
}
