#!/usr/bin/env node

/**
 * Test Credit System
 * 
 * Usage:
 *   node scripts/test-credits.js <userId> [action]
 * 
 * Examples:
 *   node scripts/test-credits.js abc123 check
 *   node scripts/test-credits.js abc123 add 10
 *   node scripts/test-credits.js abc123 view
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
if (!serviceAccountPath) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set');
  process.exit(1);
}

try {
  const serviceAccount = require(path.resolve(serviceAccountPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function viewCredits(userId) {
  console.log(`📊 Viewing credits for user: ${userId}\n`);
  
  const userRef = db.collection('userCredits').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    console.log('❌ User not found in userCredits collection');
    console.log('💡 Creating initial record with 0 credits...\n');
    
    await userRef.set({
      userId: userId,
      totalCredits: 0,
      usedCredits: 0,
      remainingCredits: 0,
      purchaseHistory: [],
      usageHistory: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ User record created');
    console.log('Total Credits: 0');
    console.log('Used Credits: 0');
    console.log('Remaining Credits: 0');
    return;
  }
  
  const data = userDoc.data();
  console.log('✅ User found');
  console.log(`Total Credits: ${data.totalCredits || 0}`);
  console.log(`Used Credits: ${data.usedCredits || 0}`);
  console.log(`Remaining Credits: ${data.remainingCredits || 0}`);
  console.log(`Last Updated: ${data.lastUpdated?.toDate() || 'N/A'}`);
}

async function addCredits(userId, amount) {
  console.log(`💰 Adding ${amount} credits to user: ${userId}\n`);
  
  const userRef = db.collection('userCredits').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    console.log('Creating new user record...');
    await userRef.set({
      userId: userId,
      totalCredits: amount,
      usedCredits: 0,
      remainingCredits: amount,
      purchaseHistory: [],
      usageHistory: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    console.log('Updating existing user record...');
    await userRef.update({
      totalCredits: admin.firestore.FieldValue.increment(amount),
      remainingCredits: admin.firestore.FieldValue.increment(amount),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  // Log purchase
  await db.collection('creditPurchases').add({
    userId: userId,
    credits: amount,
    source: 'admin_script',
    metadata: { addedBy: 'test-credits.js' },
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log(`✅ Successfully added ${amount} credits`);
  console.log('\nCurrent balance:');
  await viewCredits(userId);
}

async function checkCredit(userId) {
  console.log(`🔍 Checking credit system for user: ${userId}\n`);
  
  // Check userCredits collection
  const userRef = db.collection('userCredits').doc(userId);
  const userDoc = await userRef.get();
  
  console.log('📦 userCredits collection:');
  if (userDoc.exists) {
    const data = userDoc.data();
    console.log('  ✅ Found');
    console.log(`  Total: ${data.totalCredits || 0}`);
    console.log(`  Used: ${data.usedCredits || 0}`);
    console.log(`  Remaining: ${data.remainingCredits || 0}`);
  } else {
    console.log('  ❌ Not found');
  }
  
  console.log('\n📦 users collection (old system):');
  const oldUserRef = db.collection('users').doc(userId);
  const oldUserDoc = await oldUserRef.get();
  
  if (oldUserDoc.exists) {
    const data = oldUserDoc.data();
    if (data.credits) {
      console.log('  ⚠️  Found old credit structure');
      console.log(`  Total: ${data.credits.total || 0}`);
      console.log(`  Used: ${data.credits.used || 0}`);
      console.log(`  Remaining: ${data.credits.remaining || 0}`);
    } else {
      console.log('  ℹ️  User exists but no credits field');
    }
  } else {
    console.log('  ❌ Not found');
  }
  
  // Check recent usage
  console.log('\n📊 Recent credit usage:');
  const usageSnapshot = await db.collection('creditUsage')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(5)
    .get();
  
  if (usageSnapshot.empty) {
    console.log('  No usage history found');
  } else {
    usageSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.action}: ${data.credits} credits (${data.timestamp?.toDate() || 'N/A'})`);
    });
  }
  
  // Check recent purchases
  console.log('\n💳 Recent purchases:');
  const purchaseSnapshot = await db.collection('creditPurchases')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(5)
    .get();
  
  if (purchaseSnapshot.empty) {
    console.log('  No purchase history found');
  } else {
    purchaseSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.credits} credits from ${data.source} (${data.timestamp?.toDate() || 'N/A'})`);
    });
  }
}

// Main
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node scripts/test-credits.js <userId> [action] [amount]');
  console.log('\nActions:');
  console.log('  view          - View user credits (default)');
  console.log('  add <amount>  - Add credits to user');
  console.log('  check         - Check credit system status');
  console.log('\nExamples:');
  console.log('  node scripts/test-credits.js abc123');
  console.log('  node scripts/test-credits.js abc123 add 10');
  console.log('  node scripts/test-credits.js abc123 check');
  process.exit(1);
}

const userId = args[0];
const action = args[1] || 'view';
const amount = parseInt(args[2]) || 0;

(async () => {
  try {
    switch (action) {
      case 'view':
        await viewCredits(userId);
        break;
      case 'add':
        if (amount <= 0) {
          console.error('❌ Amount must be greater than 0');
          process.exit(1);
        }
        await addCredits(userId, amount);
        break;
      case 'check':
        await checkCredit(userId);
        break;
      default:
        console.error(`❌ Unknown action: ${action}`);
        process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
