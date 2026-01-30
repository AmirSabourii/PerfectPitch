#!/usr/bin/env node

/**
 * Migration Script: Plan-based to Credit-based System
 * 
 * این اسکریپت تمام کاربران را از سیستم قدیمی plan-based به سیستم جدید credit-based منتقل می‌کند
 * 
 * استفاده:
 * node scripts/migrate-to-credits.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

async function migrateToCredits() {
  console.log('🚀 Starting migration from plan-based to credit-based system...\n');
  
  try {
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Found ${usersSnapshot.size} users to migrate\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const doc of usersSnapshot.docs) {
      try {
        const userData = doc.data();
        const userId = doc.id;
        
        console.log(`Processing user: ${userId}`);
        console.log(`  Old data:`, {
          plan: userData.plan,
          usage: userData.usage
        });
        
        // تعیین credit اولیه بر اساس plan قبلی (اختیاری)
        let initialCredits = 0;
        if (userData.plan === 'pro') {
          initialCredits = 5; // به کاربران Pro یک هدیه 5 credit می‌دهیم
        }
        
        // آپدیت کاربر با ساختار جدید
        await db.collection('users').doc(userId).update({
          credits: {
            total: initialCredits,
            used: 0,
            remaining: initialCredits
          },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          // حذف فیلدهای قدیمی
          plan: admin.firestore.FieldValue.delete(),
          usage: admin.firestore.FieldValue.delete()
        });
        
        // اگر credit اولیه داده شد، در creditPurchases ثبت کن
        if (initialCredits > 0) {
          await db.collection('creditPurchases').add({
            userId,
            credits: initialCredits,
            source: 'migration_bonus',
            metadata: {
              oldPlan: userData.plan,
              migrationDate: new Date().toISOString()
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        console.log(`  ✅ Migrated successfully (${initialCredits} credits granted)\n`);
        successCount++;
        
      } catch (error) {
        console.error(`  ❌ Error migrating user ${doc.id}:`, error.message, '\n');
        errorCount++;
        errors.push({ userId: doc.id, error: error.message });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} users`);
    console.log(`❌ Failed: ${errorCount} users`);
    console.log(`📊 Total: ${usersSnapshot.size} users`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(({ userId, error }) => {
        console.log(`  - ${userId}: ${error}`);
      });
    }
    
    console.log('\n✨ Migration complete!');
    
  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    process.exit(1);
  }
}

// اجرای اسکریپت
migrateToCredits()
  .then(() => {
    console.log('\n👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
