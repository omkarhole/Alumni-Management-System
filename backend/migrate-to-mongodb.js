/**
 * Migration Script: MySQL to MongoDB
 * 
 * This script migrates data from MySQL to MongoDB.
 * Make sure MongoDB is running before executing this script.
 * 
 * Usage: node migrate-to-mongodb.js
 */

const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

// Import MongoDB models
const User = require('./models/User.model');
const Course = require('./models/Course.model');
const Career = require('./models/Career.model');
const Event = require('./models/Event.model');
const ForumTopic = require('./models/ForumTopic.model');
const Gallery = require('./models/Gallery.model');
const SystemSetting = require('./models/SystemSetting.model');

// MySQL connection (old database)
const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: 'user123',
  database: 'alumni_db'
};

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni_db';

let mysqlConnection;

async function connectMySQL() {
  try {
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    throw error;
  }
}

async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

async function clearMongoDBCollections() {
  console.log('\n🗑️  Clearing existing MongoDB collections...');
  await User.deleteMany({});
  await Course.deleteMany({});
  await Career.deleteMany({});
  await Event.deleteMany({});
  await ForumTopic.deleteMany({});
  await Gallery.deleteMany({});
  await SystemSetting.deleteMany({});
  console.log('✅ Collections cleared');
}

async function migrateCourses() {
  console.log('\n📚 Migrating Courses...');
  const [courses] = await mysqlConnection.execute('SELECT * FROM courses');
  
  const courseMap = new Map();
  
  for (const course of courses) {
    const newCourse = await Course.create({
      _id: new mongoose.Types.ObjectId(),
      course: course.course,
      about: course.about || ''
    });
    courseMap.set(course.id, newCourse._id);
    console.log(`  ✓ Migrated course: ${course.course}`);
  }
  
  console.log(`✅ Migrated ${courses.length} courses`);
  return courseMap;
}

async function migrateUsers(courseMap) {
  console.log('\n👥 Migrating Users with Alumni Bios...');
  const [users] = await mysqlConnection.execute('SELECT * FROM users');
  const [alumniBios] = await mysqlConnection.execute('SELECT * FROM alumnus_bio');
  
  const userMap = new Map();
  
  for (const user of users) {
    const userData = {
      _id: new mongoose.Types.ObjectId(),
      name: user.name,
      email: user.email,
      password: user.password,
      type: user.type.toLowerCase(),
      auto_generated_pass: user.auto_generated_pass || ''
    };
    
    // Find matching alumnus bio
    if (user.type.toLowerCase() === 'alumnus') {
      const alumnusBio = alumniBios.find(bio => bio.id === user.alumnus_id);
      if (alumnusBio) {
        userData.alumnus_bio = {
          gender: alumnusBio.gender,
          batch: parseInt(alumnusBio.batch),
          course: courseMap.get(alumnusBio.course_id),
          connected_to: alumnusBio.connected_to || '',
          avatar: alumnusBio.avatar || '',
          status: alumnusBio.status
        };
      }
    }
    
    const newUser = await User.create(userData);
    userMap.set(user.id, newUser._id);
    console.log(`  ✓ Migrated user: ${user.email} (${user.type})`);
  }
  
  console.log(`✅ Migrated ${users.length} users`);
  return userMap;
}

async function migrateCareers(userMap) {
  console.log('\n💼 Migrating Careers...');
  const [careers] = await mysqlConnection.execute('SELECT * FROM careers');
  
  for (const career of careers) {
    await Career.create({
      company: career.company,
      location: career.location,
      job_title: career.job_title,
      description: career.description,
      user: userMap.get(career.user_id),
      createdAt: career.date_created
    });
    console.log(`  ✓ Migrated career: ${career.job_title} at ${career.company}`);
  }
  
  console.log(`✅ Migrated ${careers.length} careers`);
}

async function migrateEvents(userMap) {
  console.log('\n📅 Migrating Events with Commits...');
  const [events] = await mysqlConnection.execute('SELECT * FROM events');
  const [eventCommits] = await mysqlConnection.execute('SELECT * FROM event_commits');
  
  for (const event of events) {
    // Find commits for this event
    const commits = eventCommits
      .filter(commit => commit.event_id === event.id)
      .map(commit => ({
        user: userMap.get(commit.user_id)
      }));
    
    await Event.create({
      title: event.title,
      content: event.content,
      schedule: event.schedule,
      banner: event.banner || '',
      commits: commits,
      createdAt: event.date_created
    });
    console.log(`  ✓ Migrated event: ${event.title} (${commits.length} commits)`);
  }
  
  console.log(`✅ Migrated ${events.length} events`);
}

async function migrateForumTopics(userMap) {
  console.log('\n💬 Migrating Forum Topics with Comments...');
  const [topics] = await mysqlConnection.execute('SELECT * FROM forum_topics');
  const [comments] = await mysqlConnection.execute('SELECT * FROM forum_comments');
  
  for (const topic of topics) {
    // Find comments for this topic
    const topicComments = comments
      .filter(comment => comment.topic_id === topic.id)
      .map(comment => ({
        comment: comment.comment,
        user: userMap.get(comment.user_id),
        createdAt: comment.date_created
      }));
    
    await ForumTopic.create({
      title: topic.title,
      description: topic.description,
      user: userMap.get(topic.user_id),
      comments: topicComments,
      createdAt: topic.date_created
    });
    console.log(`  ✓ Migrated topic: ${topic.title} (${topicComments.length} comments)`);
  }
  
  console.log(`✅ Migrated ${topics.length} forum topics`);
}

async function migrateGallery() {
  console.log('\n🖼️  Migrating Gallery...');
  const [galleryItems] = await mysqlConnection.execute('SELECT * FROM gallery');
  
  for (const item of galleryItems) {
    await Gallery.create({
      image_path: item.image_path,
      about: item.about || '',
      createdAt: item.created
    });
    console.log(`  ✓ Migrated gallery item: ${item.image_path}`);
  }
  
  console.log(`✅ Migrated ${galleryItems.length} gallery items`);
}

async function migrateSystemSettings() {
  console.log('\n⚙️  Migrating System Settings...');
  const [settings] = await mysqlConnection.execute('SELECT * FROM system_settings');
  
  if (settings.length > 0) {
    const setting = settings[0];
    await SystemSetting.create({
      name: setting.name,
      email: setting.email,
      contact: setting.contact,
      cover_img: setting.cover_img || '',
      about_content: setting.about_content || ''
    });
    console.log(`  ✓ Migrated system settings: ${setting.name}`);
  }
  
  console.log(`✅ Migrated system settings`);
}

async function runMigration() {
  try {
    console.log('🚀 Starting Migration from MySQL to MongoDB...\n');
    
    // Connect to databases
    await connectMySQL();
    await connectMongoDB();
    
    // Clear existing data
    await clearMongoDBCollections();
    
    // Run migrations in order (respecting dependencies)
    const courseMap = await migrateCourses();
    const userMap = await migrateUsers(courseMap);
    await migrateCareers(userMap);
    await migrateEvents(userMap);
    await migrateForumTopics(userMap);
    await migrateGallery();
    await migrateSystemSettings();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Courses: ${await Course.countDocuments()}`);
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Careers: ${await Career.countDocuments()}`);
    console.log(`   - Events: ${await Event.countDocuments()}`);
    console.log(`   - Forum Topics: ${await ForumTopic.countDocuments()}`);
    console.log(`   - Gallery Items: ${await Gallery.countDocuments()}`);
    console.log(`   - System Settings: ${await SystemSetting.countDocuments()}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    // Close connections
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('\n🔌 MySQL connection closed');
    }
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run migration
runMigration();
