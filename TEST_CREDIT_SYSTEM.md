# Testing Credit System

## Pre-Deployment Testing

### 1. Check TypeScript Compilation
```bash
npm run build
```
Expected: No errors

### 2. Run Tests (if any)
```bash
npm test
```

## Post-Deployment Testing

### Test 1: New User (No Credits)

1. Create a new user account or use existing user with 0 credits
2. Try to analyze a pitch
3. Expected result:
   ```json
   {
     "error": "Insufficient credits. You need 1 credit(s) but have 0.",
     "code": "INSUFFICIENT_CREDITS",
     "required": 1,
     "available": 0
   }
   ```

### Test 2: Add Credits and Analyze

1. Add credits to user:
   ```bash
   node scripts/manage-credits.js add test@example.com 5
   ```

2. Check credits:
   ```bash
   node scripts/manage-credits.js view test@example.com
   ```
   Expected: `Remaining Credits: 5`

3. Analyze a pitch
4. Expected: Success

5. Check credits again:
   ```bash
   node scripts/manage-credits.js view test@example.com
   ```
   Expected: `Remaining Credits: 4` (1 credit deducted)

### Test 3: Realtime Session

1. Start a realtime session
2. Expected: Success (if user has credits)

3. Check credits:
   ```bash
   node scripts/manage-credits.js view test@example.com
   ```
   Expected: 1 credit deducted

### Test 4: Multiple Operations

1. User with 3 credits
2. Do 3 pitch analyses
3. Try 4th analysis
4. Expected: "Insufficient credits" error

### Test 5: Credit Tracking

1. Check creditUsage collection in Firebase Console
2. Expected: All operations logged with:
   - userId
   - action
   - credits
   - metadata
   - timestamp

2. Check creditPurchases collection
3. Expected: All credit additions logged

## Monitoring

### Check Server Logs

Look for these log messages:

✅ Success:
```
[analyze-pitch] Checking user credits
[Credits] Used 1 credit(s) for pitch_analysis by user abc123
```

❌ Insufficient credits:
```
[analyze-pitch] Checking user credits
Insufficient credits. You need 1 credit(s) but have 0.
```

### Check Firebase Console

1. Go to Firestore
2. Check `users` collection
3. Verify structure:
   ```javascript
   {
     "credits": {
       "total": 10,
       "used": 3,
       "remaining": 7
     }
   }
   ```

4. Check `creditUsage` collection
5. Check `creditPurchases` collection

## Common Issues

### Issue: Still getting "Monthly analysis limit reached"

**Solution:**
1. Clear browser cache
2. Check that new code is deployed
3. Verify Firebase has new structure
4. Check server logs

### Issue: Credits not deducting

**Solution:**
1. Check server logs for errors
2. Verify `useCredits()` is being called
3. Check Firebase permissions
4. Verify Admin SDK is initialized

### Issue: User has negative credits

**Solution:**
```bash
node scripts/manage-credits.js view user@example.com
# Check the values
node scripts/manage-credits.js add user@example.com 10
# Add credits to fix
```

## Performance Testing

### Test concurrent requests:

```bash
# Install artillery if needed
npm install -g artillery

# Create test file: artillery-test.yml
config:
  target: 'https://your-app.netlify.app'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Analyze Pitch"
    flow:
      - post:
          url: "/api/analyze-pitch"
          headers:
            Authorization: "Bearer YOUR_TOKEN"
          json:
            pitch: "Test pitch"

# Run test
artillery run artillery-test.yml
```

## Security Testing

### Test 1: Unauthorized Access
```bash
curl -X POST https://your-app.netlify.app/api/analyze-pitch \
  -H "Content-Type: application/json" \
  -d '{"pitch": "test"}'
```
Expected: 401 Unauthorized

### Test 2: Invalid Token
```bash
curl -X POST https://your-app.netlify.app/api/analyze-pitch \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"pitch": "test"}'
```
Expected: 401 Unauthorized

### Test 3: Direct Firestore Access
Try to update credits directly from client
Expected: Permission denied (if rules are correct)

## Load Testing

### Simulate 100 users:

```javascript
// test-load.js
const axios = require('axios');

async function testUser(userId, token) {
  try {
    const response = await axios.post(
      'https://your-app.netlify.app/api/analyze-pitch',
      { pitch: 'Test pitch' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`User ${userId}: Success`);
  } catch (error) {
    console.log(`User ${userId}: ${error.response?.data?.error}`);
  }
}

// Run for multiple users
async function runLoadTest() {
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(testUser(i, 'token_' + i));
  }
  await Promise.all(promises);
}

runLoadTest();
```

## Rollback Plan

If something goes wrong:

### Option 1: Restore from backup
```bash
gcloud firestore import gs://your-bucket/backup
```

### Option 2: Manual fix
```bash
# Add credits to affected users
node scripts/manage-credits.js add user@example.com 10
```

### Option 3: Revert code
```bash
git revert HEAD
npm run build
netlify deploy --prod
```

## Success Criteria

✅ All tests pass
✅ No errors in server logs
✅ Credits deduct correctly
✅ Users can purchase credits
✅ Firebase structure is correct
✅ No "Monthly limit" errors
✅ Performance is acceptable
✅ Security tests pass

## Final Checklist

- [ ] TypeScript compiles without errors
- [ ] All API routes work
- [ ] Credits deduct correctly
- [ ] Credit tracking works
- [ ] Firebase structure is correct
- [ ] Security rules are in place
- [ ] Monitoring is set up
- [ ] Backup is available
- [ ] Documentation is complete
- [ ] Team is informed

## 🎉 If all tests pass, you're good to go!
