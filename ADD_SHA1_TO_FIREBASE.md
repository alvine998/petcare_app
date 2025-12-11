# Cara Menambahkan SHA-1 Release Keystore ke Firebase Console

## SHA-1 dari Release Keystore Anda

**SHA-1**: `FD:3B:28:55:D3:BD:14:FF:3C:82:DA:3F:49:D4:1E:64:71:AC:73:3C`

## Langkah-langkah Menambahkan ke Firebase Console

### 1. Buka Firebase Console

Buka: https://console.firebase.google.com/

### 2. Pilih Project Anda

Klik pada project yang sesuai dengan aplikasi Anda.

### 3. Buka Project Settings

- Klik ikon **gear (⚙️)** di sebelah "Project Overview"
- Atau klik **Project Settings** dari menu

### 4. Pilih Android App

- Scroll ke bawah ke bagian **"Your apps"**
- Pilih aplikasi Android Anda (package: `com.petcare_app`)

### 5. Tambahkan SHA-1 Fingerprint

- Klik tombol **"Add fingerprint"** (atau **"Add SHA certificate fingerprint"**)
- Paste SHA-1 berikut:

```
FD:3B:28:55:D3:BD:14:FF:3C:82:DA:3F:49:D4:1E:64:71:AC:73:3C
```

- Klik **"Save"**

### 6. Verifikasi

Setelah menambahkan:
- ✅ SHA-1 akan muncul di daftar "SHA certificate fingerprints"
- ✅ Tunggu 2-5 menit untuk propagasi
- ✅ Install ulang release APK ke device
- ✅ Test Google Sign-In

## Jika Masih Error Setelah Menambahkan SHA-1

1. **Pastikan SHA-1 sudah benar**: Copy-paste langsung, jangan ketik manual
2. **Tunggu propagasi**: Firebase butuh 2-5 menit untuk update
3. **Clear cache**: 
   ```bash
   adb shell pm clear com.google.android.gms
   ```
4. **Uninstall dan install ulang APK**:
   ```bash
   adb uninstall com.petcare_app
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```
5. **Restart device** (opsional)

## Verifikasi SHA-1 yang Sudah Ditambahkan

Untuk melihat SHA-1 yang sudah ditambahkan:
1. Firebase Console > Project Settings > Your apps > Android app
2. Lihat bagian **"SHA certificate fingerprints"**
3. Pastikan SHA-1 release keystore ada di daftar

## Catatan Penting

- **Debug SHA-1** dan **Release SHA-1** bisa ditambahkan bersamaan
- Firebase mendukung multiple SHA-1 fingerprints
- Setelah ditambahkan, semua device yang install APK dengan keystore tersebut bisa login dengan Google
