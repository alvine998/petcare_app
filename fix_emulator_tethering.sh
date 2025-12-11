#!/bin/bash

echo "=== Fixing Android Emulator Internet Access (Tethering) ==="
echo ""

# Check if device is connected
if ! adb devices | grep -q "device$"; then
    echo "❌ No Android device/emulator connected!"
    echo "Please start your emulator or connect your device first."
    exit 1
fi

echo "1. Setting DNS to Google DNS (8.8.8.8)..."
adb shell "settings put global private_dns_mode off"
adb shell "settings put global private_dns_specifier 8.8.8.8"

echo ""
echo "2. Setting DNS servers..."
adb shell "setprop net.dns1 8.8.8.8"
adb shell "setprop net.dns2 8.8.4.4"

echo ""
echo "3. Testing internet connection..."
echo "Testing ping to 8.8.8.8..."
if adb shell ping -c 2 8.8.8.8 > /dev/null 2>&1; then
    echo "✅ Internet connection: OK"
else
    echo "❌ Internet connection: FAILED"
    echo ""
    echo "Try these solutions:"
    echo "  A. Use WiFi instead of tethering"
    echo "  B. Restart emulator and try again"
    echo "  C. Use physical device instead of emulator"
    exit 1
fi

echo ""
echo "4. Testing Firebase connectivity..."
echo "Testing ping to firebase.googleapis.com..."
if adb shell ping -c 2 firebase.googleapis.com > /dev/null 2>&1; then
    echo "✅ Firebase connectivity: OK"
else
    echo "⚠️  Firebase connectivity: May have issues"
    echo "   This is normal with tethering. Try using WiFi or physical device."
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "📱 Next steps:"
echo "  1. Restart your app"
echo "  2. Try registration again"
echo "  3. If still fails, use WiFi or physical device"
echo ""
