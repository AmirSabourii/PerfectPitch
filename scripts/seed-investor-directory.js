#!/usr/bin/env node

/**
 * Seed Middle East investor directory into Firestore (collection: investorDirectory).
 * Reads from data/middle-east-investors.json. Can be re-run to add/update; uses name+country as logical key.
 *
 * Usage:
 *   node scripts/seed-investor-directory.js
 *   node scripts/seed-investor-directory.js path/to/custom.json
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS or Firebase Admin (same as manage-credits.js).
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();
const COLLECTION = 'investorDirectory';

function slug(name, country) {
  return `${name.replace(/\s+/g, '-').toLowerCase()}_${country.replace(/\s+/g, '-').toLowerCase()}`.replace(/[^a-z0-9-_]/g, '');
}

async function main() {
  const jsonPath = process.argv[2] || path.join(__dirname, '..', 'data', 'middle-east-investors.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  let rows;
  try {
    rows = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(rows)) {
    console.error('JSON must be an array of investor entries.');
    process.exit(1);
  }

  const now = new Date().toISOString();
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const name = row.name && String(row.name).trim();
    const country = row.country && String(row.country).trim();
    if (!name || !country) {
      console.warn('Skipping entry missing name or country:', row);
      continue;
    }

    const id = slug(name, country);
    const ref = db.collection(COLLECTION).doc(id);
    const doc = {
      id,
      name,
      type: row.type || 'vc',
      country,
      city: row.city || null,
      description: row.description || null,
      website: row.website || null,
      applyUrl: row.applyUrl || null,
      stages: row.stages || [],
      industries: row.industries || [],
      checkSize: row.checkSize || null,
      highlights: row.highlights || [],
      source: row.source || 'manual',
      updatedAt: now,
      lang: row.lang || 'en',
    };

    const snap = await ref.get();
    if (snap.exists) {
      await ref.update(doc);
      updated++;
    } else {
      await ref.set(doc);
      created++;
    }
  }

  console.log('Investor directory seed done.');
  console.log('Created:', created, 'Updated:', updated, 'Total rows:', rows.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
