# Cara Mendapatkan SHA-1 dari Device Real Tanpa Signing

## Metode 1: Dari APK yang Sudah Terinstall di Device

Jika aplikasi sudah terinstall di device, Anda bisa mendapatkan SHA-1 dari APK tersebut:

### A. Menggunakan ADB (Android Debug Bridge)

```bash
# 1. Connect device via USB dan enable USB debugging
# 2. Dapatkan package name aplikasi
adb shell pm list packages | grep petcare

# 3. Dapatkan path APK dari package
adb shell pm path com.petcare_app

# 4. Pull APK ke komputer
adb pull /data/app/com.petcare_app-xxxxx/base.apk ./app.apk

# 5. Extract dan lihat certificate SHA-1
keytool -printcert -jarfile app.apk
```

Atau lebih sederhana:

```bash
# Langsung dari device (jika sudah terinstall)
adb shell pm list packages -f | grep petcare
adb pull /data/app/com.petcare_app-xxxxx/base.apk
keytool -printcert -jarfile base.apk | grep SHA1
```

### B. Menggunakan APK Analyzer (Android Studio)

1. Buka Android Studio
2. **Build** > **Analyze APK**
3. Pilih APK yang sudah di-sign
4. Buka folder **META-INF**
5. Buka file **CERT.RSA** atau **CERT.DSA**
6. Lihat **SHA-1** fingerprint

## Metode 2: Dari Keystore yang Digunakan untuk Sign APK

Jika Anda tahu keystore mana yang digunakan untuk sign APK di device:

### A. Debug Keystore (Default untuk Development)

```bash
# Lokasi default debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Atau jika di project:

```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### B. Custom Keystore

```bash
keytool -list -v -keystore path/to/your/keystore.jks -alias your-alias
```

## Metode 3: Dari Gradle Signing Report

Cara termudah untuk mendapatkan semua SHA-1 yang digunakan:

```bash
cd android
./gradlew signingReport
```

Ini akan menampilkan SHA-1 untuk:
- Debug variant
- Release variant (jika sudah dikonfigurasi)
- Semua build types yang ada

## Metode 4: Dari Device yang Sudah Terinstall (Tanpa APK File)

### Menggunakan ADB untuk Mendapatkan Certificate

```bash
# 1. Connect device
adb devices

# 2. Dapatkan package name
adb shell pm list packages | grep petcare

# 3. Dapatkan certificate info langsung dari device
adb shell dumpsys package com.petcare_app | grep -A 5 "signatures"
```

### Menggunakan APK Info App

1. Install aplikasi seperti **APK Info** atau **App Info** dari Play Store
2. Buka aplikasi Anda
3. Lihat **Certificate** atau **Signing** section
4. Copy SHA-1 fingerprint

## Metode 5: Dari Google Play Console (Jika Sudah Di-upload)

Jika aplikasi sudah di-upload ke Play Store:

1. Buka [Google Play Console](https://play.google.com/console/)
2. Pilih aplikasi Anda
3. **Release** > **Setup** > **App Integrity**
4. Lihat **App signing key certificate** section
5. Copy **SHA-1** fingerprint

## Metode 6: Dari Build Output (Jika Baru Saja Build)

Setelah build APK, SHA-1 ada di build output:

```bash
# Build APK
cd android
./gradlew assembleDebug

# SHA-1 akan muncul di output build atau
./gradlew signingReport
```

## Cara Cepat: Script Otomatis

Buat file `get-sha1.sh`:

```bash
#!/bin/bash

echo "=== Getting SHA-1 from Device ==="

# Method 1: From installed APK
echo "1. Getting package info..."
PACKAGE_NAME=$(adb shell pm list packages | grep petcare | cut -d: -f2)
echo "Package: $PACKAGE_NAME"

echo "2. Getting APK path..."
APK_PATH=$(adb shell pm path $PACKAGE_NAME | cut -d: -f2)
echo "APK Path: $APK_PATH"

echo "3. Pulling APK..."
adb pull $APK_PATH ./temp.apk

echo "4. Extracting SHA-1..."
SHA1=$(keytool -printcert -jarfile ./temp.apk | grep -oP 'SHA1:\s*\K[0-9A-F:]+')
echo "SHA-1: $SHA1"

echo "5. Cleaning up..."
rm ./temp.apk

echo "=== Done ==="
```

Jalankan:
```bash
chmod +x get-sha1.sh
./get-sha1.sh
```

## Troubleshooting

### Device Tidak Terdeteksi

```bash
# Check ADB connection
adb devices

# Jika tidak muncul, enable USB debugging di device
# Settings > Developer Options > USB Debugging
```

### APK Tidak Bisa Di-pull

```bash
# Coba dengan root access (jika device sudah di-root)
adb root
adb pull /data/app/com.petcare_app-xxxxx/base.apk
```

### Keytool Tidak Ditemukan

Keytool biasanya ada di:
- Windows: `C:\Program Files\Java\jdk-xx\bin\keytool.exe`
- Mac/Linux: `/usr/bin/keytool` atau di Java bin directory

Atau gunakan:
```bash
# Mac dengan Homebrew
brew install openjdk
/usr/local/opt/openjdk/bin/keytool ...

# Atau gunakan gradle signingReport yang lebih mudah
cd android && ./gradlew signingReport
```

## Rekomendasi

**Cara Termudah dan Paling Akurat:**

1. **Untuk Development**: Gunakan `./gradlew signingReport` - ini akan menampilkan semua SHA-1 yang digunakan
2. **Untuk Production**: Dapatkan dari Google Play Console setelah upload pertama kali
3. **Untuk Device Real yang Sudah Terinstall**: Gunakan ADB untuk pull APK dan extract SHA-1

## Catatan Penting

- SHA-1 dari device real **sama dengan** SHA-1 dari keystore yang digunakan untuk sign APK
- Jika APK di-sign dengan debug keystore, SHA-1 akan sama dengan debug keystore
- Jika APK di-sign dengan release keystore, SHA-1 akan sama dengan release keystore
- Untuk production di Play Store, gunakan **App Signing Key SHA-1** dari Google Play Console
