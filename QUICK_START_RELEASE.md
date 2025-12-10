# Quick Start: Build Release APK dengan SHA-1

## Langkah Cepat (5 Menit)

### 1. Generate Release Keystore

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Isi password dan informasi yang diminta. Simpan password dengan aman!**

### 2. Setup keystore.properties

```bash
cd ../..  # kembali ke root project
cd android
cp keystore.properties.example keystore.properties
```

Edit `android/keystore.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=password-yang-anda-buat
MYAPP_RELEASE_KEY_PASSWORD=password-yang-anda-buat
```

**PENTING**: Pastikan keystore file ada di `android/app/my-release-key.keystore`

### 3. Build Release APK

```bash
# Dari root project
./build-release.sh
```

Atau manual:
```bash
cd android
./gradlew assembleRelease
```

### 4. Dapatkan SHA-1

```bash
cd android
./gradlew signingReport
```

Copy SHA-1 dari bagian **Variant: release**

### 5. Tambahkan SHA-1 ke Firebase

1. Firebase Console > Project Settings > Your apps > Android app
2. Klik **Add fingerprint**
3. Paste SHA-1 dari release keystore
4. **Save**

### 6. Install dan Test

```bash
# Install APK ke device
adb install android/app/build/outputs/apk/release/app-release.apk
```

Test Google Sign-In di device real.

## File yang Dibuat

- ✅ `android/app/my-release-key.keystore` - Release keystore (JANGAN di-commit!)
- ✅ `android/keystore.properties` - Konfigurasi keystore (JANGAN di-commit!)
- ✅ `android/app/build/outputs/apk/release/app-release.apk` - Release APK

## Catatan

- Keystore dan password **HARUS** disimpan dengan aman
- Jika keystore hilang, Anda tidak bisa update aplikasi di Play Store
- File `keystore.properties` sudah ada di `.gitignore` (aman dari commit)
