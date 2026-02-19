const { Gallery } = require('../models/Index');
const { uploadImage, deleteImage } = require('../utils/image-storage');

function normalizeGalleryPath(storedPath = '') {
    const normalized = String(storedPath || '').replace(/\\/g, '/');
    if (/^https?:\/\//i.test(normalized)) {
        return normalized;
    }
    const publicMatch = normalized.match(/public\/.*/i);

    if (publicMatch) {
        return publicMatch[0].replace(/^public\//i, 'public/');
    }

    return normalized.replace(/^\/+/, '');
}

// print all gallery
async function listGallery(req, res, next) {
    try {
        const records = await Gallery.find().sort({ createdAt: -1 }).lean();
        const normalized = records.map((record) => ({
            ...record,
            image_path: normalizeGalleryPath(record.image_path)
        }));
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

// add new image to gallery
async function addGallery(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
        }
        const uploaded = await uploadImage(req.file, {
            folder: 'images',
            prefix: 'gallery',
        });
        const record = await Gallery.create({
            image_path: uploaded.path,
            image_public_id: uploaded.publicId || '',
            about: req.body.about,
        });
        res.status(201).json({ message: 'Gallery image uploaded successfully', ...record.toObject() });
    } catch (err) { next(err); }
}

// delete image from gallery
async function deleteGallery(req, res, next) {
    try {
        const img = await Gallery.findById(req.params.id);
        if (img) {
            try {
                await deleteImage(img.image_path, img.image_public_id);
            } catch (cleanupError) {
                console.error('Failed to delete gallery image file:', cleanupError.message);
            }
        }
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err)
     { next(err); }
}

module.exports={listGallery,addGallery,deleteGallery};

