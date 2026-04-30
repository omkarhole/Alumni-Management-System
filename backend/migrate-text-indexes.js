/**
 * Migration Script: Ensure MongoDB text indexes for search endpoints
 *
 * Purpose:
 * - Ensure User and Business search indexes exist in deployed environments
 * - Print final index lists for quick verification
 *
 * Usage:
 * - npm run migrate:text-indexes
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Business } = require('./models/Index');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni_db';

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

function findTextIndex(indexes) {
  return indexes.find((idx) => Object.values(idx.key || {}).includes('text'));
}

async function ensureTextIndex(model, label, key, name) {
  const indexes = await model.collection.indexes();
  const existingText = findTextIndex(indexes);

  if (existingText) {
    console.log(`ℹ️  ${label}: existing text index found (${existingText.name})`);
    return;
  }

  await model.collection.createIndex(key, { name });
  console.log(`✅ ${label}: created text index (${name})`);
}

async function ensureSearchIndexes() {
  console.log('\n🔧 Ensuring required text indexes for search endpoints...');

  await ensureTextIndex(
    User,
    'users',
    { name: 'text', email: 'text', 'alumnus_bio.bio': 'text' },
    'users_search_text_idx'
  );

  await ensureTextIndex(
    Business,
    'businesses',
    { businessName: 'text', description: 'text' },
    'businesses_search_text_idx'
  );

  const userIndexes = await User.collection.indexes();
  const businessIndexes = await Business.collection.indexes();

  console.log('\n📌 User indexes:');
  userIndexes.forEach((idx) => {
    console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
  });

  console.log('\n📌 Business indexes:');
  businessIndexes.forEach((idx) => {
    console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
  });
}

async function run() {
  try {
    await connectDB();
    await ensureSearchIndexes();
    console.log('\n✨ Text index migration completed');
  } catch (error) {
    console.error('❌ Text index migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

run();
