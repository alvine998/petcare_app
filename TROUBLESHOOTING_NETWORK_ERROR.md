# Troubleshooting Network Error saat Registrasi

Jika Anda mendapatkan error "Network Error" saat mencoba membuat akun, meskipun WiFi aktif di laptop, ikuti langkah-langkah berikut:

## ⚠️ MASALAH: Emulator Tidak Bisa Akses Internet Melalui Tethering

**Jika Anda menggunakan phone tethering**, Android Emulator sering tidak bisa mengakses internet karena:
- Emulator menggunakan NAT (Network Address Translation) yang berbeda
- Tethering menggunakan routing khusus yang emulator tidak support dengan baik
- DNS dari tethering mungkin tidak bisa diakses oleh emulator

### ✅ SOLUSI UNTUK TETHERING:

#### Opsi 1: Fix DNS (Coba ini dulu!)
Jalankan script ini untuk memperbaiki DNS di emulator:
```bash
./fix_emulator_tethering.sh
```

Script ini akan:
- Set DNS ke Google DNS (8.8.8.8)
- Test koneksi internet
- Test koneksi Firebase

#### Opsi 2: Gunakan Device Fisik (Paling Mudah!)
1. Install aplikasi di phone Anda (yang digunakan untuk tethering)
2. Phone sudah terhubung ke internet (mobile data)
3. Test registrasi langsung di phone

#### Opsi 3: Gunakan WiFi Lain
Jika ada WiFi lain yang bisa diakses, gunakan WiFi tersebut untuk laptop dan emulator akan otomatis terhubung.

#### Opsi 4: Manual DNS Fix
Jika script tidak bekerja, coba manual:
```bash
# Set DNS ke Google DNS
adb shell settings put global private_dns_mode off
adb shell settings put global private_dns_specifier 8.8.8.8
adb shell setprop net.dns1 8.8.8.8
adb shell setprop net.dns2 8.8.4.4

# Restart network
adb shell svc wifi disable
adb shell svc wifi enable
```

#### Opsi 5: Cold Boot Emulator
1. Tutup emulator
2. Di Android Studio: Tools > Device Manager
3. Klik dropdown emulator > Cold Boot Now
4. Setelah boot, jalankan `./fix_emulator_tethering.sh`

## 1. Cek Koneksi Internet di Device/Emulator

### Jika menggunakan Android Emulator:
- Emulator Android **tidak otomatis** menggunakan WiFi laptop Anda
- Emulator menggunakan koneksi internet dari host machine (laptop), tapi bisa terblokir

**Solusi:**
```bash
# Cek apakah emulator bisa akses internet
adb shell ping -c 3 8.8.8.8

# Atau test koneksi ke Firebase
adb shell ping -c 3 firebase.googleapis.com
```

### Jika menggunakan Device Fisik:
- Pastikan device terhubung ke WiFi yang sama dengan laptop
- Atau gunakan mobile data untuk test

## 2. Cek Firewall dan Proxy

Firewall atau proxy bisa memblokir koneksi ke Firebase.

**Solusi:**
- Matikan firewall sementara untuk test
- Jika menggunakan proxy, pastikan Firebase domains tidak di-block:
  - `*.firebase.googleapis.com`
  - `*.firebaseio.com`
  - `*.googleapis.com`

## 3. Cek Konfigurasi Firebase

Pastikan `google-services.json` ada dan benar:

```bash
# Cek apakah file ada
ls -la android/app/google-services.json

# File harus ada di: android/app/google-services.json
```

## 4. Test Koneksi Firebase dari Device

Tambahkan test koneksi di aplikasi:

```javascript
// Test koneksi Firebase
import auth from '@react-native-firebase/auth';

// Test di console
console.log('Firebase App:', auth().app.name);
console.log('Firebase Options:', auth().app.options);
```

## 5. Cek Log Android

Lihat log untuk detail error:

```bash
# Lihat log real-time
adb logcat | grep -i firebase

# Atau lihat semua log
adb logcat
```

Cari error seperti:
- `NetworkException`
- `SocketTimeoutException`
- `UnknownHostException`

## 6. Restart Services

```bash
# Restart Metro bundler
npm start -- --reset-cache

# Rebuild aplikasi
cd android
./gradlew clean
cd ..
npm run android
```

## 7. Cek Internet Permission

Pastikan `AndroidManifest.xml` memiliki permission internet:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 8. Test dengan Mobile Data

Jika WiFi tidak bekerja, coba gunakan mobile data untuk test apakah masalahnya spesifik ke WiFi.

## 9. Cek DNS

Jika menggunakan emulator, coba ubah DNS:

```bash
# Set DNS di emulator
adb shell settings put global private_dns_mode off
adb shell settings put global private_dns_specifier 8.8.8.8
```

## 10. Cek Firebase Console

Pastikan:
- ✅ Firebase project aktif
- ✅ Authentication enabled
- ✅ Email/Password provider enabled
- ✅ Tidak ada quota limit yang tercapai

## Quick Fix

Coba urutan ini:

1. **Restart emulator/device**
2. **Clear app data:**
   ```bash
   adb shell pm clear com.petcare_app
   ```
3. **Rebuild aplikasi:**
   ```bash
   cd android && ./gradlew clean && cd .. && npm run android
   ```
4. **Test dengan mobile data** (jika menggunakan device fisik)

## Jika Masih Error

1. Cek log detail di Android Studio Logcat
2. Cek Firebase Console > Authentication > Users (apakah ada attempt yang masuk?)
3. Cek Network tab di Chrome DevTools jika menggunakan web version untuk reference

## Contact Support

Jika semua langkah di atas sudah dicoba dan masih error, siapkan informasi berikut:
- Device/Emulator yang digunakan
- Android version
- Log dari `adb logcat | grep -i firebase`
- Screenshot error message
- Firebase project ID
