#!/bin/bash

# Script untuk Build Release APK dengan SHA-1

echo "=== Build Release APK ==="

# Check if keystore.properties exists
if [ ! -f "android/keystore.properties" ]; then
    echo "⚠️  keystore.properties not found!"
    echo ""
    echo "Please create android/keystore.properties with:"
    echo "  MYAPP_RELEASE_STORE_FILE=my-release-key.keystore"
    echo "  MYAPP_RELEASE_KEY_ALIAS=my-key-alias"
    echo "  MYAPP_RELEASE_STORE_PASSWORD=your-password"
    echo "  MYAPP_RELEASE_KEY_PASSWORD=your-password"
    echo ""
    echo "Or copy from: android/keystore.properties.example"
    echo ""
    read -p "Do you want to use debug keystore for now? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Navigate to android directory
cd android

echo "Building release APK..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "APK location: android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    
    # Get SHA-1 from signing report
    echo "=== Getting SHA-1 from Release Keystore ==="
    ./gradlew signingReport | grep -A 5 "Variant: release" | grep SHA1
    
    echo ""
    echo "=== Next Steps ==="
    echo "1. Copy SHA-1 above"
    echo "2. Add to Firebase Console > Project Settings > Your apps > Android app > Add fingerprint"
    echo "3. Install APK to device and test Google Sign-In"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
