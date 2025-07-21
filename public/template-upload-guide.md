# Template Upload Data Perumahan

Untuk mengupload data perumahan melalui file Excel atau CSV, pastikan file Anda memiliki kolom-kolom berikut sesuai dengan kriteria yang telah ditentukan:

## Format Kolom yang Diperlukan:

### Kolom Wajib:
1. **Nama Perumahan** - Nama perumahan (teks)
2. **Lokasi** - Lokasi perumahan (teks)  
3. **[Nama Kriteria]** - Sesuai dengan kriteria yang telah dibuat di sistem
4. **Gambar** - URL gambar perumahan (teks, opsional)

### Contoh Struktur Kriteria Default:
- **Harga** - Harga perumahan (angka, dalam Rupiah)
- **Jarak** - Jarak ke pusat kota dalam km (angka desimal)
- **Fasilitas** - Skor fasilitas 1-10 (angka bulat)
- **Transportasi** - Skor transportasi 1-10 (angka bulat)

## Contoh Data CSV:

```csv
Nama Perumahan,Lokasi,Harga,Jarak,Fasilitas,Transportasi,Gambar
Perumahan Griya Indah,Bandung Jawa Barat,500000000,5.2,8,7,
Villa Harmoni,Jakarta Selatan,750000000,8.5,9,8
Cluster Mewah,Surabaya Jawa Timur,650000000,3.1,7,9,
```

## Contoh Data Excel:

| Nama Perumahan | Lokasi | Harga | Jarak | Fasilitas | Transportasi | Gambar |
|---|---|---|---|---|---|---|
| Perumahan Griya Indah | Bandung, Jawa Barat | 500000000 | 5.2 | 8 | 7 |  |
| Villa Harmoni | Jakarta Selatan | 750000000 | 8.5 | 9 | 8 | |
| Cluster Mewah | Surabaya, Jawa Timur | 650000000 | 3.1 | 7 | 9 | |

## Catatan Penting:

1. **Format File**: Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)
2. **Ukuran File**: Maksimal 5MB
3. **Kriteria**: Pastikan nama kolom sesuai dengan nama kriteria yang sudah dibuat di sistem
4. **Gambar**: 
   - Isi kolom gambar dengan URL lengkap (http/https) atau path relatif
   - Jika kosong, sistem akan menggunakan placeholder
   - Untuk upload gambar baru, gunakan fitur upload manual di form
5. **Format Angka**: 
   - Harga: Masukkan dalam format angka tanpa mata uang (contoh: 500000000 untuk 500 juta)
   - Jarak: Dalam satuan yang sudah ditentukan, bisa menggunakan desimal (contoh: 5.2)
   - Skor: Sesuai dengan range yang ditentukan untuk masing-masing kriteria

## Tips Upload:

- **Download Template**: Gunakan tombol "Download Template" untuk mendapatkan template Excel dengan struktur kolom yang tepat
- **Periksa Kriteria**: Pastikan kolom sesuai dengan kriteria yang sudah dibuat di sistem
- **Data Bersih**: Pastikan tidak ada baris kosong di tengah data
- **Update Data**: Untuk update data, hapus data lama terlebih dahulu atau edit manual
- **Test Import**: Mulai dengan file kecil (1-5 baris) untuk memastikan format sudah benar

## Troubleshooting:

- **Error "Kolom tidak ditemukan"**: Pastikan nama kolom sesuai dengan nama kriteria di sistem
- **Error "Format file"**: Pastikan menggunakan .xlsx, .xls, atau .csv
- **Error "Data tidak valid"**: Periksa format angka dan pastikan tidak ada karakter khusus
- **Error "File terlalu besar"**: Kurangi ukuran file atau bagi menjadi beberapa file kecil
