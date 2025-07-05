import Link from "next/link";
import { Calculator, Home, TrendingUp, Shield, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="glass-card p-12 rounded-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Sistem Pendukung Keputusan
            <span className="block text-3xl md:text-5xl bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Pemilihan Perumahan Terbaik
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Temukan perumahan ideal Anda dengan bantuan metode{" "}
            <strong>Simple Additive Weighting (SAW)</strong>. Sistem ini
            membantu menganalisis berbagai kriteria untuk memberikan rekomendasi
            terbaik.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/alternatives" className="btn-primary flex justify-center text-center">
              <Home className="w-5 h-5 mr-2" />
              <p>Mulai Input Data</p>
            </Link>
            <Link href="/calculation" className="btn-secondary">
              <Calculator className="w-5 h-5 mr-2" />
              Lihat Perhitungan
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform duration-200">
          <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Home className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Input Alternatif
          </h3>
          <p className="text-white/80">
            Tambahkan data perumahan dengan berbagai kriteria seperti harga,
            lokasi, fasilitas, dan akses transportasi.
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform duration-200">
          <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Perhitungan SAW
          </h3>
          <p className="text-white/80">
            Sistem otomatis menghitung normalisasi dan ranking menggunakan
            metode Simple Additive Weighting.
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform duration-200">
          <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Bobot Kriteria
          </h3>
          <p className="text-white/80">
            Sesuaikan bobot untuk setiap kriteria sesuai dengan prioritas dan
            kebutuhan Anda.
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform duration-200">
          <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Riwayat Perhitungan
          </h3>
          <p className="text-white/80">
            Simpan dan lihat kembali hasil perhitungan sebelumnya untuk
            perbandingan yang lebih baik.
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="glass-card p-8 rounded-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Bagaimana Cara Kerjanya?
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
              1
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Input Data
            </h3>
            <p className="text-white/80 text-sm">
              Masukkan data perumahan dengan kriteria: harga, jarak, fasilitas,
              dan transportasi
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
              2
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Atur Bobot
            </h3>
            <p className="text-white/80 text-sm">
              Tentukan tingkat kepentingan setiap kriteria dengan total bobot
              100%
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
              3
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Hitung SAW
            </h3>
            <p className="text-white/80 text-sm">
              Sistem melakukan normalisasi dan perhitungan skor akhir secara
              otomatis
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
              4
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Hasil Terbaik
            </h3>
            <p className="text-white/80 text-sm">
              Dapatkan ranking perumahan terbaik berdasarkan kriteria yang telah
              ditentukan
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-card p-8 rounded-2xl text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Siap Mencari Perumahan Ideal?
        </h2>
        <p className="text-white/90 mb-6">
          Mulai dengan menambahkan data perumahan dan tentukan kriteria yang
          paling penting bagi Anda.
        </p>
        <Link href="/alternatives" className="btn-primary">
          Mulai Sekarang
        </Link>
      </section>
    </div>
  );
}
