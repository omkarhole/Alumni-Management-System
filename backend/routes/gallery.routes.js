const express=require('express');
const router=express.Router();
const {listGallery, addGallery, deleteGallery}=require('../controllers/gallery.controller');
const {galleryUpload}=require('../utils/file-upload');

router.get('/', listGallery);
router.post('/', galleryUpload.single('image'), addGallery);
router.delete('/:id', deleteGallery);

module.exports=router;