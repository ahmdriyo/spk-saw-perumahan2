"use client";

import { useState, useEffect } from "react";
import { Calculator, Play, Trophy, TrendingUp, Eye } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { SAWResult, formatNumber, NormalizedAlternative } from "@/lib/saw-calculator";
import ReportButtons from "@/components/ReportButtons";

interface AlternativeValue {
  id: number;
  nilai: number;
  criteriaId: number;
  criteria: {
    id: number;
    nama: string;
    bobot: number;
    tipe: "benefit" | "cost";
  };
}

interface Alternative {
  id: number;
  nama: string;
  lokasi: string;
  gambar?: string;
  values: AlternativeValue[];
}

interface Criteria {
  id: number;
  nama: string;
  bobot: number;
  tipe: "benefit" | "cost";
}

export default function CalculationPage() {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const [result, setResult] = useState<SAWResult | null>(null);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Helper function untuk mendapatkan nilai normalisasi berdasarkan nama kriteria
  const getNormalizedValue = (alt: NormalizedAlternative, criteriaName: string): number => {
    const criteria = criterias.find(c => c.nama === criteriaName);
    if (!criteria) return 0;
    return alt.normalizedValues[criteria.id] || 0;
  };

  // Fetch data
  const fetchData = async () => {
    try {
      const [altResponse, critResponse] = await Promise.all([
        axios.get("/api/alternatives"),
        axios.get("/api/criterias"),
      ]);

      if (altResponse.data.success) {
        setAlternatives(altResponse.data.data);
      }
      if (critResponse.data.success) {
        setCriterias(critResponse.data.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate SAW
  const handleCalculate = async () => {
    if (alternatives.length === 0) {
      toast.error("Tidak ada data alternatif untuk dihitung");
      return;
    }

    if (criterias.length === 0) {
      toast.error("Tidak ada data kriteria untuk dihitung");
      return;
    }

    const totalBobot = criterias.reduce(
      (sum, criteria) => sum + criteria.bobot,
      0
    );
    if (Math.abs(totalBobot - 100) >= 0.01) {
      toast.error("Total bobot kriteria harus tepat 100%");
      return;
    }

    setCalculating(true);

    try {
      const response = await axios.post("/api/saw/calculate", {
        alternatives,
        criterias,
      });

      if (response.data.success) {
        setResult(response.data.data);
        setHistoryId(response.data.data.historyId);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Gagal melakukan perhitungan SAW");
      console.error("Error calculating SAW:", error);
    } finally {
      setCalculating(false);
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

  const totalBobot = criterias.reduce(
    (sum, criteria) => sum + criteria.bobot,
    0
  );
  const canCalculate =
    alternatives.length > 0 &&
    criterias.length > 0 &&
    Math.abs(totalBobot - 100) < 0.01;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-3xl font-bold text-white">Perhitungan SAW</h1>
            <p className="text-white/80">
              Perhitungan metode Simple Additive Weighting untuk menentukan
              perumahan terbaik
            </p>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Alternatif</h3>
          <div className="text-3xl font-bold text-blue-300">
            {alternatives.length}
          </div>
          <p className="text-white/60 text-sm">perumahan tersedia</p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Kriteria</h3>
          <div className="text-3xl font-bold text-green-300">
            {criterias.length}
          </div>
          <p className="text-white/60 text-sm">kriteria evaluasi</p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Total Bobot</h3>
          <div
            className={`text-3xl font-bold ${
              Math.abs(totalBobot - 100) < 0.01
                ? "text-green-300"
                : "text-red-300"
            }`}
          >
            {totalBobot.toFixed(1)}%
          </div>
          <p className="text-white/60 text-sm">
            {Math.abs(totalBobot - 100) < 0.01
              ? "siap hitung"
              : "perlu penyesuaian"}
          </p>
        </div>
      </div>

      {/* Calculation Button */}
      <div className="glass-card p-6 rounded-xl text-center">
        {!canCalculate ? (
          <div className="space-y-4">
            <div className="text-yellow-300">
              ⚠️ Persyaratan Perhitungan Belum Terpenuhi
            </div>
            <div className="space-y-2 text-white/80">
              {alternatives.length === 0 && (
                <p>• Belum ada data alternatif perumahan</p>
              )}
              {criterias.length === 0 && <p>• Belum ada data kriteria</p>}
              {Math.abs(totalBobot - 100) >= 0.01 && (
                <p>• Total bobot kriteria harus tepat 100%</p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              {alternatives.length === 0 && (
                <a href="/alternatives" className="btn-secondary">
                  Tambah Alternatif
                </a>
              )}
              {Math.abs(totalBobot - 100) >= 0.01 && (
                <a href="/criterias" className="btn-secondary">
                  Atur Bobot Kriteria
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-green-300">✅ Siap untuk Perhitungan SAW</div>
            <p className="text-white/80">
              {alternatives.length} alternatif perumahan akan dievaluasi dengan{" "}
              {criterias.length} kriteria
            </p>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="btn-primary disabled:opacity-50 text-lg px-8 py-4"
            >
              <div className="flex flex-col items-center justify-center">
                <Play className="w-6 h-6 mr-2" />
                <p>{calculating ? "Menghitung..." : "Mulai Perhitungan SAW"}</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Best Alternative */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">
                Perumahan Terbaik
              </h2>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    🏆 {result.bestAlternative.nama}
                  </h3>
                  <p className="text-white/80 mb-1">
                    📍 {result.bestAlternative.lokasi}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">
                    {formatNumber(result.bestAlternative.finalScore)}
                  </div>
                  <p className="text-white/60">Skor Akhir</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Ranking Perumahan
              </h2>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="btn-secondary"
              >
                <Eye className="w-5 h-5 mr-2" />
                {showDetails ? "Sembunyikan" : "Lihat"} Detail Normalisasi
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-semibold py-3 px-2">
                      Ranking
                    </th>
                    <th className="text-left text-white font-semibold py-3 px-2">
                      Nama Perumahan
                    </th>
                    <th className="text-left text-white font-semibold py-3 px-2">
                      Lokasi
                    </th>
                    <th className="text-left text-white font-semibold py-3 px-2">
                      Skor Akhir
                    </th>
                    <th className="text-left text-white font-semibold py-3 px-2">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.normalizedAlternatives.map((alt) => (
                    <tr
                      key={alt.id}
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="py-4 px-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            alt.ranking === 1
                              ? "bg-yellow-500"
                              : alt.ranking === 2
                              ? "bg-gray-400"
                              : alt.ranking === 3
                              ? "bg-orange-600"
                              : "bg-blue-500"
                          }`}
                        >
                          {alt.ranking}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-white font-medium">
                        {alt.nama}
                      </td>
                      <td className="py-4 px-2 text-white/80">{alt.lokasi}</td>
                      <td className="py-4 px-2">
                        <span className="text-lg font-bold text-blue-300">
                          {formatNumber(alt.finalScore)}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {alt.ranking === 1 && (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                            🏆 Terbaik
                          </span>
                        )}
                        {alt.ranking === 2 && (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm">
                            🥈 Kedua
                          </span>
                        )}
                        {alt.ranking === 3 && (
                          <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
                            🥉 Ketiga
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Normalization Details */}
          {showDetails && (
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                Detail Normalisasi
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3 px-2">
                        Perumahan
                      </th>
                      {criterias.map((criteria) => (
                        <th key={criteria.id} className="text-left text-white font-semibold py-3 px-2">
                          {criteria.nama}
                          <br />
                          <span className="text-xs font-normal text-white/60">
                            (w: {criteria.bobot}%)
                          </span>
                        </th>
                      ))}
                      <th className="text-left text-white font-semibold py-3 px-2">
                        Skor Akhir
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.normalizedAlternatives.map((alt) => (
                      <tr key={alt.id} className="border-b border-white/10">
                        <td className="py-3 px-2 text-white font-medium">
                          {alt.nama}
                        </td>
                        {criterias.map((criteria) => (
                          <td key={criteria.id} className="py-3 px-2 text-white/80">
                            {formatNumber(getNormalizedValue(alt, criteria.nama))}
                          </td>
                        ))}
                        <td className="py-3 px-2 text-blue-300 font-bold">
                          {formatNumber(alt.finalScore)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Keterangan:</h4>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>
                    • Nilai yang ditampilkan adalah hasil normalisasi untuk
                    setiap kriteria
                  </li>
                  <li>
                    • Kriteria <strong>Cost</strong> (Harga, Jarak): nilai
                    terkecil = terbaik
                  </li>
                  <li>
                    • Kriteria <strong>Benefit</strong> (Fasilitas,
                    Transportasi): nilai terbesar = terbaik
                  </li>
                  <li>
                    • Skor akhir = jumlah dari (nilai normalisasi × bobot) untuk
                    semua kriteria
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/history" className="btn-secondary">
                <div className="flex flex-col items-center justify-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Lihat Riwayat Perhitungan
                </div>
              </a>
              <button onClick={handleCalculate} className="btn-primary">
                <div className="flex flex-col items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  Hitung Ulang
                </div>
              </button>
            </div>

            {/* Report Buttons */}
            {result && historyId && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-semibold mb-4 text-center">
                  📊 Cetak Laporan Hasil Perhitungan
                </h3>
                <div className="flex justify-center">
                  <ReportButtons
                    data={{
                      normalizedAlternatives: result.normalizedAlternatives,
                      criterias: result.criterias,
                      bestAlternative: result.bestAlternative,
                      tanggal: new Date(),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
