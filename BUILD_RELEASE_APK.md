# Build Release APK dengan SHA-1

## Langkah 1: Generate Release Keystore (Jika Belum Ada)

### Generate Keystore Baru

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Isi informasi yang diminta:**
- Password keystore: (buat password yang kuat, simpan dengan aman!)
- Password key alias: (bisa sama dengan keystore password)
- Nama, organisasi, dll: (isi sesuai kebutuhan)

**PENTING**: Simpan keystore dan password dengan aman! Jika hilang, Anda tidak bisa update aplikasi di Play Store.

### Atau Gunakan Keystore yang Sudah Ada

Jika Anda sudah punya keystore untuk upload ke Play Store, gunakan yang itu.

## Langkah 2: Setup Release Keystore di build.gradle

### Menggunakan keystore.properties (Recommended - Lebih Aman)

1. Copy template file:

```bash
cd android
cp keystore.properties.example keystore.properties
```

2. Edit `android/keystore.properties` dan isi dengan nilai yang benar:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your-keystore-password
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

**PENTING**: 
- File `keystore.properties` sudah ditambahkan ke `.gitignore` (tidak akan di-commit)
- Simpan password dengan aman!
- Keystore file harus ada di `android/app/` directory

3. `build.gradle` sudah dikonfigurasi untuk menggunakan `keystore.properties` secara otomatis.

## Langkah 3: Build Release APK

### Opsi A: Menggunakan Script (Termudah)

```bash
# Dari root project
./build-release.sh
```

Script ini akan:
- Build release APK
- Menampilkan SHA-1 dari release keystore
- Memberikan instruksi next steps

### Opsi B: Build Manual

#### Build APK (untuk Testing/Install Manual)

```bash
cd android
./gradlew assembleRelease
```

APK akan ada di: `android/app/build/outputs/apk/release/app-release.apk`

#### Build AAB (untuk Upload ke Play Store)

```bash
cd android
./gradlew bundleRelease
```

AAB akan ada di: `android/app/build/outputs/bundle/release/app-release.aab`

## Langkah 4: Dapatkan SHA-1 dari Release Keystore

### Dari Keystore

```bash
keytool -list -v -keystore android/app/my-release-key.keystore -alias my-key-alias
```

### Dari APK yang Sudah Di-build

```bash
keytool -printcert -jarfile android/app/build/outputs/apk/release/app-release.apk | grep SHA1
```

### Dari Gradle Signing Report (Termudah)

```bash
cd android
./gradlew signingReport
```

Ini akan menampilkan SHA-1 untuk semua build types termasuk release.

## Langkah 5: Tambahkan SHA-1 ke Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. **Project Settings** > **Your apps** > Pilih Android app
3. Klik **Add fingerprint**
4. Paste SHA-1 dari release keystore
5. **Save**

## Verifikasi

Setelah menambahkan SHA-1:
- ✅ Release APK bisa login dengan Google
- ✅ Semua device yang install release APK bisa login
- ✅ Tidak perlu menambahkan SHA-1 untuk setiap device baru

## Troubleshooting

### Error: Keystore file not found

Pastikan path keystore benar di `build.gradle` atau `keystore.properties`.

### Error: Password salah

Pastikan password di `keystore.properties` atau `build.gradle` benar.

### Error: Alias tidak ditemukan

Pastikan alias di `build.gradle` sama dengan alias saat generate keystore.
