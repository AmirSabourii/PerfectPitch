# Organization Admin Panel - راهنمای استفاده

## نمای کلی

پنل ادمین سازمانی به پارک‌های علمی، شتابدهنده‌ها، بوت‌کمپ‌ها و مراکز نوآوری اجازه می‌دهد تا:
- شرکت‌کنندگان را با ایمیل دعوت کنند
- برنامه‌های مختلف (دوره‌ها، بوت‌کمپ‌ها) ایجاد کنند
- پیچ‌ها را بر اساس امتیاز و دسته‌بندی فیلتر کنند
- تحلیل‌های جامع از عملکرد شرکت‌کنندگان ببینند

## ساختار فایل‌ها

### Backend (Services & API)
```
lib/
├── organizationTypes.ts          # تایپ‌های TypeScript
├── services/
│   ├── organizationService.ts    # مدیریت سازمان‌ها
│   ├── programService.ts         # مدیریت برنامه‌ها
│   ├── invitationService.ts      # سیستم دعوت
│   └── analyticsService.ts       # تحلیل‌ها و آمار

app/api/
├── organizations/
│   ├── route.ts                  # ایجاد سازمان
│   └── [orgId]/
│       ├── route.ts              # دریافت/بروزرسانی سازمان
│       ├── programs/route.ts     # مدیریت برنامه‌ها
│       ├── invitations/route.ts  # مدیریت دعوت‌نامه‌ها
│       ├── participants/route.ts # لیست شرکت‌کنندگان
│       ├── analytics/route.ts    # آمار سازمان
│       └── pitches/route.ts      # فیلتر پیچ‌ها
└── invitations/
    └── accept/route.ts           # قبول دعوت‌نامه
```

### Frontend (UI Components)
```
app/
├── admin/
│   ├── page.tsx                           # صفحه اصلی پنل ادمین
│   ├── create-organization/page.tsx       # ساخت سازمان جدید
│   └── organizations/[orgId]/
│       ├── page.tsx                       # جزئیات سازمان
│       └── pitches/page.tsx               # فیلتر پیچ‌ها
└── invite/[token]/page.tsx                # قبول دعوت‌نامه

components/admin/
├── OrganizationOverview.tsx               # نمای کلی سازمان
├── ProgramsList.tsx                       # لیست برنامه‌ها
├── ParticipantsList.tsx                   # لیست شرکت‌کنندگان
├── InvitationManager.tsx                  # مدیریت دعوت‌نامه‌ها
├── AnalyticsDashboard.tsx                 # داشبورد تحلیلی
└── PitchesFilter.tsx                      # فیلتر پیچ‌ها
```

## راه‌اندازی

### 1. ساخت سازمان جدید
```
مسیر: /admin/create-organization

اطلاعات مورد نیاز:
- نام سازمان
- نوع سازمان (پارک علمی، شتابدهنده، بوت‌کمپ، مرکز نوآوری)
- نام و ایمیل تماس
- محدودیت تعداد شرکت‌کنندگان
- محدودیت تعداد پیچ در ماه
```

### 2. ایجاد برنامه (Program)
```
در صفحه سازمان، تب "Programs" را انتخاب کنید
روی "Create Program" کلیک کنید

اطلاعات مورد نیاز:
- نام برنامه (مثلاً "Bootcamp 2024 Spring")
- توضیحات
- تاریخ شروع و پایان
```

### 3. دعوت شرکت‌کنندگان
```
در تب "Invitations":
1. روی "Send Invitation" کلیک کنید
2. ایمیل شرکت‌کننده را وارد کنید
3. (اختیاری) برنامه مورد نظر را انتخاب کنید
4. دعوت‌نامه ارسال می‌شود

شرکت‌کننده:
- لینک دعوت را در ایمیل دریافت می‌کند
- روی لینک کلیک می‌کند
- وارد سیستم می‌شود (یا ثبت‌نام می‌کند)
- به سازمان اضافه می‌شود
```

## قابلیت‌های اصلی

### 1. Overview (نمای کلی)
- اطلاعات سازمان
- پلن اشتراک
- آمار سریع (تعداد شرکت‌کنندگان، پیچ‌ها، میانگین امتیاز)

### 2. Programs (برنامه‌ها)
- ایجاد برنامه‌های مختلف
- مشاهده وضعیت هر برنامه
- تعداد شرکت‌کنندگان هر برنامه

