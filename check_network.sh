#!/bin/bash
echo "=== Checking Network Connectivity ==="
echo ""
echo "1. Testing internet connection from device/emulator..."
adb shell ping -c 3 8.8.8.8
echo ""
echo "2. Testing Firebase connectivity..."
adb shell ping -c 3 firebase.googleapis.com
echo ""
echo "3. Checking DNS resolution..."
adb shell getprop | grep net.dns
echo ""
echo "=== Network Check Complete ==="
