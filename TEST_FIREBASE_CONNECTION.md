# Test Firebase Connection

## Quick Test Commands

### Test 1: Check Environment Variables
```bash
# Run in terminal
echo "API Key: $NEXT_PUBLIC_FIREBASE_API_KEY"
echo "Project ID: $NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "Auth Domain: $NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
```

### Test 2: Restart Dev Server
```bash
# Stop server
Ctrl+C

# Clear cache
rm -rf .next

# Start again
npm run dev
```

### Test 3: Check Firebase in Browser Console
```javascript
// Open browser console (F12) and run:
import('firebase/app').then(firebase => {
  console.log('Firebase loaded:', firebase.getApps().length > 0)
})
```

## Common Issues

### Issue 1: "Client is offline"
**Cause**: Firebase can't connect to backend
**Fix**: 
1. Check internet connection
2. Restart dev server
3. Check firewall/VPN

### Issue 2: "Undefined values"
**Status**: ✅ FIXED
**Fix Applied**: Remove undefined from metadata

### Issue 3: History not working
**Cause**: Firebase offline = can't save to Firestore
**Fix**: Fix Firebase connection first

## Expected Behavior

### When Working:
```
✓ Firebase connected
✓ Credits balance loads
✓ Analysis saves to Firestore
✓ History shows past analyses
```

### When Broken:
```
✗ "Client is offline"
✗ Credits balance fails
✗ Analysis doesn't save
✗ History is empty
```

## Quick Fix Steps

1. **Stop dev server** (Ctrl+C)
2. **Clear cache**: `rm -rf .next`
3. **Start server**: `npm run dev`
4. **Test again**

If still broken:
5. **Check `.env.local`** file
6. **Verify Firebase Console** (project is active)
7. **Check network** (ping google.com)

---

**Status**: Waiting for dev server restart
