# تحلیل امنیت و استانداردهای پنل ادمین

## ✅ نقاط قوت امنیتی

### 1. سلسله مراتب دسترسی واضح
```
✅ Platform Admin → Organization Admin → Participant
✅ جداسازی واضح نقش‌ها
✅ هر سطح فقط به داده‌های مربوط به خود دسترسی دارد
```

### 2. Firebase Authentication
```
✅ استفاده از Firebase Auth برای احراز هویت
✅ User ID های منحصر به فرد
✅ Session management توسط Firebase
```

### 3. Data Isolation
```
✅ هر سازمان داده‌های جدا دارد
✅ Organization ID برای فیلتر کردن queries
✅ Membership-based access control
```

### 4. API Validation
```
✅ بررسی userId در تمام endpoints
✅ بررسی organizationId قبل از دسترسی
✅ Error handling مناسب
```

## ⚠️ نقاط ضعف و نیازهای بهبود

### 1. **Authentication در API Routes** (بحرانی)
```javascript
❌ مشکل فعلی:
// API routes فقط userId را از query parameter می‌گیرند
const userId = searchParams.get('userId');

⚠️ خطر: هر کسی می‌تواند userId دیگری را جعل کند!

✅ راه حل:
// باید از Firebase Admin SDK استفاده کنیم
import { auth } from 'firebase-admin';

export async function GET(request: NextRequest) {
  // دریافت token از header
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // تایید token
    const decodedToken = await auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // حالا می‌توانیم به userId اعتماد کنیم
    // ...
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

### 2. **Firebase Security Rules** (بحرانی)
```javascript
❌ مشکل فعلی:
// Security rules تنظیم نشده‌اند

✅ راه حل:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Platform Admins
    match /system/platformAdmins {
      allow read: if request.auth != null;
      allow write: if false; // فقط از طریق Admin SDK
    }
    
    // Organizations
    match /organizations/{orgId} {
      allow read: if request.auth != null && 
                     (isOrgAdmin(orgId) || isPlatformAdmin());
      allow create: if isPlatformAdmin();
      allow update: if isOrgAdmin(orgId) || isPlatformAdmin();
      allow delete: if isPlatformAdmin();
    }
    
    // Programs
    match /programs/{programId} {
      allow read: if request.auth != null && 
                     isOrgMember(getOrgId(programId));
      allow write: if isOrgAdmin(getOrgId(programId));
    }
    
    // Invitations
    match /invitations/{invitationId} {
      allow read: if request.auth != null && 
                     (isOrgAdmin(resource.data.organizationId) || 
                      request.auth.token.email == resource.data.email);
      allow create: if isOrgAdmin(request.resource.data.organizationId);
      allow update, delete: if isOrgAdmin(resource.data.organizationId);
    }
    
    // Organization Memberships
    match /organizationMemberships/{membershipId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.userId || 
                      isOrgAdmin(resource.data.organizationId));
      allow write: if isOrgAdmin(resource.data.organizationId);
    }
    
    // Pitch Submissions
    match /pitchSubmissions/{pitchId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.userId || 
                      (resource.data.visibility == 'organization' && 
                       isOrgMember(resource.data.organizationId)));
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId || 
                       isOrgAdmin(resource.data.organizationId);
    }
    
    // Helper Functions
    function isPlatformAdmin() {
      return exists(/databases/$(database)/documents/system/platformAdmins) &&
             request.auth.uid in get(/databases/$(database)/documents/system/platformAdmins).data.adminIds;
    }
    
    function isOrgAdmin(orgId) {
      return exists(/databases/$(database)/documents/organizations/$(orgId)) &&
             request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.adminIds;
    }
    
    function isOrgMember(orgId) {
      return exists(/databases/$(database)/documents/organizationMemberships/$(request.auth.uid + '_' + orgId));
    }
    
    function getOrgId(programId) {
      return get(/databases/$(database)/documents/programs/$(programId)).data.organizationId;
    }
  }
}
```

### 3. **Setup Key Security** (متوسط)
```javascript
❌ مشکل فعلی:
// Setup key در کد هاردکد شده
const SETUP_KEY = 'demo-setup-key-123';

✅ راه حل:
// 1. در .env.local
PLATFORM_ADMIN_SETUP_KEY=your-very-secure-random-key-here-min-32-chars

// 2. در production، بعد از اولین setup:
// - Endpoint را غیرفعال کنید
// - یا middleware اضافه کنید که فقط یک بار اجازه بدهد
// - یا از Admin SDK برای اضافه کردن admins بعدی استفاده کنید
```

### 4. **Rate Limiting** (متوسط)
```javascript
❌ مشکل فعلی:
// هیچ rate limiting وجود ندارد

✅ راه حل:
// استفاده از middleware برای rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// یا استفاده از Firebase App Check
```

### 5. **Input Validation** (متوسط)
```javascript
❌ مشکل فعلی:
// Validation محدود است

✅ راه حل:
// استفاده از Zod برای validation
import { z } from 'zod';

