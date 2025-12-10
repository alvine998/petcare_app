# Google Sign-In Setup - Global Setup Guide

## Mengapa Aplikasi di Play Store Bisa Login dengan Google Tanpa Sign SHA-1 Manual?

**Jawaban Singkat**: Aplikasi di Play Store menggunakan **App Signing by Google Play**. Google Play menandatangani APK dengan keystore mereka sendiri, dan SHA-1 dari keystore tersebut sudah otomatis tersedia. Namun, **Anda tetap perlu menambahkan SHA-1 tersebut ke Firebase Console** untuk pertama kali.

## Perbedaan Development vs Production

### Development (Debug Build)
- Menggunakan **debug keystore** (default: `android/app/debug.keystore`)
- SHA-1 perlu ditambahkan **manual** ke Firebase Console
- Setiap developer mungkin punya SHA-1 berbeda

### Production (Release Build di Play Store)
- Menggunakan **App Signing by Google Play**
- Google Play menandatangani APK dengan keystore mereka
- SHA-1 dari Google Play **sudah otomatis tersedia** tapi perlu ditambahkan ke Firebase Console **sekali saja**
- Setelah ditambahkan, semua user yang download dari Play Store bisa login tanpa masalah

## Masalah "Developer_error" di Device Real

Error "Developer_error" biasanya terjadi karena SHA-1 key tidak terdaftar di Firebase Console.

## Cara Mendapatkan SHA-1 Key

### 1. Untuk Debug Build (Development) - CARA TERMUDAH

```bash
# Dari root project - MENAMPILKAN SEMUA SHA-1
cd android
./gradlew signingReport
```

Ini akan menampilkan SHA-1 untuk semua build variants (debug, release, dll).

Atau secara manual:

```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 2. Dari Device Real yang Sudah Terinstall (Tanpa Signing Manual)

Jika aplikasi sudah terinstall di device real, Anda bisa mendapatkan SHA-1 dari APK:

```bash
# 1. Connect device via USB dan enable USB debugging
adb devices

# 2. Dapatkan path APK
adb shell pm path com.petcare_app

# 3. Pull APK
adb pull /data/app/com.petcare_app-xxxxx/base.apk ./app.apk

# 4. Extract SHA-1 dari APK
keytool -printcert -jarfile app.apk | grep SHA1
```

**Lihat file `HOW_TO_GET_SHA1_FROM_DEVICE.md` untuk panduan lengkap berbagai metode.**

### 2. Untuk Release Build (Production) - App Signing by Google Play

**PENTING**: Jika aplikasi Anda menggunakan App Signing by Google Play (default untuk semua aplikasi baru di Play Store), Anda perlu mendapatkan SHA-1 dari Google Play Console, bukan dari keystore lokal Anda.

#### Cara Mendapatkan SHA-1 dari Google Play Console:

1. Buka [Google Play Console](https://play.google.com/console/)
2. Pilih aplikasi Anda
3. Pergi ke **Release** > **Setup** > **App Integrity**
4. Di bagian **App signing key certificate**, Anda akan melihat:
   - **SHA-1 certificate fingerprint**
   - **SHA-256 certificate fingerprint**
5. Copy **SHA-1** fingerprint

#### Jika Belum Menggunakan App Signing by Google Play:

Jika Anda masih menggunakan upload keystore sendiri:

```bash
keytool -list -v -keystore android/app/my-release-key.keystore -alias my-key-alias
```

## Menambahkan SHA-1 ke Firebase Console

### Setup Global (Sekali Saja)

Untuk membuat Google Sign-In bekerja di **semua device** (development dan production), Anda perlu menambahkan **SEMUA** SHA-1 berikut:

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Pergi ke **Project Settings** (ikon gear di sebelah Project Overview)
4. Scroll ke bawah ke bagian **Your apps**
5. Pilih aplikasi Android Anda
6. Klik **Add fingerprint** untuk setiap SHA-1:

#### SHA-1 yang Perlu Ditambahkan:

1. **Debug SHA-1** (untuk development/testing)
   - Dapatkan dari: `cd android && ./gradlew signingReport`
   - Atau: `keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android`

2. **Release SHA-1** (untuk production)
   - Jika menggunakan **App Signing by Google Play**: Dapatkan dari Google Play Console > Release > Setup > App Integrity
   - Jika menggunakan **upload keystore sendiri**: Dapatkan dari keystore release Anda

3. **Upload Key SHA-1** (jika menggunakan App Signing by Google Play)
   - Dapatkan dari keystore yang Anda gunakan untuk upload ke Play Store
   - Atau dari Google Play Console > Release > Setup > App Integrity > Upload key certificate

7. Paste setiap SHA-1 key
8. Klik **Save** setelah menambahkan semua

### Catatan Penting:

- **Setelah menambahkan SHA-1 dari Google Play Console**, semua user yang download aplikasi dari Play Store akan bisa login dengan Google tanpa masalah
- **SHA-1 dari debug keystore** diperlukan untuk testing di device real selama development
- Anda bisa menambahkan **multiple SHA-1** di Firebase Console
- Setelah menambahkan SHA-1, tunggu beberapa menit untuk propagasi

## Verifikasi Konfigurasi

1. **Package Name**: Pastikan package name di `android/app/build.gradle` (applicationId) sama dengan yang di Firebase Console
2. **Web Client ID**: Pastikan Web Client ID di `src/config/firebase.ts` benar
3. **OAuth Consent Screen**: Pastikan sudah dikonfigurasi di [Google Cloud Console](https://console.cloud.google.com/)

## Perbedaan Emulator vs Device Real vs Play Store

- **Emulator**: Menggunakan debug keystore default yang SHA-1-nya perlu ditambahkan ke Firebase
- **Device Real (Development)**: Menggunakan debug keystore yang sama dengan emulator, SHA-1 perlu ditambahkan
- **Play Store (Production)**: Menggunakan App Signing by Google Play, SHA-1 dari Google Play Console perlu ditambahkan **sekali saja**, setelah itu semua user bisa login

## Setup Global - Ringkasan

Untuk membuat Google Sign-In bekerja di **semua environment**:

1. ✅ Tambahkan **Debug SHA-1** ke Firebase Console (untuk development)
2. ✅ Tambahkan **App Signing Key SHA-1** dari Google Play Console (untuk production)
3. ✅ Pastikan **Web Client ID** benar di `src/config/firebase.ts`
4. ✅ Pastikan **Package Name** sama di Firebase Console dan `build.gradle`
5. ✅ Konfigurasi **OAuth Consent Screen** di Google Cloud Console

Setelah setup ini, Google Sign-In akan bekerja di:
- ✅ Emulator
- ✅ Device real (development)
- ✅ Semua device yang download dari Play Store (production)

## Troubleshooting

Jika masih error setelah menambahkan SHA-1:

1. Pastikan Anda menambahkan SHA-1 yang benar (debug vs release)
2. Tunggu beberapa menit setelah menambahkan SHA-1 (propagasi)
3. Hapus dan install ulang aplikasi
4. Clear cache aplikasi Google Play Services
5. Pastikan OAuth consent screen sudah dikonfigurasi dengan benar
