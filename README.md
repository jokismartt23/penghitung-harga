# JokiSmart PriceDesk

Kalkulator estimasi harga JokiSmart berbentuk **web app / PWA** tanpa database, backend, build tools, atau instalasi dependensi.

## Cara menggunakan
1. Buka `index.html` (online atau melalui server lokal).
2. Pilih layanan, tingkat kesulitan, jumlah pekerjaan, dan deadline.
3. Jika perlu, nyalakan **Estimasi waktu kerja manual** atau masukkan biaya tambahan dan diskon.
4. Lihat harga rekomendasi, rentang negosiasi, dan DP otomatis.
5. Gunakan **Salin penawaran harga**, **Simpan riwayat**, atau **Kirim ke WA**.
6. Buka **Atur Tarif** untuk mengganti tarif dasar JokiSmart sendiri.

## Aturan perhitungan
- `Jam kerja = jam persiapan + (jumlah unit × jam per unit)`, atau jam manual yang dimasukkan.
- `Biaya pengerjaan = jam kerja × tarif per jam × faktor tingkat kesulitan`.
- Tingkat kesulitan: Mudah ×0,8; Sedang ×1; Sulit ×1,4; Sangat Sulit ×1,85.
- Deadline: ≥7 hari ×1; 3–6 hari ×1,08; 2 hari ×1,18; 24 jam ×1,35; 12 jam ×1,55; 6 jam ×1,8.
- `Penawaran = MAX(minimum order, biaya pengerjaan × faktor deadline + biaya tambahan − diskon)`, dibulatkan ke atas Rp5.000.
- Rentang negosiasi: 90–118% estimasi (tetap mengikuti minimum order).
- DP dipilih 30%, 50%, atau 70%, dibulatkan ke atas Rp5.000.

**Catatan:** Tarif bawaan hanya angka simulasi dan bukan riset harga pasar. Konfirmasi ruang lingkup, berkas input, tingkat kesulitan, revisi, serta ketersediaan tenaga sebelum menetapkan harga final.

## Deploy ke Vercel
- Ekstrak ZIP ini, lalu unggah **seluruh file beserta folder `icons`** ke GitHub.
- Vercel → Add New Project → import repository.
- Framework Preset: **Other**.
- Root Directory: `./`.
- Build, Install, Output: **kosong/default**.
- Klik Deploy.

## Pasang aplikasi di HP
Setelah website terbit menggunakan HTTPS:
- Chrome Android: menu `⋮` → **Tambahkan ke layar utama / Install app**.
- Safari iPhone: tombol Share → **Add to Home Screen**.

File tersimpan secara lokal (`localStorage`) di browser pengguna. Tidak ada akun, database, maupun sinkronisasi antardevice. Menghapus data situs/browser dapat menghapus tarif khusus dan riwayat.

**Privasi:** Ini alat admin internal. Jangan memasukkan data rahasia pelanggan atau mempublikasikan alat ini secara terbuka tanpa kontrol akses. PWA serta file statis tidak menyediakan autentikasi keamanan. Jika sudah deploy publik, URL bisa diakses orang lain yang mengetahuinya. `robots noindex` hanya meminta mesin pencari tidak mengindeks dan bukan kontrol akses.
