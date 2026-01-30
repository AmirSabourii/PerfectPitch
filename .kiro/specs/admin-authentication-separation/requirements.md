# Admin Authentication Separation - Requirements

## Overview
جداسازی سیستم احراز هویت ادمین از یوزرهای عادی و امکان دسترسی مستقیم به پنل‌های ادمین برای کاربران مجاز.

## Problem Statement
در حال حاضر:
- هر URL ادمین (`/admin/*` و `/platform-admin/*`) کاربر را به `/login` عادی ریدایرکت می‌کند
- سیستم احراز هویت ادمین و یوزر عادی از هم جدا نیستند
- امکان ورود مستقیم به پنل ادمین وجود ندارد
- چک کردن دسترسی ادمین فقط بعد از لاگین انجام می‌شود

## User Stories

### 1. Admin Direct Access
**As an** organization admin  
**I want to** access admin panel directly via URL  
**So that** I don't need to go through regular user login flow

**Acceptance Criteria:**
- 1.1: وقتی ادمین به `/admin` می‌رود، اگر لاگین نیست به `/admin/login` برود (نه `/login`)
- 1.2: صفحه `/admin/login` فقط برای ادمین‌ها باشد و UI متفاوتی داشته باشد
- 1.3: بعد از لاگین موفق، ادمین به همان URL اولیه برگردد
- 1.4: اگر یوزر لاگین کرده ولی ادمین نیست، پیام خطای مناسب نشان داده شود

### 2. Platform Admin Direct Access
**As a** platform admin  
**I want to** access platform admin panel directly  
**So that** I can manage the entire platform

**Acceptance Criteria:**
- 2.1: وقتی platform admin به `/platform-admin` می‌رود، اگر لاگین نیست به `/platform-admin/login` برود
- 2.2: صفحه `/platform-admin/login` فقط برای platform admin باشد
- 2.3: بعد از لاگین، چک شود که آیا ایمیل کاربر در لیست platform admin هست یا نه
- 2.4: اگر کاربر platform admin نیست، دسترسی رد شود

### 3. Email-Based Admin Verification
**As a** system  
**I want to** verify admin access based on email  
**So that** only authorized users can access admin panels

**Acceptance Criteria:**
- 3.1: لیست ایمیل‌های مجاز برای organization admin در Firestore ذخیره شود
- 3.2: لیست ایمیل‌های مجاز برای platform admin در environment variable یا Firestore ذخیره شود
- 3.3: بعد از لاگین، ایمیل کاربر با لیست مجاز چک شود
- 3.4: اگر ایمیل مجاز نباشد، دسترسی رد شود با پیام واضح

### 4. Separate Auth Contexts
**As a** developer  
**I want to** have separate authentication contexts for admin and regular users  
**So that** they don't interfere with each other

**Acceptance Criteria:**
- 4.1: یک `AdminAuthContext` جداگانه ساخته شود
- 4.2: `AdminAuthContext` شامل چک کردن نقش ادمین باشد
- 4.3: Layout های ادمین از `AdminAuthContext` استفاده کنند
- 4.4: یوزرهای عادی و ادمین‌ها می‌توانند همزمان لاگین باشند (در صورت نیاز)

### 5. Protected Admin Routes
**As a** system  
**I want to** protect all admin routes with proper authentication  
**So that** unauthorized users cannot access admin features

**Acceptance Criteria:**
- 5.1: تمام route های `/admin/*` محافظت شوند
- 5.2: تمام route های `/platform-admin/*` محافظت شوند
- 5.3: API endpoint های ادمین نیز محافظت شوند
- 5.4: در صورت عدم دسترسی، پیام خطای مناسب نمایش داده شود

## Technical Requirements

### Authentication Flow
1. کاربر به URL ادمین می‌رود
2. سیستم چک می‌کند آیا لاگین است
3. اگر نه، به صفحه لاگین ادمین ریدایرکت می‌شود
4. بعد از لاگین، ایمیل با لیست مجاز چک می‌شود
5. اگر مجاز باشد، به پنل ادمین دسترسی پیدا می‌کند
6. اگر مجاز نباشد، پیام خطا نمایش داده می‌شود

### Data Structure

#### Organization Admins (Firestore)
```typescript
// Collection: organizationMemberships
{
  userId: string
  organizationId: string
  role: 'admin' | 'member'
  email: string
  status: 'active' | 'inactive'
}
```

#### Platform Admins (Firestore)
```typescript
// Collection: platformAdmins
{
  email: string
  userId: string
  createdAt: timestamp
  status: 'active' | 'inactive'
}
```

## Out of Scope
- Multi-factor authentication
- Role-based permissions (فقط admin/non-admin)
- Session management پیشرفته
- Admin activity logging

## Success Metrics
- ادمین‌ها می‌توانند مستقیماً از URL به پنل دسترسی پیدا کنند
- یوزرهای غیرمجاز نمی‌توانند به پنل ادمین دسترسی پیدا کنند
- تجربه کاربری ادمین و یوزر عادی از هم جدا است
- امنیت دسترسی به پنل ادمین تضمین شده است