### 3. Participants (شرکت‌کنندگان)
- لیست تمام شرکت‌کنندگان
- تعداد پیچ‌های هر شرکت‌کننده
- آخرین فعالیت
- فیلتر بر اساس برنامه
- جستجو بر اساس نام یا ایمیل

### 4. Invitations (دعوت‌نامه‌ها)
- ارسال دعوت‌نامه جدید
- مشاهده وضعیت دعوت‌نامه‌ها (pending, accepted, expired)
- ارسال مجدد دعوت‌نامه

### 5. Analytics (تحلیل‌ها)
- تعداد کل شرکت‌کنندگان (فعال/غیرفعال)
- تعداد کل پیچ‌ها
- میانگین امتیاز
- نرخ مشارکت
- توزیع امتیازات
- توزیع دسته‌بندی‌ها (FinTech, HealthTech, ...)
- روند ارسال پیچ‌ها (30 روز اخیر)

### 6. Pitch Filtering (فیلتر پیچ‌ها)
```
فیلترهای موجود:
- برنامه (Program)
- نوع امتیاز (Overall, Market, Team, Innovation)
- حداقل امتیاز (Score Threshold)
- دسته‌بندی‌ها (Categories)

مثال:
"تمام پیچ‌های FinTech با امتیاز بالاتر از 70 در برنامه Bootcamp 2024"
```

## API Endpoints

### Organizations
```typescript
POST   /api/organizations                    // ایجاد سازمان
GET    /api/organizations/:orgId             // دریافت سازمان
PATCH  /api/organizations/:orgId             // بروزرسانی سازمان
```

### Programs
```typescript
GET    /api/organizations/:orgId/programs    // لیست برنامه‌ها
POST   /api/organizations/:orgId/programs    // ایجاد برنامه
```

### Invitations
```typescript
GET    /api/organizations/:orgId/invitations // لیست دعوت‌نامه‌ها
POST   /api/organizations/:orgId/invitations // ارسال دعوت‌نامه
POST   /api/invitations/accept               // قبول دعوت‌نامه
```

### Analytics
```typescript
GET    /api/organizations/:orgId/analytics   // آمار سازمان
GET    /api/organizations/:orgId/participants // لیست شرکت‌کنندگان با آمار
GET    /api/organizations/:orgId/pitches     // فیلتر پیچ‌ها
```

## Data Models

### Organization
```typescript
{
  id: string
  name: string
  type: 'science_park' | 'accelerator' | 'bootcamp' | 'innovation_center'
  status: 'active' | 'suspended' | 'expired'
  contactEmail: string
  contactName: string
  subscriptionPlan: {
    planId: string
    participantLimit: number
    pitchesPerMonth: number
    features: string[]
  }
  adminIds: string[]
}
```

### Program
```typescript
{
  id: string
  organizationId: string
  name: string
  description: string
  startDate: Timestamp
  endDate: Timestamp
  status: 'active' | 'completed' | 'archived'
  participantIds: string[]
}
```

### Invitation
```typescript
{
  id: string
  organizationId: string
  programId?: string
  email: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  invitedBy: string
  invitedAt: Timestamp
  expiresAt: Timestamp
  token: string
}
```

## Firestore Collections

```
/organizations/{orgId}
/programs/{programId}
/invitations/{invitationId}
/organizationMemberships/{membershipId}
/pitchSubmissions/{pitchId}  // با فیلدهای اضافه شده:
  - organizationId
  - programId
  - visibility: 'private' | 'organization'
  - domainCategories: string[]
  - scores: { overall, market, team, innovation }
```

## نکات مهم

1. **دعوت‌نامه‌ها**: مدت اعتبار 30 روز دارند
2. **فیلترها**: می‌توانید چند فیلتر را همزمان اعمال کنید
3. **برنامه‌ها**: هر شرکت‌کننده می‌تواند در چند برنامه باشد
4. **پیچ‌ها**: شرکت‌کنندگان می‌توانند پیچ‌های شخصی یا سازمانی ارسال کنند
5. **آمار**: به صورت real-time محاسبه می‌شود

## مراحل بعدی (اختیاری)

- [ ] سیستم ایمیل برای ارسال دعوت‌نامه‌ها
- [ ] خروجی CSV/PDF از داده‌ها
- [ ] نوتیفیکیشن برای ادمین‌ها
- [ ] مدیریت چند ادمین
- [ ] محدودیت اشتراک و billing
