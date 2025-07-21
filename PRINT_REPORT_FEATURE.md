# 📄 Fitur Import Excel/CSV & Cetak Laporan - SPK Perumahan SAW

## ✨ Update Terbaru: Fitur Import Data Alternatif

Kami telah berhasil memperbaiki dan mengimplementasikan fitur import data alternatif menggunakan file Excel (.xlsx, .xls) atau CSV (.csv). Fitur ini memungkinkan pengguna untuk mengunggah data perumahan secara massal dengan mudah dan efisien.

## 🚀 Fitur Import Yang Diperbaiki

### 1. **Import Excel/CSV untuk Alternatif**
- **File API**: `app/api/import/alternatives/route.ts`
- **Support Format**: Excel (.xlsx, .xls) dan CSV (.csv)
- **Ukuran Max**: 5MB per file
- **Validasi**: Otomatis validasi data sesuai struktur database

### 2. **Komponen FileUpload**
- **File**: `components/FileUpload.tsx`
- **Fitur**: 
  - Drag & Drop interface
  - Progress indicator
  - Error handling dengan detail
  - Template download (Excel & CSV)
  - Validasi format file

### 3. **Template Dinamis**
- **Excel Template**: `/api/template` - Generate template berdasarkan kriteria aktif
- **CSV Contoh**: `/api/template/csv` - File contoh dengan data sample
- **Struktur Dinamis**: Menyesuaikan dengan kriteria yang sudah dibuat

### 4. **Error Handling & Feedback**
- **Validasi Detail**: Error per baris dengan pesan spesifik
- **Toast Notifications**: Feedback real-time untuk user
- **Data Preview**: Menampilkan data yang berhasil divalidasi
- **Batch Processing**: Import data dalam transaction untuk konsistensi

## 📋 Format File Import

### Kolom Wajib:
1. **Nama Perumahan** - Nama perumahan (text)
2. **Lokasi** - Alamat/lokasi perumahan (text)
3. **[Nama Kriteria]** - Sesuai kriteria yang dibuat di sistem
4. **Gambar** - URL gambar (optional)

### Contoh Struktur:
```csv
Nama Perumahan,Lokasi,Harga,Jarak,Fasilitas,Transportasi,Gambar
Perumahan Griya Indah,Bandung Jawa Barat,500000000,5.2,8,7
Villa Harmoni,Jakarta Selatan,750000000,8.5,9,8,
```

## 🔧 Teknologi & Dependencies

### Packages Used:
- **xlsx**: ^0.18.5 - Excel file processing
- **zod**: ^3.25.72 - Data validation
- **prisma**: Database ORM dengan transaction
- **multer**: File upload handling

### API Features:
- **Dynamic Column Mapping**: Otomatis map kolom dengan kriteria
- **Data Normalization**: Convert format data ke struktur database
- **Transaction Safety**: Rollback jika ada error
- **Batch Insert**: Efficient bulk data insertion

### 1. **Header Laporan**
- Logo/Judul sistem
- Tanggal dan waktu pembuatan laporan
- Informasi metode SAW

### 2. **Tabel Kriteria dan Bobot**
- Daftar semua kriteria yang digunakan
- Bobot masing-masing kriteria (%)
- Jenis kriteria (Benefit/Cost)
- Keterangan setiap kriteria

### 3. **Data Alternatif Perumahan**
- Nama perumahan
- Lokasi
- Harga (format Rupiah)
- Jarak ke pusat kota
- Skor fasilitas (1-10)
- Skor transportasi (1-10)

### 4. **Hasil Normalisasi**
- Nilai normalisasi untuk setiap kriteria
- Perhitungan sesuai jenis kriteria:
  - **Cost** (Harga, Jarak): Min/Xi
  - **Benefit** (Fasilitas, Transportasi): Xi/Max

### 5. **Peringkat Akhir**
- Ranking lengkap dari 1 hingga terakhir
- Skor akhir (Vi) setiap alternatif
- Kategori (Terbaik/Baik/Cukup)
- Highlight khusus untuk peringkat 1

### 6. **Kesimpulan dan Rekomendasi**
- Box khusus untuk alternatif terbaik
- Skor akhir dan informasi detail
- Rekomendasi berdasarkan perhitungan

### 7. **Footer Informasi**
- Informasi sistem yang digunakan
- Nomor halaman
- Disclaimer

## 🚀 Cara Menggunakan

