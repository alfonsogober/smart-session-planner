# Troubleshooting iOS Simulator Issues

## Issue: Simulator timeout when opening Expo

If you see errors like:
```
Error: xcrun simctl openurl ... exited with non-zero code: 60
Operation timed out
```

## Solutions

### Option 1: Use Expo's built-in iOS launcher (Recommended)
```bash
cd mobile
npx expo start --ios
```
This will automatically boot the simulator and open Expo Go.

### Option 2: Manually boot simulator first
```bash
# Boot the simulator
open -a Simulator

# Wait for it to fully load, then start Expo
cd mobile
npx expo start

# Then press 'i' to open iOS simulator
```

### Option 3: Use tunnel mode (if network issues)
```bash
cd mobile
npx expo start --tunnel
```
Then manually open Expo Go app on simulator and enter the URL.

### Option 4: Use localhost instead of network IP
If your network IP (192.168.1.9) is causing issues, try:
```bash
cd mobile
EXPO_PUBLIC_API_URL=http://localhost:3000 npx expo start --localhost
```

### Option 5: Reset simulator
```bash
# Shut down simulator
xcrun simctl shutdown all

# Boot fresh
xcrun simctl boot "iPhone 16 Pro"
open -a Simulator

# Then start Expo
cd mobile
npx expo start
```

## Common Issues

1. **Simulator not fully booted**: Wait 30-60 seconds after opening Simulator before starting Expo
2. **Network connectivity**: Use `--tunnel` or `--localhost` flags
3. **Expo Go not installed**: Install from App Store on simulator
4. **Port conflicts**: Kill other processes using port 8081: `lsof -ti:8081 | xargs kill`

## Verify Setup

Check if simulator is ready:
```bash
xcrun simctl list devices | grep "iPhone 16 Pro"
```

Should show "(Booted)" not "(Shutdown)".

