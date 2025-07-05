# 📄 Fitur Cetak Laporan - SPK Perumahan SAW

## ✨ Fitur Baru: Cetak Laporan PDF

Kami telah menambahkan fitur cetak laporan yang komprehensif untuk Sistem Pendukung Keputusan (SPK) Pemilihan Perumahan dengan metode SAW. Fitur ini memungkinkan pengguna untuk mencetak dan mengunduh laporan hasil perhitungan dalam format PDF yang profesional.

## 🎯 Fitur yang Ditambahkan

### 1. **Generator Laporan PDF Otomatis**
- **File**: `lib/report-generator.ts`
- **Class**: `ReportGenerator`
- **Fungsi**: Membuat laporan PDF dengan layout profesional
- **Dependencies**: `jspdf`, `jspdf-autotable`

### 2. **Komponen Tombol Laporan**
- **File**: `components/ReportButtons.tsx`
- **Fitur**: 
  - Tombol Download PDF
  - Tombol Cetak Langsung
  - Loading state saat generate
  - Error handling

### 3. **API Endpoint Laporan**
- **Route**: `/api/report/generate`
- **Method**: POST
- **Fungsi**: Generate PDF dari server dan download

## 📊 Isi Laporan PDF

Laporan yang dihasilkan mengandung:

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