const CreateOrganizationSchema = z.object({
  name: z.string().min(3).max(100),
  type: z.enum(['science_park', 'accelerator', 'bootcamp', 'innovation_center']),
  contactEmail: z.string().email(),
  contactName: z.string().min(2).max(100),
  subscriptionPlan: z.object({
    planId: z.string(),
    participantLimit: z.number().min(1).max(10000),
    pitchesPerMonth: z.number().min(1).max(100000),
    features: z.array(z.string()),
  }),
  adminIds: z.array(z.string()).min(1),
});

// در API:
const body = await request.json();
const validated = CreateOrganizationSchema.parse(body);
```

### 6. **CSRF Protection** (کم)
```javascript
❌ مشکل فعلی:
// هیچ CSRF protection وجود ندارد

✅ راه حل:
// Next.js به صورت پیش‌فرض از SameSite cookies استفاده می‌کند
// اما برای امنیت بیشتر:
// - استفاده از CSRF tokens
// - بررسی Origin header
```

### 7. **Audit Logging** (کم)
```javascript
❌ مشکل فعلی:
// هیچ audit log وجود ندارد

✅ راه حل:
// ثبت تمام عملیات حساس
interface AuditLog {
  id: string;
  userId: string;
  action: string; // 'create_org', 'add_admin', 'invite_user', etc.
  resourceType: string; // 'organization', 'program', etc.
  resourceId: string;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

// در هر API endpoint:
await auditLogService.log({
  userId,
  action: 'create_organization',
  resourceType: 'organization',
  resourceId: org.id,
  timestamp: Timestamp.now(),
});
```

## 📊 امتیاز امنیتی فعلی

### امنیت کلی: 5/10

| بخش | امتیاز | وضعیت |
|-----|--------|-------|
| Authentication | 3/10 | ⚠️ نیاز به بهبود فوری |
| Authorization | 6/10 | ⚠️ نیاز به Security Rules |
| Data Isolation | 8/10 | ✅ خوب |
| Input Validation | 5/10 | ⚠️ نیاز به بهبود |
| Rate Limiting | 0/10 | ❌ وجود ندارد |
| Audit Logging | 0/10 | ❌ وجود ندارد |
| CSRF Protection | 5/10 | ⚠️ پایه‌ای |

## 🔧 اقدامات فوری (قبل از Production)

### 1. اضافه کردن Firebase Admin SDK
```bash
npm install firebase-admin
```

### 2. ایجاد Middleware برای Authentication
```typescript
// lib/middleware/auth.ts
import { auth } from 'firebase-admin';

export async function verifyAuth(request: NextRequest) {
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  const decodedToken = await auth().verifyIdToken(token);
  return decodedToken;
}
```

### 3. تنظیم Firebase Security Rules
```
از کد بالا استفاده کنید
```

### 4. تنظیم Environment Variables
```bash
# .env.local
PLATFORM_ADMIN_SETUP_KEY=your-secure-key-min-32-chars
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
```

### 5. اضافه کردن Input Validation
```bash
npm install zod
```

## 📈 مقایسه با استانداردهای صنعت

### استانداردهای OWASP Top 10:

| خطر | وضعیت فعلی | نیاز به اقدام |
|-----|------------|---------------|
| Broken Access Control | ⚠️ متوسط | بله - Security Rules |
| Cryptographic Failures | ✅ خوب | خیر - Firebase مدیریت می‌کند |
| Injection | ✅ خوب | خیر - Firestore محافظت می‌کند |
| Insecure Design | ⚠️ متوسط | بله - بهبود Authentication |
| Security Misconfiguration | ⚠️ ضعیف | بله - Security Rules |
| Vulnerable Components | ✅ خوب | خیر - Dependencies به‌روز |
| Authentication Failures | ❌ ضعیف | بله - Token Verification |
| Software Integrity Failures | ✅ خوب | خیر |
| Logging Failures | ❌ ضعیف | بله - Audit Logging |
| SSRF | ✅ خوب | خیر |

## 🎯 نتیجه‌گیری

### ساختار کلی: ✅ خوب و استاندارد
- سلسله مراتب واضح
- جداسازی نقش‌ها
- Data isolation مناسب

### پیاده‌سازی فعلی: ⚠️ نیاز به بهبود
- Authentication ضعیف (بحرانی)
- Security Rules نداریم (بحرانی)
- Audit logging نداریم (متوسط)

### برای Development/Testing: ✅ قابل قبول
- برای تست و توسعه کافی است
- ساختار خوبی دارد

### برای Production: ❌ نیاز به بهبودهای امنیتی
- حتماً باید Authentication را اصلاح کنید
- حتماً باید Security Rules اضافه کنید
- توصیه می‌شود Audit Logging اضافه کنید

## 📝 چک‌لیست قبل از Production

- [ ] Firebase Admin SDK نصب شده
- [ ] Token verification در تمام API endpoints
- [ ] Firebase Security Rules تنظیم شده
- [ ] Environment variables امن
- [ ] Setup endpoint غیرفعال یا محدود شده
- [ ] Input validation با Zod
- [ ] Rate limiting اضافه شده
- [ ] Audit logging پیاده‌سازی شده
- [ ] Error messages امن (بدون افشای اطلاعات)
- [ ] HTTPS فعال
- [ ] CORS تنظیم شده
- [ ] Security headers اضافه شده
