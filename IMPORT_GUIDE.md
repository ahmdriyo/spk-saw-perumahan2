# 📁 Import Data Alternatif - Panduan Penggunaan

## 🎯 Cara Menggunakan Fitur Import

### 1. **Akses Fitur Import**
- Buka halaman `/alternatives`
- Klik tombol **"Upload File"** di pojok kanan atas
- Modal import akan terbuka

### 2. **Download Template**
Sebelum mengupload, download template terlebih dahulu:
- **Template Excel**: Template dinamis dengan kolom sesuai kriteria aktif
- **Contoh CSV**: File contoh dengan data sample untuk referensi

### 3. **Persiapan Data**
Pastikan file Anda memiliki struktur:
```
Nama Perumahan | Lokasi | [Kriteria1] | [Kriteria2] | ... | Gambar
```

### 4. **Upload File**
- Drag & drop file ke area upload, atau
- Klik area untuk memilih file
- Support: `.xlsx`, `.xls`, `.csv` (max 5MB)

### 5. **Proses Import**
- Sistem akan validasi data otomatis
- Error akan ditampilkan per baris jika ada
- Data valid akan disimpan ke database
- Notifikasi sukses/error akan muncul

## ⚠️ Catatan Penting

### Format Data:
- **Nama Perumahan**: Wajib, text
- **Lokasi**: Wajib, text  
- **[Kriteria]**: Sesuai nama kriteria di sistem
- **Gambar**: Opsional, URL atau path

### Validasi:
- Semua kolom kriteria harus diisi
- Format angka harus benar (tanpa koma/titik ribuan)
- Nama kriteria harus exact match dengan sistem

### Tips:
- Test dengan file kecil dulu (1-3 baris)
- Gunakan template Excel untuk hasil terbaik
- Periksa nama kriteria sebelum upload
- Backup data lama sebelum import besar

## 🔧 Troubleshooting

| Error | Solusi |
|-------|--------|
| "Tipe file tidak didukung" | Gunakan .xlsx, .xls, atau .csv |
| "File terlalu besar" | Kurangi ukuran < 5MB atau bagi file |
| "Kriteria tidak ditemukan" | Pastikan nama kolom = nama kriteria |
| "Data tidak valid" | Periksa format angka dan text |
| "Tidak ada kriteria" | Buat kriteria dulu di menu Kriteria |

## 📞 Support

Jika mengalami kendala:
1. Cek console browser untuk error detail
2. Pastikan database connection OK
3. Verifikasi struktur file sesuai template
4. Test dengan data sample terlebih dahulu
