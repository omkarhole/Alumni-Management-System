// MongoDB Models Index
const User = require('./User.model');
const Course = require('./Course.model');
const Enrollment = require('./Enrollment.model');
const Career = require('./Career.model');
const Event = require('./Event.model');
const EventCalendar = require('./EventCalendar.model');
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
const Otp = require('./Otp.model');
const Endorsement = require('./Endorsement.model');
const DirectMessage = require('./DirectMessage.model');
const Badge = require('./Badge.model');
const UserBadge = require('./UserBadge.model');
const Achievement = require('./Achievement.model');
const Donation = require('./Donation.model');
const DonationCampaign = require('./DonationCampaign.model');

module.exports = {
  User,
  Course,
  Enrollment,
  Career,
  Event,
  EventCalendar,
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
  Otp,
  Endorsement,
  DirectMessage,
  Badge,
  UserBadge,
  Achievement,
  Donation,
  DonationCampaign
};
