#!/usr/bin/env node

/**
 * Credit Management Script
 * 
 * اسکریپت مدیریت credit های کاربران
 * 
 * استفاده:
 * node scripts/manage-credits.js view USER_EMAIL
 * node scripts/manage-credits.js add USER_EMAIL 10
 * node scripts/manage-credits.js remove USER_EMAIL 5
 * node scripts/manage-credits.js list
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();
const auth = admin.auth();

// دریافت userId از email
async function getUserIdByEmail(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord.uid;
  } catch (error) {
    throw new Error(`User not found with email: ${email}`);
  }
}

// مشاهده credit های کاربر
async function viewUserCredits(email) {
  const userId = await getUserIdByEmail(email);
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    console.log('❌ User document not found in Firestore');
    return;
  }
  
  const userData = userDoc.data();
  const credits = userData.credits || { total: 0, used: 0, remaining: 0 };
  
  console.log('\n' + '='.repeat(60));
  console.log(`👤 User: ${email}`);
  console.log(`🆔 ID: ${userId}`);
  console.log('='.repeat(60));
  console.log(`💰 Total Credits: ${credits.total}`);
  console.log(`✅ Used Credits: ${credits.used}`);
  console.log(`🎯 Remaining Credits: ${credits.remaining}`);
  console.log('='.repeat(60) + '\n');
}

// اضافه کردن credit
async function addCredits(email, amount) {
  const userId = await getUserIdByEmail(email);
  const userRef = db.collection('users').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error('User document not found');
    }
    
    transaction.update(userRef, {
      'credits.total': admin.firestore.FieldValue.increment(amount),
      'credits.remaining': admin.firestore.FieldValue.increment(amount),
      'lastUpdated': admin.firestore.FieldValue.serverTimestamp()
    });
    
    // ثبت در creditPurchases
    transaction.set(db.collection('creditPurchases').doc(), {
      userId,
      credits: amount,
      source: 'admin_grant',
      metadata: {
        grantedBy: 'admin_script',
        grantedAt: new Date().toISOString()
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  console.log(`\n✅ Added ${amount} credits to ${email}\n`);
  await viewUserCredits(email);
}

// کم کردن credit
async function removeCredits(email, amount) {
  const userId = await getUserIdByEmail(email);
  const userRef = db.collection('users').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error('User document not found');
    }
    
    const credits = userDoc.data().credits || { total: 0, used: 0, remaining: 0 };
    
    if (credits.remaining < amount) {
      throw new Error(`Insufficient credits. User has ${credits.remaining} but trying to remove ${amount}`);
    }
    
    transaction.update(userRef, {
      'credits.remaining': admin.firestore.FieldValue.increment(-amount),
      'lastUpdated': admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  console.log(`\n✅ Removed ${amount} credits from ${email}\n`);
  await viewUserCredits(email);
}

// لیست تمام کاربران و credit هایشان
async function listAllUsers() {
  const usersSnapshot = await db.collection('users').get();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 All Users Credits');
  console.log('='.repeat(80));
  
  const users = [];
  
  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    const credits = userData.credits || { total: 0, used: 0, remaining: 0 };
    
    try {
      const userRecord = await auth.getUser(doc.id);
      users.push({
        email: userRecord.email,
        id: doc.id,
        credits
      });
    } catch (error) {
      users.push({
        email: 'Unknown',
        id: doc.id,
        credits
      });
    }
  }
  
  // مرتب سازی بر اساس remaining credits
  users.sort((a, b) => b.credits.remaining - a.credits.remaining);
  
  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Total: ${user.credits.total} | Used: ${user.credits.used} | Remaining: ${user.credits.remaining}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`Total Users: ${users.length}`);
  console.log('='.repeat(80) + '\n');
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
Usage:
  node scripts/manage-credits.js view USER_EMAIL
  node scripts/manage-credits.js add USER_EMAIL AMOUNT
  node scripts/manage-credits.js remove USER_EMAIL AMOUNT
  node scripts/manage-credits.js list

Examples:
  node scripts/manage-credits.js view user@example.com
  node scripts/manage-credits.js add user@example.com 10
  node scripts/manage-credits.js remove user@example.com 5
  node scripts/manage-credits.js list
    `);
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'view':
        if (!args[1]) throw new Error('Email required');
        await viewUserCredits(args[1]);
        break;
        
      case 'add':
        if (!args[1] || !args[2]) throw new Error('Email and amount required');
        await addCredits(args[1], parseInt(args[2]));
        break;
        
      case 'remove':
        if (!args[1] || !args[2]) throw new Error('Email and amount required');
        await removeCredits(args[1], parseInt(args[2]));
        break;
        
      case 'list':
        await listAllUsers();
        break;
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
  }
}

main();
