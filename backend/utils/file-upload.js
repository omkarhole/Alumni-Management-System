const multer=require('multer');
const path=require('path');

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // __dirname isn't available in ESM, so build from process.cwd()
      cb(null, path.join(process.cwd(), 'public', 'avatars'));
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
      cb(null, path.join(process.cwd(), 'public', 'images'));
    },    filename:   (req, file, cb) => cb(null, file.originalname)
  })
});


module.exports = { avatarUpload, galleryUpload };