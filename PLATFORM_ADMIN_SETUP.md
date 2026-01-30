# راهنمای Setup Platform Admin

## سلسله مراتب دسترسی

```
Platform Admin (سوپر ادمین)
    ↓
Organization Admin (ادمین سازمان)
    ↓
Participant (شرکت‌کننده)
```

## مرحله 1: Setup اولین Platform Admin (فقط یک بار)

### گام 1: لاگین کنید
1. به سیستم وارد شوید یا ثبت‌نام کنید
2. User ID خود را یادداشت کنید (از Firebase Console یا از صفحه profile)

### گام 2: به صفحه Setup بروید
```
آدرس: /platform-admin/setup
```

### گام 3: Setup Key را وارد کنید
```
Default Key (برای development): demo-setup-key-123
```

**نکته امنیتی**: در production، این key را در `.env.local` تنظیم کنید:
```bash
PLATFORM_ADMIN_SETUP_KEY=your-secure-random-key-here
```

### گام 4: روی "Become Platform Admin" کلیک کنید

✅ حالا شما Platform Admin هستید!

## مرحله 2: ساخت اولین سازمان

### روش 1: Quick Setup (پیشنهادی برای تست)
```
1. به /admin بروید
2. روی "🚀 Quick Setup (Demo)" کلیک کنید
3. یک سازمان demo با برنامه نمونه ایجاد می‌شود
```

### روش 2: Custom Organization
```
1. به /admin بروید
2. روی "Create Custom Organization" کلیک کنید
3. اطلاعات سازمان را وارد کنید
4. روی "Create Organization" کلیک کنید
```

## مرحله 3: تعیین Organization Admin

وقتی یک سازمان می‌سازید، خودتان به عنوان admin اولیه تنظیم می‌شوید.

### اضافه کردن Organization Admin جدید:

#### روش 1: از طریق API
```typescript
POST /api/organizations/{orgId}/admins

Body:
{
  "userId": "user-id-to-add"
}
```

#### روش 2: مستقیم در Firestore
```
1. به Firebase Console بروید
2. Collection: organizations
3. Document: {orgId}
4. Field: adminIds
5. آرایه adminIds را ویرایش کنید و userId جدید را اضافه کنید
```

## مرحله 4: Organization Admin چه کارهایی می‌تواند انجام دهد؟

Organization Admin می‌تواند:
- ✅ برنامه‌های جدید ایجاد کند
- ✅ شرکت‌کنندگان را دعوت کند
- ✅ آمار و تحلیل‌ها را ببیند
- ✅ پیچ‌ها را فیلتر کند
- ❌ سازمان‌های دیگر را نبیند
- ❌ Platform Admin نباشد

## مرحله 5: دعوت Participant

Organization Admin می‌تواند شرکت‌کنندگان را دعوت کند:

```
1. به صفحه سازمان بروید
2. تب "Invitations" را انتخاب کنید
3. روی "Send Invitation" کلیک کنید
4. ایمیل شرکت‌کننده را وارد کنید
5. (اختیاری) برنامه را انتخاب کنید
6. روی "Send Invitation" کلیک کنید
```

## ساختار Firestore

### Collection: system/platformAdmins
```json
{
  "adminIds": ["user-id-1", "user-id-2"],
  "createdAt": "2024-01-24T10:00:00Z"
}
```

### Collection: organizations
```json
{
  "id": "org-123",
  "name": "Tehran Innovation Center",
  "adminIds": ["user-id-1", "user-id-2"],
  ...
}
```

### Collection: organizationMemberships
```json
{
  "id": "membership-123",
  "userId": "participant-user-id",
  "organizationId": "org-123",
  "role": "participant",
  "programIds": ["program-1"],
  ...
}
```

## بررسی دسترسی‌ها

### چک کردن Platform Admin:
```typescript
GET /api/platform-admin/check?userId={userId}

Response:
{
  "isPlatformAdmin": true
}
```

