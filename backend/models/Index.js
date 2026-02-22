// MongoDB Models Index
const User = require('./User.model');
const Course = require('./Course.model');
const Career = require('./Career.model');
const Event = require('./Event.model');
const ForumTopic = require('./ForumTopic.model');
const Gallery = require('./Gallery.model');
const SystemSetting = require('./SystemSetting.model');
const News = require('./News.model');
const Newsletter = require('./Newsletter.model');
const MentorProfile = require('./MentorProfile.model');
const MentorshipMatch = require('./MentorshipMatch.model');
const MentorshipSession = require('./MentorshipSession.model');
const MentorshipMessage = require('./MentorshipMessage.model');
const JobReferral = require('./JobReferral.model');
const JobSubscription = require('./JobSubscription.model');
const Endorsement = require('./Endorsement.model');

module.exports = {
  User,
  Course,
  Career,
  Event,
  ForumTopic,
  Gallery,
  SystemSetting,
  News,
  Newsletter,
  MentorProfile,
  MentorshipMatch,
  MentorshipSession,
  MentorshipMessage,
  JobReferral,
  JobSubscription,
  Endorsement
};
