# 🏠 SPK SAW - Sistem Pendukung Keputusan Perumahan Terbaik

Website Sistem Pendukung Keputusan (SPK) untuk pemilihan perumahan ideal menggunakan metode **Simple Additive Weighting (SAW)**.

![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC)
![Prisma](https://img.shields.io/badge/Prisma-6.11.1-2D3748)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1)

## 🚀 Fitur Utama

### 🏡 **Input Data Alternatif Perumahan**
- Nama perumahan
- Lokasi
- Harga (C1) - kriteria *cost*
- Jarak ke pusat kota (C2) - kriteria *cost*
- Fasilitas (C3) - kriteria *benefit*
- Akses transportasi (C4) - kriteria *benefit*

### ⚖️ **Input Bobot dan Kriteria**
- Bobot kriteria dapat disesuaikan (total harus 100%)
- Preset bobot cepat tersedia
- Validasi real-time

### 🧮 **Perhitungan SAW Otomatis**
- Proses normalisasi berdasarkan jenis kriteria (cost/benefit)
- Perhitungan Vi (nilai akhir setiap alternatif)
- Hasil peringkat dari tertinggi ke terendah
- Detail normalisasi yang dapat dilihat

### 📊 **Simpan Riwayat Perhitungan**
- Menyimpan hasil perhitungan ke database
- Tracking alternatif terbaik
- Parameter dan tanggal perhitungan

### 📈 **Halaman Riwayat**
- Daftar riwayat perhitungan
- Detail hasil normalisasi dan peringkat
- Statistik perhitungan

### 🖨️ **Cetak Laporan PDF (FITUR BARU!)**
- Generate laporan profesional dalam format PDF
- Download dan print langsung dari browser  
- Laporan lengkap dengan analisis dan rekomendasi
- Cetak cepat dari halaman riwayat
- Template laporan yang rapi dan terstruktur

### 🎨 **Responsive UI + UX**
- Layout modern dengan glassmorphism design
- Mobile-friendly dan responsive
- Tema gradasi biru elegan
- Animasi dan transisi halus
- Toast notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS dengan tema gradasi biru modern
- **Database**: MySQL dengan Prisma ORM
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm atau yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Update file .env dengan koneksi database Anda
DATABASE_URL="mysql://username:password@localhost:3306/spk_saw_perumahan"
```

### 3. Generate Prisma Client & Migrate
```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Database (Opsional)
```bash
npx tsx prisma/seed.ts
```

### 5. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🖨️ Fitur Cetak Laporan PDF

### 📄 **Apa yang Bisa Dicetak:**
- Laporan hasil perhitungan SAW lengkap
- Analisis kriteria dan bobot yang digunakan
- Data alternatif perumahan yang dievaluasi
- Hasil normalisasi untuk setiap kriteria
- Peringkat akhir dengan skor SAW
- Rekomendasi perumahan terbaik

### 🎯 **Cara Mencetak Laporan:**

#### **Dari Halaman Perhitungan:**
1. Lakukan perhitungan SAW
2. Scroll ke bawah setelah hasil muncul
3. Klik **"Download PDF"** atau **"Cetak Laporan"**

#### **Dari Halaman Riwayat:**
1. **Cetak Cepat**: Klik tombol hijau (Download) di setiap item
2. **Cetak Detail**: Klik "Detail" → "Download PDF" di modal

### 📊 **Format Laporan PDF:**
- Header dengan judul dan tanggal
- Tabel kriteria dan bobot
- Data alternatif perumahan  
- Hasil normalisasi
- Peringkat final dengan highlight untuk pemenang
- Kesimpulan dan rekomendasi
- Footer informatif

> **💡 Tip**: Gunakan browser Chrome/Edge untuk kualitas print terbaik!

## 🧮 Metode SAW (Simple Additive Weighting)

### Formula Normalisasi:

**Kriteria Benefit (semakin besar semakin baik):**
```
R_ij = X_ij / Max(X_ij)
```

**Kriteria Cost (semakin kecil semakin baik):**
```
R_ij = Min(X_ij) / X_ij
```

### Formula Skor Akhir:
```
V_i = Σ(W_j × R_ij)
```

## 📖 Cara Penggunaan

1. **Input Alternatif** - Tambahkan data perumahan
2. **Atur Bobot Kriteria** - Sesuaikan bobot (total 100%)
3. **Perhitungan SAW** - Jalankan algoritma SAW
4. **Lihat Hasil** - Ranking dan detail normalisasi
5. **🖨️ Cetak Laporan** - Download PDF atau print langsung
6. **Riwayat** - Lihat perhitungan sebelumnya dan cetak ulang

---

Dibuat dengan ❤️ menggunakan Next.js, TypeScript, dan Tailwind CSS.
