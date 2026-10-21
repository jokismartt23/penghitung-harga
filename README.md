# JOKI SMART | Website Resmi (Biru-Hijau)

Versi siap unggah ke GitHub / Vercel. HTML + CSS + JavaScript, tanpa database.

## File dan folder
- `index.html`: seluruh halaman termasuk logo, layanan, portofolio, dokumentasi, form konsultasi, dan SEO
- `styles.css`: desain editorial responsif dan transisi halus
- `app.js`: menu HP, galeri, filter portofolio dan form WhatsApp
- `assets/jokismartt-logo.png`: logo asli pengguna, versi transparan
- `assets/jokismartt-logo-white.png`: logo footer di latar gelap
- `assets/portfolio/`: dokumentasi kerja nyata
- `assets/testimonials/`: arsip komunikasi dan bukti pembayaran yang sudah disensor pada versi sebelumnya
- `vercel.json`: konfigurasi hosting Vercel

## Update website yang SUDAH online di Vercel
1. Ekstrak ZIP ini.
2. Buka repository GitHub yang terhubung ke project Vercel lama.
3. Unggah SELURUH ISI folder ini (semua file dan folder `assets`) ke root repository, bukan ZIP-nya dan bukan folder induk tambahan.
4. GitHub akan memperbarui file di jalur sama. Pilih `Commit changes` pada branch yang digunakan Vercel.
5. Buka Vercel > Project > Deployments, pastikan deployment terbaru berstatus Ready.
6. Refresh website dengan Ctrl+F5 agar cache lama dibersihkan.

CATATAN: Github tidak otomatis menghapus file lama yang hilang pada revisi, hapus file usang bila perlu. Jangan unggah ZIP sumber asli bukti transfer/testimoni karena berpotensi berisi data pribadi.

## Kontak
- WhatsApp `082285150571` (`6282285150571`)
- Instagram `@jokismartt23`

## Catatan penting
- Website memakai screenshot yang sudah disiapkan dan disamarkan pada proyek sebelumnya. Tinjau kembali sebelum membuka repository ke publik.
- Form tidak menyimpan data, hanya membuat pesan WhatsApp di browser pelanggan.
- Alamat website/domain belum dipatok sehingga tidak mengklaim domain yang belum dimiliki.
- FAQ dan layanan bisa diperbarui dengan mengedit teks di index.html.


## Perbaikan logo Oktober 2026
Gambar logo di navbar dan footer sudah ditanam langsung dalam `index.html` sebagai data URI, sehingga tetap tampil meskipun file logo di `assets/` tidak terunggah. File logo PNG tetap disertakan sebagai cadangan. Jika website sebelumnya sudah deploy, cukup unggah ulang `index.html` pada root repository GitHub dan Commit changes; Vercel akan membangun deployment baru bila integrasi Git aktif. Namun, file aset lain seperti portfolio dan testimonial tetap memerlukan folder `assets/` dalam repository.
