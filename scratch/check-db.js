const fs = require('fs');
const path = require('path');

// Manually parse .env.local because dotenv might not be installed globally/locally in devDeps
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const fileContent = fs.readFileSync(envPath, 'utf8');
  fileContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      // Remove surrounding quotes if they exist
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const admin = require('firebase-admin');

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const privateKey = rawPrivateKey
  ? rawPrivateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
  : undefined;

const config = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey,
};

console.log('--- Connecting to Firebase ---');
console.log('Project ID:', config.projectId);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config)
  });
}

const db = admin.firestore();

async function run() {
  const cutoffDate = new Date();
  // Cutoff is the start of today (UTC)
  cutoffDate.setUTCHours(0, 0, 0, 0);
  const cutoffString = cutoffDate.toISOString();
  console.log('Threshold (Today Start UTC):', cutoffString);

  // 1. Get ALL news in database
  const allSnapshot = await db.collection('news').orderBy('publishedAt', 'desc').get();
  console.log('\nTotal news documents in Firestore:', allSnapshot.size);
  
  if (allSnapshot.empty) {
    console.log('No news documents found in database.');
    return;
  }

  console.log('\nList of all current news items in Firestore:');
  let oldItemsCount = 0;
  allSnapshot.forEach(doc => {
    const data = doc.data();
    const isOld = data.publishedAt < cutoffString;
    if (isOld) oldItemsCount++;
    console.log(
      `[${isOld ? 'OLD (Yesterday or older)' : 'TODAY'}]`,
      `ID: ${doc.id} | Date: ${data.publishedAt} | Title: ${data.title.substring(0, 50)}...`
    );
  });

  console.log(`\nSummary:`);
  console.log(`- Today's items: ${allSnapshot.size - oldItemsCount}`);
  console.log(`- Old items (> 1 day): ${oldItemsCount}`);
}

run().catch(console.error);