### **Di Halaman Perhitungan (`/calculation`)**

1. Lakukan perhitungan SAW
2. Setelah hasil muncul, scroll ke bawah
3. Klik tombol **"Download PDF"** atau **"Cetak Laporan"**
4. PDF akan otomatis diunduh atau dibuka untuk cetak

```tsx
// Tombol muncul setelah perhitungan selesai
{result && historyId && (
  <ReportButtons
    data={{
      normalizedAlternatives: result.normalizedAlternatives,
      criterias: result.criterias,
      bestAlternative: result.bestAlternative,
      tanggal: new Date()
    }}
  />
)}
```

### **Di Halaman Riwayat (`/history`)**

#### **Cetak Cepat dari Daftar:**
1. Buka halaman Riwayat
2. Klik tombol **hijau (Download)** di setiap item riwayat
3. PDF langsung diunduh

#### **Cetak Lengkap dari Detail:**
1. Klik tombol **"Detail"** pada item riwayat
2. Di modal detail, scroll ke bawah
3. Klik **"Download PDF"** atau **"Cetak Laporan"**

## 🎨 Desain Laporan

### **Warna dan Tema:**
- Header: Gradasi biru (sesuai tema website)
- Tabel: Border biru dengan header biru
- Highlight: Kuning untuk peringkat 1
- Text: Hitam untuk readability

### **Layout:**
- Format A4 portrait
- Font: Helvetica (clean & professional)
- Margin: 20mm semua sisi
- Auto table sizing
- Responsive column width

### **Elemen Visual:**
- Icon emoji untuk section headers
- Color coding untuk jenis kriteria
- Gradient box untuk rekomendasi
- Professional footer

## 🛠️ Konfigurasi Teknis

### **Dependencies Baru:**
```json
{
  "jspdf": "^2.x.x",
  "jspdf-autotable": "^3.x.x", 
  "html2canvas": "^1.x.x",
  "@types/jspdf": "^2.x.x"
}
```

### **Type Safety:**
- Full TypeScript support
- Strict typing untuk data laporan
- Interface yang jelas untuk semua komponen

### **Error Handling:**
- Try-catch pada semua fungsi generate
- Toast notification untuk feedback
- Loading states untuk UX

## 📱 Responsive Design

### **Desktop:**
- Tombol horizontal dengan icon dan text
- Preview lengkap sebelum print

### **Mobile:**
- Tombol stacked vertikal
- Touch-friendly buttons
- Optimized untuk layar kecil

## 🔧 Kustomisasi

### **Nama File PDF:**
- Format default: `Laporan_SPK_Perumahan_YYYY-MM-DD.pdf`
- Bisa dikustomisasi per perhitungan
- Include ID dan nama alternatif terbaik

### **Template Laporan:**
- Mudah dimodifikasi di `ReportGenerator` class
- Configurable header dan footer
- Extensible untuk kriteria tambahan

## 🚨 Error Handling

### **Client Side:**
- Validasi data sebelum generate
- Loading indicator saat proses
- Toast message untuk feedback

### **Server Side:**
- Validasi history ID
- Error response yang informatif
- Graceful failure handling

## 💡 Tips Penggunaan

1. **Kualitas Print Terbaik:**
   - Gunakan browser Chrome/Edge
   - Pastikan printer setting ke "High Quality"

2. **Mobile Users:**
   - Download PDF lebih stabil daripada print langsung
   - Share via WhatsApp/Email supported

3. **Batch Printing:**
   - Cetak cepat dari halaman history untuk multiple reports
   - Gunakan nama file yang descriptive

## 🔄 Future Improvements

### **Planned Features:**
- [ ] Export ke Excel format
- [ ] Email laporan langsung
- [ ] Custom template selection
- [ ] Watermark options
- [ ] Multi-language support

### **Performance Optimizations:**
- [ ] PDF generation caching
- [ ] Lazy loading untuk large datasets
- [ ] Background processing untuk batch reports

---

## 📞 Support

Jika ada kendala dengan fitur cetak laporan:
1. Pastikan browser mendukung PDF download
2. Check network connection untuk generate di server
3. Untuk laporan kosong, pastikan data perhitungan valid

**Fitur cetak laporan ini menghadirkan profesionalisme dalam penyajian hasil analisis SPK, memudahkan stakeholder untuk memahami dan menggunakan hasil perhitungan untuk pengambilan keputusan.**
