const multer = require('multer');

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const imageFileFilter = (req, file, cb) => {
  if (!allowedImageTypes.has(file.mimetype)) {
    const error = new Error('Only image files (jpeg, png, webp, gif, svg) are allowed');
    error.status = 400;
    return cb(error);
  }
  return cb(null, true);
};

const commonUploadConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
  fileFilter: imageFileFilter,
};

const avatarUpload = multer(commonUploadConfig);
const galleryUpload = multer(commonUploadConfig);

module.exports = { avatarUpload, galleryUpload };
