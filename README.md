# 📚 Setup Meta App untuk Mengelola Instagram DM via Graph API

Dokumentasi ini menjelaskan langkah-langkah untuk membuat dan mengkonfigurasi Meta App agar dapat mengakses dan mengelola Direct Message (DM) Instagram Business menggunakan Graph API.

---

## 📋 Langkah-langkah

### 1. Persiapan Akun
- Buat **akun Instagram Business**.
- Buat **Facebook Page**.
- Hubungkan **Instagram Business** ke **Facebook Page** melalui pengaturan akun Instagram.

---

### 2. Membuat Meta App
- Kunjungi [Meta Developer Portal](https://developers.facebook.com/).
- Klik **Create App**, pilih tipe aplikasi sesuai kebutuhan.
  ![image](https://github.com/user-attachments/assets/68bef5c4-5fc8-449e-902e-bca99d9779c4)
  ![image](https://github.com/user-attachments/assets/8ed686ce-ea57-4ce6-855d-28f62746f98d)
  ![image](https://github.com/user-attachments/assets/e4d51736-3c19-45ee-8b99-795aa0542db6)
- Setup **Instagram Business Login** pada aplikasi.
  ![image](https://github.com/user-attachments/assets/194af508-cf5c-4909-8eac-b181f1876a79)

---

### 3. Menambahkan Instagram Tester
- Pada dashboard aplikasi, buka **Roles > Instagram Testers**.
  ![image](https://github.com/user-attachments/assets/a30c2171-71a6-43f2-aecc-175f7da4f422)
- Tambahkan username akun Instagram Business kamu sebagai tester.
  ![image](https://github.com/user-attachments/assets/835a0c53-4763-4b41-a7a3-17f0b8a273af)
- Buka Instagram, lalu **terima undangan** yang dikirim.

---

### 4. Generate Access Token
- Gunakan **Graph API Explorer** atau Developer Tools untuk membuat `access_token`.
- Pastikan memberikan permission seperti:
  - `pages_show_list`
  - `instagram_basic`
  - `instagram_manage_messages`
  - `pages_manage_metadata`
- **Aktifkan Webhook Subscription** pada halaman Facebook terkait.
  ![image](https://github.com/user-attachments/assets/0ee9b434-1b5d-47e5-8978-39b5a912b5cb)
  ![image](https://github.com/user-attachments/assets/bc2874e1-44bb-40fd-9abf-7825bacb5dd6)

---

### 5. Siapkan Web App
- Buat web app sederhana dengan 2 endpoint:
  - `GET /privacy-policy` → Privacy Policy Page
  - `POST /webhook` → Webhook Receiver
- Deploy ke server publik seperti Vercel, Render, atau VPS.

---

### 6. Konfigurasi Webhook
- Buka menu **Webhooks** di Meta App.
- Tambahkan URL webhook dan Verification Token.
  ![image](https://github.com/user-attachments/assets/b9dbb671-df8f-4e4c-acdb-21672f9de43c)
- Aktifkan subscription untuk event seperti:
  - `messages`
  - `messaging_postbacks`
  - `standby` (opsional)

![image](https://github.com/user-attachments/assets/b82867f9-f780-4af6-b21b-90be968108e5)

---

### 7. Test Webhook Subscription
- Lakukan test webhook melalui dashboard untuk memastikan webhook menerima notifikasi dengan benar.

![image](https://github.com/user-attachments/assets/6c33d3f9-c5ac-4438-933a-3826535bc01a)


---

### 8. Setup Instagram Business Login
- Tambahkan `Home Page URL` dan `Privacy Policy URL` dari web app.
![image](https://github.com/user-attachments/assets/01bc2f7f-219f-40f6-93b4-55818542bb88)

---

### 9. Update App Settings
- Di **App Settings > Basic**, tambahkan:
  - Privacy Policy URL
  - Terms of Service URL (opsional tapi direkomendasikan)

![image](https://github.com/user-attachments/assets/eeb12f2d-69d1-4291-a648-c3f198a7a172)

---

### 10. Launch App
- Ubah status aplikasi dari **Development Mode** ke **Live**.
- Pastikan webhook dan permission sudah aktif.
- Aplikasi siap menangkap semua notifikasi DM yang disubscribe.

![image](https://github.com/user-attachments/assets/3b0712f9-96a6-47ab-892e-e9fa4d5af487)

---

## ✅ Selesai!
Sekarang Meta App kamu sudah siap untuk mengelola DM Instagram Business secara otomatis melalui Graph API! 🚀

---

