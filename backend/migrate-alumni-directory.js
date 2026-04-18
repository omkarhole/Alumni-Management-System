/**
 * Migration Script: Update Alumni Directory Fields
 * 
 * This script adds the new directory fields to existing alumni records.
 * Run this in MongoDB after deploying the updated User model.
 * 
 * Usage:
 * 1. Connect to MongoDB
 * 2. Copy and paste this script into MongoDB console or save as migration file
 * 3. Run: node migrate-alumni-directory.js
 * 
 * Fields Added:
 * - location (String)
 * - company (String) 
 * - job_title (String)
 * - industry (String)
 * - interests (Array)
 * - endorsementCount (Number)
 * - bio (String)
 * - isSearchable (Boolean)
 */

const mongoose = require('mongoose');
const { User, Career, Endorsement } = require('./models/Index');

// Connection setup
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-db');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Migration function
const migrateAlumniDirectory = async () => {
  try {
    console.log('\n🚀 Starting Alumni Directory Migration...\n');

    // Get all alumni users
    const alumni = await User.find({ type: 'alumnus' });
    console.log(`Found ${alumni.length} alumni to migrate`);

    let successCount = 0;
    let errorCount = 0;

    // Process each alumni
    for (const alumnus of alumni) {
      try {
        // Get associated career information
        const career = await Career.findOne({ user: alumnus._id });

        // Get endorsement count
        const endorsementCount = await Endorsement.countDocuments({ endorsee: alumnus._id });

        // Prepare update data
        const updateData = {
          'alumnus_bio.location': career?.location || '',
          'alumnus_bio.company': career?.company || '',
          'alumnus_bio.job_title': career?.job_title || '',
          'alumnus_bio.industry': career?.job_type || '',
          'alumnus_bio.interests': [],
          'alumnus_bio.endorsementCount': endorsementCount,
          'alumnus_bio.bio': '',
          'alumnus_bio.isSearchable': true
        };

        // Update the user
        await User.findByIdAndUpdate(alumnus._id, updateData);
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`  ✓ Processed ${successCount}/${alumni.length} alumni...`);
        }
      } catch (error) {
        console.error(`  ✗ Error migrating alumni ${alumnus._id}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Successfully migrated: ${successCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📈 Total: ${alumni.length}`);

    // Create indexes
    console.log('\n🔧 Creating indexes...');
    try {
      await User.collection.createIndex({ 'alumnus_bio.location': 1 });
      await User.collection.createIndex({ 'alumnus_bio.company': 1 });
      await User.collection.createIndex({ 'alumnus_bio.industry': 1 });
      await User.collection.createIndex({ 'alumnus_bio.batch': 1 });
      await User.collection.createIndex({ 'alumnus_bio.skills': 1 });
      await User.collection.createIndex({ 'alumnus_bio.endorsementCount': -1 });
      await User.collection.createIndex({ 'alumnus_bio.isSearchable': 1 });
      
      // Full-text search index
      await User.collection.createIndex({
        name: 'text',
        email: 'text',
        'alumnus_bio.bio': 'text',
        'alumnus_bio.location': 'text',
        'alumnus_bio.company': 'text',
        'alumnus_bio.job_title': 'text',
        'alumnus_bio.interests': 'text'
      });
      
      console.log('✅ Indexes created successfully');
    } catch (error) {
      console.error('⚠️  Error creating indexes:', error.message);
    }

    console.log('\n✨ Migration complete!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration
connectDB().then(() => migrateAlumniDirectory());

// Export for use in other scripts
module.exports = { migrateAlumniDirectory };
