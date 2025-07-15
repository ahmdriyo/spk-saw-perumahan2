# Template Upload Data Perumahan

Untuk mengupload data perumahan beserta gambar melalui file Excel atau CSV, pastikan file Anda memiliki kolom-kolom berikut:

## Format Kolom yang Diperlukan:

1. **Nama Perumahan** atau **namaPerumahan** - Nama perumahan (teks)
2. **Lokasi** atau **alamat** - Lokasi perumahan (teks)  
3. **Harga** atau **price** - Harga perumahan (angka, tanpa titik/koma)
4. **Jarak** atau **distance** - Jarak ke pusat kota dalam km (angka desimal)
5. **Fasilitas** atau **facility** - Skor fasilitas 1-10 (angka bulat)
6. **Transportasi** atau **transport** - Skor transportasi 1-10 (angka bulat)
7. **Gambar** atau **image** atau **foto** - URL gambar perumahan (teks, opsional)

## Contoh Data:

| Nama Perumahan | Lokasi | Harga | Jarak | Fasilitas | Transportasi | Gambar |
|---|---|---|---|---|---|---|
| Perumahan Griya Indah | Bandung, Jawa Barat | 500000000 | 5.2 | 8 | 7 | https://example.com/rumah1.jpg |
| Villa Harmoni | Jakarta Selatan | 750000000 | 8.5 | 9 | 8 | https://example.com/rumah2.jpg |
| Cluster Mewah | Surabaya, Jawa Timur | 650000000 | 3.1 | 7 | 9 | /uploads/rumah3.jpg |

## Catatan Penting:

1. **Format File**: Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)
2. **Ukuran File**: Maksimal 5MB
3. **Gambar**: 
   - Isi kolom gambar dengan URL lengkap (http/https) atau path relatif
   - Jika kosong, sistem akan menggunakan placeholder
   - Untuk upload gambar baru, gunakan fitur upload manual di form
4. **Harga**: Masukkan dalam format angka tanpa mata uang (contoh: 500000000 untuk 500 juta)
5. **Jarak**: Dalam satuan kilometer, bisa menggunakan desimal (contoh: 5.2)
6. **Skor**: Fasilitas dan Transportasi harus dalam range 1-10

## Tips Upload:

- Pastikan data sudah sesuai format sebelum upload
- Periksa tidak ada baris kosong di tengah data
- Untuk update data, hapus data lama terlebih dahulu
- Gambar yang diupload manual akan tersimpan di folder `/uploads/`
