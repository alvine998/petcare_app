# Setup Global Google Sign-In - Quick Guide

## Mengapa Aplikasi di Play Store Bisa Login Tanpa Sign SHA-1 Manual?

**Jawaban**: Aplikasi di Play Store menggunakan **App Signing by Google Play**. Google Play menandatangani APK dengan keystore mereka, dan SHA-1 dari keystore tersebut sudah otomatis tersedia. Namun, Anda tetap perlu menambahkannya ke Firebase Console **sekali saja** untuk pertama kali.

## Setup Global (Sekali Saja)

### Langkah 1: Dapatkan Semua SHA-1

#### A. Debug SHA-1 (untuk Development)
```bash
cd android
./gradlew signingReport
```
Copy SHA-1 dari output (bagian `Variant: debug`)

#### B. App Signing Key SHA-1 (untuk Production)
1. Buka [Google Play Console](https://play.google.com/console/)
2. Pilih aplikasi Anda
3. **Release** > **Setup** > **App Integrity**
4. Copy **SHA-1** dari bagian **App signing key certificate**

### Langkah 2: Tambahkan ke Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. **Project Settings** > **Your apps** > Pilih Android app
3. Klik **Add fingerprint** untuk setiap SHA-1:
   - Tambahkan **Debug SHA-1**
   - Tambahkan **App Signing Key SHA-1** dari Google Play Console
4. **Save**

### Langkah 3: Verifikasi

1. ✅ **Web Client ID** sudah benar di `src/config/firebase.ts`
2. ✅ **Package Name** sama di Firebase Console dan `android/app/build.gradle`
3. ✅ **OAuth Consent Screen** sudah dikonfigurasi di [Google Cloud Console](https://console.cloud.google.com/)

## Hasil

Setelah setup ini:
- ✅ **Development**: Bisa login di emulator dan device real
- ✅ **Production**: Semua user yang download dari Play Store bisa login
- ✅ **Tidak perlu** menambahkan SHA-1 manual untuk setiap device baru

## Troubleshooting

### Masih Error "Developer_error"?

1. Pastikan Anda menambahkan **App Signing Key SHA-1** dari Google Play Console (bukan upload key)
2. Tunggu 5-10 menit setelah menambahkan SHA-1 (propagasi)
3. Hapus dan install ulang aplikasi
4. Clear cache Google Play Services

### Belum Upload ke Play Store?

Jika aplikasi belum di-upload ke Play Store:
- Tambahkan **Debug SHA-1** untuk development
- Setelah upload ke Play Store, tambahkan **App Signing Key SHA-1** dari Google Play Console
