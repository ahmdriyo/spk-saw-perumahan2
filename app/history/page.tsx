'use client';

import { useState, useEffect } from 'react';
import { History, Eye, Trophy, Calendar, TrendingUp, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { formatNumber } from '@/lib/saw-calculator';
import ReportButtons from '@/components/ReportButtons';
import { ReportGenerator } from '@/lib/report-generator';

interface HistoryItem {
  id: number;
  tanggal: string;
  hasil: {
    normalizedAlternatives: Array<{
      id: number;
      nama: string;
      lokasi: string;
      normalizedValues: { [key: number]: number };
      finalScore: number;
      ranking: number;
    }>;
    bestAlternative: {
      id: number;
      nama: string;
      lokasi: string;
      finalScore: number;
    };
    criterias: Array<{
      id: number;
      nama: string;
      bobot: number;
      tipe: 'benefit' | 'cost';
    }>;
  };
  alternatifTerbaik: string;
}

export default function HistoryPage() {
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch histories
  const fetchHistories = async () => {
    try {
      const response = await axios.get('/api/history');
      if (response.data.success) {
        setHistories(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat riwayat');
      console.error('Error fetching histories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  // View details
  const viewDetails = async (historyId: number) => {
    try {
      const response = await axios.get(`/api/history/${historyId}`);
      if (response.data.success) {
        setSelectedHistory(response.data.data);
        setShowDetails(true);
      }
    } catch (error) {
      toast.error('Gagal memuat detail riwayat');
      console.error('Error fetching history detail:', error);
    }
  };

  // Quick print function
  const quickPrint = (history: HistoryItem) => {
    try {
      // Find the best alternative (ranking 1)
      const bestAlternative = history.hasil.normalizedAlternatives.find(alt => alt.ranking === 1);
      
      if (!bestAlternative) {
        toast.error('Tidak dapat menemukan alternatif terbaik');
        return;
      }

      const reportData = {
        normalizedAlternatives: history.hasil.normalizedAlternatives,
        criterias: history.hasil.criterias,
        bestAlternative: bestAlternative,
        tanggal: new Date(history.tanggal)
      };
      
      const reportGenerator = new ReportGenerator(reportData);
      reportGenerator.downloadPDF(`Laporan_${history.id}_${history.alternatifTerbaik.replace(/\s+/g, '_')}.pdf`);
      toast.success('Laporan berhasil diunduh');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Gagal membuat laporan');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card p-8 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-3xl font-bold text-white">Riwayat Perhitungan</h1>
            <p className="text-white/80">
              Daftar hasil perhitungan SAW yang telah dilakukan sebelumnya
            </p>
          </div>
        </div>
      </div>

      {/* History Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Total Perhitungan</h3>
          <div className="text-3xl font-bold text-blue-300">{histories.length}</div>
          <p className="text-white/60 text-sm">riwayat tersimpan</p>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Perhitungan Terakhir</h3>
          <div className="text-lg font-bold text-green-300">
            {histories.length > 0 ? formatDate(histories[0].tanggal).split(',')[0] : '-'}
          </div>
          <p className="text-white/60 text-sm">
            {histories.length > 0 ? formatDate(histories[0].tanggal).split(',')[1] : 'belum ada'}
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Perumahan Terfavorit</h3>
          <div className="text-lg font-bold text-yellow-300">
            {histories.length > 0 ? histories[0].alternatifTerbaik.substring(0, 15) + '...' : '-'}
          </div>
          <p className="text-white/60 text-sm">sering terpilih</p>
        </div>
      </div>

      {/* History List */}
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Daftar Riwayat</h2>
        
        {histories.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">Belum ada riwayat perhitungan</p>
            <p className="text-white/40 mb-6">Lakukan perhitungan SAW pertama Anda</p>
            <a href="/calculation" className="btn-primary">
              Mulai Perhitungan
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {histories.map((history) => (
              <div
                key={history.id}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Perhitungan #{history.id}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {formatDate(history.tanggal)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Trophy className="w-4 h-4" />
                        <span className="font-medium">{history.alternatifTerbaik}</span>
                      </div>
                      <p className="text-white/60 text-sm">
                        {history.hasil.normalizedAlternatives.length} alternatif dievaluasi
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => quickPrint(history)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => viewDetails(history.id)}
                        className="btn-secondary"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetails && selectedHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Detail Perhitungan #{selectedHistory.id}
              </h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedHistory(null);
                }}
                className="btn-secondary"
              >
                Tutup
              </button>
            </div>

            {/* Best Alternative */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Perumahan Terbaik
              </h3>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-500/30">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">
                      🏆 {selectedHistory.hasil.bestAlternative.nama}
                    </h4>
                    <p className="text-white/80">📍 {selectedHistory.hasil.bestAlternative.lokasi}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">
                      {formatNumber(selectedHistory.hasil.bestAlternative.finalScore)}
                    </div>
                    <p className="text-white/60">Skor Akhir</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ranking Results */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Ranking Lengkap</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3 px-2">Ranking</th>
                      <th className="text-left text-white font-semibold py-3 px-2">Perumahan</th>
                      <th className="text-left text-white font-semibold py-3 px-2">Lokasi</th>
                      {selectedHistory.hasil.criterias.map((criteria) => (
                        <th key={criteria.id} className="text-left text-white font-semibold py-3 px-2">
                          {criteria.nama}
                        </th>
                      ))}
                      <th className="text-left text-white font-semibold py-3 px-2">Skor Akhir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedHistory.hasil.normalizedAlternatives.map((alt) => (
                      <tr key={alt.id} className="border-b border-white/10">
                        <td className="py-3 px-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            alt.ranking === 1 ? 'bg-yellow-500' :
                            alt.ranking === 2 ? 'bg-gray-400' :
                            alt.ranking === 3 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {alt.ranking}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-white font-medium">{alt.nama}</td>
                        <td className="py-3 px-2 text-white/80">{alt.lokasi}</td>
                        {selectedHistory.hasil.criterias.map((criteria) => (
                          <td key={criteria.id} className="py-3 px-2 text-white/80">
                            {formatNumber(alt.normalizedValues[criteria.id] || 0)}
                          </td>
                        ))}
                        <td className="py-3 px-2">
                          <span className="text-lg font-bold text-blue-300">
                            {formatNumber(alt.finalScore)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Criteria Weights */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Bobot Kriteria yang Digunakan</h3>
              
              <div className="grid md:grid-cols-4 gap-4">
                {selectedHistory.hasil.criterias.map((criteria) => (
                  <div key={criteria.nama} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${
                        criteria.tipe === 'benefit' ? 'bg-green-400' : 'bg-blue-400'
                      }`}></div>
                      <span className="text-white font-medium">{criteria.nama}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-300">{criteria.bobot}%</div>
                    <p className="text-white/60 text-sm">{criteria.tipe}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation Info */}
            <div className="p-4 bg-white/5 rounded-lg mb-6">
              <p className="text-white/80 text-sm">
                <strong>Tanggal Perhitungan:</strong> {formatDate(selectedHistory.tanggal)}
              </p>
              <p className="text-white/80 text-sm">
                <strong>Metode:</strong> Simple Additive Weighting (SAW)
              </p>
              <p className="text-white/80 text-sm">
                <strong>Jumlah Alternatif:</strong> {selectedHistory.hasil.normalizedAlternatives.length} perumahan
              </p>
            </div>

            {/* Report Buttons */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/20">
              <h4 className="text-white font-semibold mb-4 text-center">
                📄 Cetak Laporan Perhitungan
              </h4>
              <div className="flex justify-center">
                <ReportButtons
                  data={{
                    normalizedAlternatives: selectedHistory.hasil.normalizedAlternatives,
                    criterias: selectedHistory.hasil.criterias,
                    bestAlternative: selectedHistory.hasil.normalizedAlternatives.find(alt => alt.ranking === 1) || selectedHistory.hasil.normalizedAlternatives[0],
                    tanggal: new Date(selectedHistory.tanggal)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {histories.length > 0 && (
        <div className="glass-card p-6 rounded-xl text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Ingin Melakukan Perhitungan Baru?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/alternatives" className="btn-secondary">
              Kelola Alternatif
            </a>
            <a href="/criterias" className="btn-secondary">
              Atur Kriteria
            </a>
            <a href="/calculation" className="btn-primary">
              Perhitungan Baru
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
