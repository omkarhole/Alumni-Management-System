const express=require('express');
const router=express.Router();
const {listGallery, addGallery, deleteGallery}=require('../controllers/gallery.controller');
const {galleryUpload}=require('../utils/file-upload');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

router.get('/', listGallery);
router.post('/', authenticate, isAdmin, galleryUpload.single('image'), addGallery);
router.delete('/:id', authenticate, isAdmin, deleteGallery);

module.exports=router;