// Run it with:
// => node test.js

// It will:
// => Connect to DB
// => Sync models
// => Insert sample data
// => Fetch with associations (include) to check relations

// test.js
const {
  sequelize,
  User,
  AlumnusBio,
  Course,
  Career,
  Event,
  EventCommit,
  ForumTopic,
  ForumComment,
  Gallery,
  SystemSetting,
} = require("../backend/models/Index"); // auto-loads index.js inside models/

async function runTests() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // Sync models (WARNING: { force: true } drops and recreates tables)
    await sequelize.sync({ alter: true });
    console.log("✅ Tables synced successfully.");

    // ====== Insert Test Data ======
    const course = await Course.create({ course: "Computer Science", about: "CS course" });
    console.log("📘 Course created:", course.toJSON());

    const alumnus = await AlumnusBio.create({
      name: "John Doe",
      gender: "Male",
      batch: 2020,
      course_id: course.id,
      email: "john@example.com"
    });
    console.log("🎓 Alumnus created:", alumnus.toJSON());

    const user = await User.create({
      name: "John User",
      email: "johnuser@example.com",
      password: "securepassword",
      alumnus_id: alumnus.id
    });
    console.log("👤 User created:", user.toJSON());

    const career = await Career.create({
      company: "Tech Corp",
      location: "New York",
      job_title: "Software Engineer",
      description: "Worked on backend APIs",
      user_id: user.id
    });
    console.log("💼 Career created:", career.toJSON());

    const event = await Event.create({
      title: "Alumni Meetup",
      content: "Networking event for alumni.",
      schedule: new Date(),
      banner: "meetup.jpg"
    });
    console.log("🎉 Event created:", event.toJSON());

    const commit = await EventCommit.create({
      event_id: event.id,
      user_id: user.id
    });
    console.log("📝 EventCommit created:", commit.toJSON());

    const topic = await ForumTopic.create({
      title: "First Topic",
      description: "This is the first forum topic.",
      user_id: user.id
    });
    console.log("💬 ForumTopic created:", topic.toJSON());

    const comment = await ForumComment.create({
      topic_id: topic.id,
      comment: "This is my comment!",
      user_id: user.id
    });
    console.log("🗨️ ForumComment created:", comment.toJSON());

    const gallery = await Gallery.create({
      image_path: "image.jpg",
      about: "Graduation ceremony"
    });
    console.log("🖼️ Gallery created:", gallery.toJSON());

    const setting = await SystemSetting.create({
      name: "Alumni Portal",
      email: "admin@alumni.com",
      contact: "1234567890",
      cover_img: "cover.jpg",
      about_content: "Welcome to our alumni portal!"
    });
    console.log("⚙️ SystemSetting created:", setting.toJSON());

    // ====== Test Associations ======
    const alumnusWithCourse = await AlumnusBio.findOne({
      where: { id: alumnus.id },
      include: ["course", "user"]
    });
    console.log("🔗 Alumnus with relations:", JSON.stringify(alumnusWithCourse, null, 2));

    const userWithCareers = await User.findOne({
      where: { id: user.id },
      include: ["bio", "careers", "forumTopics", "forumComments", "eventCommits"]
    });
    console.log("🔗 User with relations:", JSON.stringify(userWithCareers, null, 2));

    console.log("✅ All tests passed!");
  } catch (err) {
    console.error("❌ Error in tests:", err);
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed.");
  }
}

runTests();