### چک کردن Organization Admin:
```typescript
// در organizationService
await organizationService.isUserAdmin(userId, orgId)
```

## سناریوهای مختلف

### سناریو 1: شما Platform Admin هستید
```
✅ می‌توانید سازمان بسازید
✅ می‌توانید Organization Admin تعیین کنید
✅ می‌توانید تمام سازمان‌ها را ببینید
```

### سناریو 2: شما Organization Admin هستید
```
✅ می‌توانید سازمان خود را مدیریت کنید
✅ می‌توانید برنامه بسازید
✅ می‌توانید شرکت‌کننده دعوت کنید
❌ نمی‌توانید سازمان جدید بسازید
❌ نمی‌توانید سازمان‌های دیگر را ببینید
```

### سناریو 3: شما Participant هستید
```
✅ می‌توانید پیچ ارسال کنید
✅ می‌توانید تاریخچه خود را ببینید
❌ نمی‌توانید شرکت‌کنندگان دیگر را ببینید
❌ نمی‌توانید برنامه بسازید
```

## امنیت

### محافظت از Setup Endpoint
```typescript
// در production:
// 1. Setup key را در environment variable قرار دهید
// 2. بعد از اولین setup، endpoint را غیرفعال کنید
// 3. یا middleware اضافه کنید که فقط یک بار اجازه setup بدهد
```

### Firebase Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Platform Admins document
    match /system/platformAdmins {
      allow read: if request.auth != null;
      allow write: if false; // فقط از طریق API
    }
    
    // Organizations
    match /organizations/{orgId} {
      allow read: if request.auth != null && 
                     (isOrgAdmin(orgId) || isPlatformAdmin());
      allow write: if isPlatformAdmin();
    }
    
    // Helper functions
    function isPlatformAdmin() {
      return request.auth.uid in get(/databases/$(database)/documents/system/platformAdmins).data.adminIds;
    }
    
    function isOrgAdmin(orgId) {
      return request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.adminIds;
    }
  }
}
```

## مشکلات رایج

### مشکل: "Invalid setup key"
**راه حل**: 
- از key صحیح استفاده کنید: `demo-setup-key-123`
- یا key را در `.env.local` تنظیم کنید

### مشکل: "Platform admin already exists"
**راه حل**: 
- Setup فقط یک بار کار می‌کند
- اگر نیاز به platform admin جدید دارید، از Firestore مستقیماً اضافه کنید

### مشکل: نمی‌توانم سازمان ببینم
**راه حل**: 
- مطمئن شوید که Platform Admin هستید
- یا در adminIds سازمان هستید

### مشکل: Organization Admin نمی‌تواند سازمان جدید بسازد
**راه حل**: 
- این طبیعی است! فقط Platform Admin می‌تواند سازمان بسازد
- Organization Admin فقط سازمان خود را مدیریت می‌کند

## چک‌لیست Setup

- [ ] لاگین کردم
- [ ] به `/platform-admin/setup` رفتم
- [ ] Setup key را وارد کردم
- [ ] Platform Admin شدم
- [ ] به `/admin` رفتم
- [ ] سازمان اول را ساختم (Quick Setup یا Custom)
- [ ] برنامه اول را ساختم
- [ ] اولین دعوت‌نامه را فرستادم
- [ ] شرکت‌کننده دعوت را قبول کرد
- [ ] شرکت‌کننده پیچ ارسال کرد
- [ ] آمار را در پنل ادمین دیدم

## مراحل بعدی

1. **اضافه کردن Organization Admin جدید**
   - از API یا Firestore مستقیماً

2. **تنظیم Firebase Security Rules**
   - برای امنیت بیشتر

3. **غیرفعال کردن Setup Endpoint**
   - بعد از اولین setup

4. **تنظیم Email Service**
   - برای ارسال دعوت‌نامه‌ها

5. **اضافه کردن Billing**
   - برای محدودیت اشتراک
