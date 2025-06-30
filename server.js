// ===============================================
// FILE: server.js (Versi Final dengan Perbaikan 'success')
// ===============================================

// 1. Siapkan semua peralatan yang dibutuhkan
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware untuk mengizinkan request dari domain lain (CORS) dan membaca body JSON
app.use(cors());
app.use(express.json());

// 2. Konfigurasi detail koneksi ke Database MySQL di Laragon
const koneksiGudang = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Password default Laragon adalah kosong
    database: 'waa' // Pastikan nama ini sama persis dengan database Anda di HeidiSQL
});

// 3. Lakukan koneksi ke database. Ini langkah krusial.
koneksiGudang.connect((err) => {
    // Jika koneksi gagal, tampilkan error dan hentikan server
    if (err) {
        console.error('!!! KESALAHAN KONEKSI DATABASE !!!:', err);
        return process.exit(1); 
    }
    // Jika berhasil, tampilkan pesan sukses
    console.log('>>> Koneksi ke database MySQL berhasil! <<<');
});

// 4. Resep utama: "Cara Mengolah Pesanan Login" yang datang ke pintu '/login'
app.post('/login', (req, res) => {
    // Ambil data dari body request yang dikirim oleh aplikasi Flutter
    const nomorTeleponDipesan = req.body.phoneNumber;
    const namaDefault = req.body.defaultName;

    // Validasi sederhana di sisi server
    if (!nomorTeleponDipesan) {
        return res.status(400).json({ status: 'error', pesan: 'Nomor telepon tidak boleh kosong.' });
    }

    console.log(`Ada pesanan masuk untuk nomor: ${nomorTeleponDipesan}`);

    const queryCek = 'SELECT * FROM users WHERE phoneNumber = ?';
    koneksiGudang.query(queryCek, [nomorTeleponDipesan], (err, hasilCek) => {
        
        if (err) {
            console.error('Error saat SELECT:', err);
            return res.status(500).json({ status: 'error', pesan: 'Terjadi masalah pada server database.' });
        }

        if (hasilCek.length > 0) {
            // Proses Login untuk pengguna lama
            console.log('Pelanggan lama ditemukan. Login berhasil.');
            // PERBAIKAN: Mengirim 'success' bukan 'sukses'
            res.json({ status: 'success', pesan: 'Login berhasil' });
        } else {
            // Proses Registrasi untuk pengguna baru
            console.log('Pelanggan baru. Daftarkan ke gudang.');
            
            const queryDaftar = 'INSERT INTO users (phoneNumber, name) VALUES (?, ?)';
            koneksiGudang.query(queryDaftar, [nomorTeleponDipesan, namaDefault], (err, hasilDaftar) => {
                
                if (err) {
                    console.error('Error saat INSERT:', err);
                    return res.status(500).json({ status: 'error', pesan: 'Gagal mendaftarkan pengguna baru.' });
                }

                console.log('Pendaftaran berhasil.');
                // PERBAIKAN: Mengirim 'success' bukan 'sukses'
                res.json({ status: 'coba', pesan: 'Registrasi berhasil' });
            });
        }
    });
});

// 5. Buka Dapur untuk menerima pesanan di "pintu" (port) nomor 3000
app.listen(port, () => {
    console.log(`Dapur WhatsApp sudah buka di pintu ${port}!`);
});