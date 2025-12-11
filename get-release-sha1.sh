#!/bin/bash

# Script untuk mendapatkan SHA-1 dari Release Keystore

echo "=== Getting SHA-1 from Release Keystore ==="
echo ""

# Check if keystore.properties exists
if [ -f "android/keystore.properties" ]; then
    echo "Loading keystore configuration from android/keystore.properties..."
    
    # Read properties
    source <(grep -v '^#' android/keystore.properties | grep -v '^$' | sed 's/^/export /')
    
    KEYSTORE_FILE="android/app/${MYAPP_RELEASE_STORE_FILE}"
    KEYSTORE_ALIAS="${MYAPP_RELEASE_KEY_ALIAS}"
    KEYSTORE_PASSWORD="${MYAPP_RELEASE_STORE_PASSWORD}"
    KEY_PASSWORD="${MYAPP_RELEASE_KEY_PASSWORD}"
    
    if [ -f "$KEYSTORE_FILE" ]; then
        echo "Keystore file: $KEYSTORE_FILE"
        echo "Alias: $KEYSTORE_ALIAS"
        echo ""
        echo "=== SHA-1 Certificate Fingerprint ==="
        keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$KEYSTORE_ALIAS" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" 2>/dev/null | grep -A 2 "SHA1:" | head -3
        
        echo ""
        echo "=== SHA-256 Certificate Fingerprint ==="
        keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$KEYSTORE_ALIAS" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" 2>/dev/null | grep -A 2 "SHA256:" | head -3
        
        echo ""
        echo "=== Next Steps ==="
        echo "1. Copy SHA-1 di atas (format: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX)"
        echo "2. Buka Firebase Console: https://console.firebase.google.com/"
        echo "3. Pilih project Anda > Project Settings > Your apps > Android app"
        echo "4. Klik 'Add fingerprint'"
        echo "5. Paste SHA-1 yang sudah di-copy"
        echo "6. Klik Save"
        echo "7. Tunggu 2-5 menit untuk propagasi"
        echo "8. Install ulang APK dan test Google Sign-In"
    else
        echo "❌ Error: Keystore file not found: $KEYSTORE_FILE"
        echo "Please check MYAPP_RELEASE_STORE_FILE in android/keystore.properties"
    fi
else
    echo "❌ Error: android/keystore.properties not found!"
    echo ""
    echo "Please create keystore.properties first:"
    echo "1. cd android"
    echo "2. cp keystore.properties.example keystore.properties"
    echo "3. Edit keystore.properties with your keystore info"
fi

echo ""
echo "=== Alternative: Get SHA-1 from APK ==="
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    echo "Getting SHA-1 from release APK..."
    keytool -printcert -jarfile android/app/build/outputs/apk/release/app-release.apk 2>/dev/null | grep -A 2 "SHA1:" | head -3
elif [ -f "android/app/build/outputs/apk/release/Petcare-v1.1.0.apk" ]; then
    echo "Getting SHA-1 from release APK..."
    keytool -printcert -jarfile android/app/build/outputs/apk/release/Petcare-v1.1.0.apk 2>/dev/null | grep -A 2 "SHA1:" | head -3
else
    echo "Release APK not found. Build release APK first:"
    echo "  cd android && ./gradlew assembleRelease"
fi
