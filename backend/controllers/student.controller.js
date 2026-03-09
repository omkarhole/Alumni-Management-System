const { User, Career, Event, ForumTopic } = require("../models/Index");
const bcrypt = require('bcrypt');
const getDataUri = require('../utils/datauri');
const cloudinary = require('../utils/cloudinaryConfig');
async function getMyApplications(req, res, next) {
    try {
        // Find all career applications for the logged-in student
        const applications = await Career.find({ 'applicants.user': req.user.id })
            .populate('user', 'name email student_bio')
            .populate('applicants.user', 'name email student_bio');
        res.json(applications);
    } catch (error) {

        next(error);
    }
}
// get student profile details
async function getStudentProfile(req, res, next) {
    try {
        const student = await User.findById(req.user.id)
            .populate('student_bio.course');
        res.json(student);

    }
    catch (err) {
        next(err);
    }
}
// update student (bio) profile details
async function updateStudentProfile(req, res, next) {
    try {
        const { name, email, student_bio, password } = req.body;
        let parsedBio = student_bio;
        if (typeof student_bio === 'string') {
            try { parsedBio = JSON.parse(student_bio); } catch (e) { }
        }
        const updates = { name, email, student_bio: parsedBio };
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        if (req.file) {
            const currentUser = await User.findById(req.user.id);
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: 'alumni_avatars'
            });
            updates.student_bio.avatar = cloudResponse.secure_url;
            updates.student_bio.avatar_public_id = cloudResponse.public_id;

            if (currentUser.student_bio && currentUser.student_bio.avatar_public_id) {
                await cloudinary.uploader.destroy(currentUser.student_bio.avatar_public_id).catch(() => { });
            }
        }

        const updatedStudent = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
            .populate('student_bio.course');
        res.json(updatedStudent);
    } catch (err) {
        next(err);
    }

}
async function getCounts(req, res, next) {
    try {
        const userId = req.user.id;

        const [forumCount, jobCount, upEventCount, myApplicationsCount] = await Promise.all([
            // total forum topics count
            ForumTopic.countDocuments(),
            // total jobs count
            Career.countDocuments(),
            // upcoming events count
            Event.countDocuments({ schedule: { $gte: new Date() } }),
            // my applications count
            Career.countDocuments({ 'applicants.user': userId })
        ]);

        // return counts as json
        res.json({
            forums: forumCount,
            jobs: jobCount,
            upevents: upEventCount,
            applications: myApplicationsCount
        });
    }
    catch (err) {
        next(err);
    }
}

module.exports = { getMyApplications, getStudentProfile, updateStudentProfile, getCounts };