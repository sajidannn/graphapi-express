# 📚 Setup Meta App untuk Mengelola Instagram DM via Graph API

Dokumentasi ini menjelaskan langkah-langkah untuk membuat dan mengkonfigurasi Meta App agar dapat mengakses dan mengelola Direct Message (DM) Instagram Business menggunakan Graph API.

---

## 📋 Langkah-langkah

### 1. Persiapan Akun
- Buat **akun Instagram Business**.
- Buat **Facebook Page**.
- Hubungkan **Instagram Business** ke **Facebook Page** melalui pengaturan akun Instagram.

![Instagram Business Setup](docs/1-instagram-business-setup.png)

---

### 2. Membuat Meta App
- Kunjungi [Meta Developer Portal](https://developers.facebook.com/).
- Klik **Create App**, pilih tipe aplikasi sesuai kebutuhan.
- Setup **Instagram Business Login** pada aplikasi.

![Create Meta App](docs/2-create-meta-app.png)

---

### 3. Menambahkan Instagram Tester
- Pada dashboard aplikasi, buka **Roles > Instagram Testers**.
- Tambahkan username akun Instagram Business kamu sebagai tester.
- Buka Instagram, lalu **terima undangan** yang dikirim.

![Add Instagram Tester](docs/3-add-instagram-tester.png)

---

### 4. Generate Access Token
- Gunakan **Graph API Explorer** atau Developer Tools untuk membuat `access_token`.
- Pastikan memberikan permission seperti:
  - `pages_show_list`
  - `instagram_basic`
  - `instagram_manage_messages`
  - `pages_manage_metadata`
- **Aktifkan Webhook Subscription** pada halaman Facebook terkait.

![Generate Access Token](docs/4-generate-access-token.png)

---

### 5. Siapkan Web App
- Buat web app sederhana dengan 2 endpoint:
  - `GET /privacy-policy` → Privacy Policy Page
  - `POST /webhook` → Webhook Receiver
- Deploy ke server publik seperti Vercel, Render, atau VPS.

![Web App Setup](docs/5-web-app-setup.png)

---

### 6. Konfigurasi Webhook
- Buka menu **Webhooks** di Meta App.
- Tambahkan URL webhook dan Verification Token.
- Aktifkan subscription untuk event seperti:
  - `messages`
  - `messaging_postbacks`
  - `standby` (opsional)

![Webhook Configuration](docs/6-webhook-configuration.png)

---

### 7. Test Webhook Subscription
- Lakukan test webhook melalui dashboard untuk memastikan webhook menerima notifikasi dengan benar.

![Test Webhook](docs/7-test-webhook.png)

---

### 8. Setup Instagram Business Login
- Buka menu **Instagram Basic Display > Settings**.
- Tambahkan `Home Page URL` dan `Privacy Policy URL` dari web app.

![Instagram Business Login](docs/8-instagram-business-login.png)

---

### 9. Update App Settings
- Di **App Settings > Basic**, tambahkan:
  - Privacy Policy URL
  - Terms of Service URL (opsional tapi direkomendasikan)

![Update App Settings](docs/9-update-app-settings.png)

---

### 10. Launch App
- Ubah status aplikasi dari **Development Mode** ke **Live**.
- Pastikan webhook dan permission sudah aktif.
- Aplikasi siap menangkap semua notifikasi DM yang disubscribe.

![Launch App](docs/10-launch-app.png)

---

## ✅ Selesai!
Sekarang Meta App kamu sudah siap untuk mengelola DM Instagram Business secara otomatis melalui Graph API! 🚀

---

