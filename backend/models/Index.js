const {sequelize} = require('../utils/db.js');
const AlumnusBio = require('./AlumnusBio.js');
const Career = require('./Career.js');
const Course = require('./Course.js');
const Event = require('./Event.js');
const EventCommit = require('./EventCommit.js');
const ForumComment = require('./ForumComment.js');
const ForumTopic = require('./ForumTopic.js');
const Gallery = require('./Gallery.js');
const SystemSetting = require('./SystemSetting.js');
const User = require('./User.js');

// Initialize all models
const models = {
  AlumnusBio,
  Career,
  Course,
  Event,
  EventCommit,
  ForumComment,
  ForumTopic,
  Gallery,
  SystemSetting,
  User
};

// Initialize associations for each model
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  AlumnusBio,
  Career,
  Course,
  Event,
  EventCommit,
  ForumComment,
  ForumTopic,
  Gallery,
  SystemSetting,
  User
};
