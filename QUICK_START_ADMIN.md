# راهنمای سریع شروع کار با پنل ادمین

## مرحله 1: ورود به سیستم
1. وارد سیستم شوید (یا ثبت‌نام کنید)
2. به آدرس `/admin` بروید

## مرحله 2: ساخت اولین سازمان
وقتی برای اولین بار وارد `/admin` می‌شوید، هیچ سازمانی ندارید.

روی دکمه **"Create Your First Organization"** کلیک کنید.

### اطلاعات مورد نیاز:
```
نام سازمان: مثلاً "Tehran Innovation Center"
نوع: Accelerator (یا هر نوع دیگری)
نام تماس: نام شما
ایمیل تماس: ایمیل شما
محدودیت شرکت‌کنندگان: 50 (یا هر عدد دیگری)
محدودیت پیچ در ماه: 500 (یا هر عدد دیگری)
```

روی **"Create Organization"** کلیک کنید.

## مرحله 3: ساخت اولین برنامه (Program)
بعد از ساخت سازمان، به صفحه سازمان منتقل می‌شوید.

1. روی تب **"Programs"** کلیک کنید
2. روی **"Create Program"** کلیک کنید
3. اطلاعات برنامه را وارد کنید:
   ```
   نام: "Spring Bootcamp 2024"
   توضیحات: "3-month intensive startup bootcamp"
   تاریخ شروع: 2024-03-01
   تاریخ پایان: 2024-06-01
   ```
4. روی **"Create Program"** کلیک کنید

## مرحله 4: دعوت اولین شرکت‌کننده
1. روی تب **"Invitations"** کلیک کنید
2. روی **"Send Invitation"** کلیک کنید
3. ایمیل شرکت‌کننده را وارد کنید
4. (اختیاری) برنامه را انتخاب کنید
5. روی **"Send Invitation"** کلیک کنید

### نکته مهم:
در حال حاضر سیستم ایمیل فعال نیست، پس باید لینک دعوت را دستی به شرکت‌کننده بدهید:

لینک دعوت به این شکل است:
```
http://localhost:3000/invite/{TOKEN}
```

TOKEN را از جدول Invitations در Firestore کپی کنید.

## مرحله 5: قبول دعوت‌نامه (به عنوان شرکت‌کننده)
1. شرکت‌کننده روی لینک دعوت کلیک می‌کند
2. اگر لاگین نیست، وارد می‌شود
3. دعوت‌نامه به صورت خودکار قبول می‌شود
4. شرکت‌کننده به سازمان اضافه می‌شود

## مرحله 6: ارسال پیچ (به عنوان شرکت‌کننده)
شرکت‌کننده باید پیچ خود را با فیلدهای سازمانی ارسال کند:

```typescript
{
  // فیلدهای معمولی پیچ
  transcript: "...",
  audioUrl: "...",
  
  // فیلدهای سازمانی (جدید)
  organizationId: "org-id",
  programId: "program-id",
  visibility: "organization",
  domainCategories: ["FinTech", "AI/ML"],
  scores: {
    overall: 85,
    market: 80,
    team: 90,
    innovation: 85
  }
}
```

## مرحله 7: مشاهده آمار و تحلیل‌ها
1. به صفحه سازمان برگردید
2. تب‌های مختلف را بررسی کنید:
   - **Overview**: آمار کلی
   - **Programs**: لیست برنامه‌ها
   - **Participants**: لیست شرکت‌کنندگان
   - **Invitations**: وضعیت دعوت‌نامه‌ها
   - **Analytics**: تحلیل‌های جامع

## مرحله 8: فیلتر کردن پیچ‌ها
1. به `/admin/organizations/{orgId}/pitches` بروید
2. فیلترهای مختلف را امتحان کنید:
   - انتخاب برنامه
   - تعیین حداقل امتیاز
   - انتخاب دسته‌بندی‌ها
3. روی **"Apply Filters"** کلیک کنید

## نکات مهم:

### 1. Firestore Collections
بعد از ساخت سازمان، این collection‌ها در Firestore ایجاد می‌شوند:
- `organizations`
- `programs`
- `invitations`
- `organizationMemberships`

### 2. دسترسی به Firestore
مطمئن شوید که Firebase Rules به درستی تنظیم شده‌اند.

برای تست، می‌توانید موقتاً rules را باز کنید:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. دسته‌بندی‌های موجود
```
- FinTech
- HealthTech
- EdTech
- CleanTech
- E-commerce
- SaaS
- AI/ML
- IoT
- Blockchain
- Other
```

### 4. نوع امتیازها
```
- overall: امتیاز کلی
- market: امتیاز بازار
- team: امتیاز تیم
- innovation: امتیاز نوآوری
```

## مشکلات رایج:

### مشکل: "No Organizations" نشان می‌دهد
**راه حل**: روی "Create Your First Organization" کلیک کنید

### مشکل: نمی‌توانم سازمان ببینم
**راه حل**: مطمئن شوید که userId شما در adminIds سازمان است

### مشکل: دعوت‌نامه کار نمی‌کند
**راه حل**: 
1. TOKEN را از Firestore کپی کنید
2. لینک را دستی بسازید: `/invite/{TOKEN}`
3. مطمئن شوید که دعوت‌نامه expire نشده (30 روز)

### مشکل: پیچ‌ها نشان داده نمی‌شوند
**راه حل**: مطمئن شوید که:
1. پیچ‌ها با `organizationId` ذخیره شده‌اند
2. `visibility` روی `"organization"` است
3. `domainCategories` و `scores` وجود دارند

## تست سریع:

برای تست سریع، می‌توانید یک پیچ نمونه در Firestore ایجاد کنید:

```json
{
  "id": "test-pitch-1",
  "userId": "your-user-id",
  "transcript": "This is a test pitch for a FinTech startup...",
  "organizationId": "your-org-id",
  "programId": "your-program-id",
  "visibility": "organization",
  "domainCategories": ["FinTech", "AI/ML"],
  "scores": {
    "overall": 85,
    "market": 80,
    "team": 90,
    "innovation": 85
  },
  "createdAt": "2024-01-24T10:00:00Z"
}
```

حالا می‌توانید این پیچ را در پنل ادمین ببینید و فیلتر کنید!
