# راهنمای تنظیم ارسال ایمیل

سیستم از 3 روش مختلف برای ارسال ایمیل پشتیبانی می‌کند. شما می‌توانید هر کدام را که راحت‌تر است انتخاب کنید.

## روش 1: SendGrid (پیشنهادی - ساده و رایگان)

### مزایا:
- ✅ 100 ایمیل رایگان در روز
- ✅ راه‌اندازی آسان
- ✅ قابل اعتماد

### مراحل:

#### 1. ثبت‌نام در SendGrid
```
1. به https://sendgrid.com بروید
2. ثبت‌نام کنید (رایگان)
3. ایمیل خود را تایید کنید
```

#### 2. ساخت API Key
```
1. به Settings > API Keys بروید
2. روی "Create API Key" کلیک کنید
3. نام: "My App Email"
4. Permissions: "Full Access" یا "Mail Send"
5. API Key را کپی کنید (فقط یک بار نمایش داده می‌شود!)
```

#### 3. تنظیم Sender Identity
```
1. به Settings > Sender Authentication بروید
2. روی "Verify a Single Sender" کلیک کنید
3. ایمیل خود را وارد کنید (مثلاً: noreply@yourdomain.com)
4. ایمیل تایید را چک کنید
```

#### 4. نصب Package
```bash
npm install @sendgrid/mail
```

#### 5. تنظیم Environment Variables
در فایل `.env.local`:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ تمام! حالا ایمیل‌ها ارسال می‌شوند.

---

## روش 2: Resend (جدید و مدرن)

### مزایا:
- ✅ 100 ایمیل رایگان در روز
- ✅ API ساده
- ✅ مخصوص developers

### مراحل:

#### 1. ثبت‌نام در Resend
```
1. به https://resend.com بروید
2. ثبت‌نام کنید
3. Domain خود را تایید کنید (یا از domain تستی استفاده کنید)
```

#### 2. ساخت API Key
```
1. به API Keys بروید
2. روی "Create API Key" کلیک کنید
3. API Key را کپی کنید
```

#### 3. تنظیم Environment Variables
در فایل `.env.local`:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ تمام!

---

## روش 3: SMTP (Gmail, Outlook, یا هر SMTP دیگر)

### مزایا:
- ✅ استفاده از ایمیل موجود
- ✅ بدون نیاز به سرویس جدید

### مراحل برای Gmail:

#### 1. فعال کردن 2-Step Verification
```
1. به Google Account Settings بروید
2. Security > 2-Step Verification را فعال کنید
```

#### 2. ساخت App Password
```
1. به Security > App passwords بروید
2. Select app: "Mail"
3. Select device: "Other" (نام: "My App")
4. Password 16 رقمی را کپی کنید
```

#### 3. نصب Package
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

#### 4. تنظیم Environment Variables
در فایل `.env.local`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
EMAIL_FROM=your-email@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ تمام!

### برای Outlook/Hotmail:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

---

## تست ارسال ایمیل

### 1. در Development (بدون تنظیم):
```
وقتی هیچ کدام از environment variables تنظیم نشده باشند،
ایمیل ارسال نمی‌شود اما لینک دعوت در console نمایش داده می‌شود:

📧 Email would be sent: { to: 'user@example.com', ... }
🔗 Invitation link: http://localhost:3000/invite/abc123...
```

### 2. تست واقعی:
```
1. یک دعوت‌نامه ارسال کنید
2. ایمیل را چک کنید
3. روی لینک کلیک کنید
4. دعوت را قبول کنید
```

---

## مقایسه سرویس‌ها

| ویژگی | SendGrid | Resend | SMTP (Gmail) |
|-------|----------|--------|--------------|
| رایگان | 100/روز | 100/روز | محدود |
| راه‌اندازی | آسان | آسان | متوسط |
| قابلیت اطمینان | عالی | عالی | خوب |
| سرعت | سریع | سریع | متوسط |
| Analytics | ✅ | ✅ | ❌ |
| پیشنهاد برای | Production | Production | Development |

---

## نکات مهم

### 1. Domain Verification
برای production، حتماً domain خود را verify کنید:
- در SendGrid: Settings > Sender Authentication > Domain Authentication
- در Resend: Domains > Add Domain

### 2. SPF و DKIM
این رکوردهای DNS را اضافه کنید تا ایمیل‌ها به spam نروند:
```
سرویس‌های ایمیل به صورت خودکار این رکوردها را به شما می‌دهند
```

### 3. Rate Limiting
```
- SendGrid Free: 100 ایمیل/روز
- Resend Free: 100 ایمیل/روز
- Gmail: ~500 ایمیل/روز (محدودیت غیررسمی)
```

### 4. Template Customization
می‌توانید template ایمیل را در `lib/services/emailService.ts` تغییر دهید:
```typescript
private getInvitationEmailTemplate(...) {
  // HTML template خود را اینجا بنویسید
}
```

---

## Troubleshooting

### مشکل: ایمیل ارسال نمی‌شود
```
✅ بررسی کنید:
1. Environment variables درست تنظیم شده‌اند؟
2. API Key معتبر است؟
3. Sender email verify شده؟
4. Console را برای error چک کنید
```

### مشکل: ایمیل به spam می‌رود
```
✅ راه حل:
1. Domain را verify کنید
2. SPF و DKIM تنظیم کنید
3. از ایمیل معتبر استفاده کنید (نه @gmail.com)
4. محتوای ایمیل را بهبود دهید
```

### مشکل: Gmail App Password کار نمی‌کند
```
✅ بررسی کنید:
1. 2-Step Verification فعال است؟
2. App Password را درست کپی کردید؟ (بدون فاصله)
3. "Less secure app access" غیرفعال است؟ (باید App Password استفاده کنید)
```

---

## مثال کامل `.env.local`

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Platform Admin
PLATFORM_ADMIN_SETUP_KEY=your-secure-random-key-min-32-chars

# Email (یکی از این‌ها را انتخاب کنید)

# Option 1: SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Option 2: Resend
# RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# EMAIL_FROM=noreply@yourdomain.com

# Option 3: SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# EMAIL_FROM=your-email@gmail.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## چک‌لیست Setup

- [ ] یکی از سرویس‌های ایمیل را انتخاب کردم
- [ ] ثبت‌نام کردم و API Key گرفتم
- [ ] Sender email را verify کردم
- [ ] Package مورد نیاز را نصب کردم
- [ ] Environment variables را تنظیم کردم
- [ ] یک دعوت تستی فرستادم
- [ ] ایمیل را دریافت کردم
- [ ] لینک دعوت کار می‌کند

---

## پشتیبانی

اگر مشکلی داشتید:
1. Console را برای error چک کنید
2. Environment variables را دوباره بررسی کنید
3. Documentation سرویس ایمیل را بخوانید:
   - SendGrid: https://docs.sendgrid.com
   - Resend: https://resend.com/docs
   - Nodemailer: https://nodemailer.com/about/
