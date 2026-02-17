const multer=require('multer');
const path=require('path');
const fs = require('fs');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // __dirname isn't available in ESM, so build from process.cwd()
      const avatarDir = path.join(process.cwd(), 'public', 'avatars');
      ensureDir(avatarDir);
      cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname +
          '_' +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  }),
}); 


const galleryUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const imageDir = path.join(process.cwd(), 'public', 'images');
      ensureDir(imageDir);
      cb(null, imageDir);
    },
    filename: (req, file, cb) => {
      cb(null, `gallery_${Date.now()}${path.extname(file.originalname)}`);
    }
  })
});


module.exports = { avatarUpload, galleryUpload };
