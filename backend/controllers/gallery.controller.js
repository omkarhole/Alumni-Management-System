const {Gallery} =require('../models/Index');

const fs=require('fs');
const path = require('path');

function normalizeGalleryPath(storedPath = '') {
    const normalized = String(storedPath || '').replace(/\\/g, '/');
    const publicMatch = normalized.match(/public\/.*/i);

    if (publicMatch) {
        return publicMatch[0].replace(/^public\//i, 'public/');
    }

    return normalized.replace(/^\/+/, '');
}

function resolveDiskPath(storedPath = '') {
    if (!storedPath) return '';

    if (path.isAbsolute(storedPath)) {
        return storedPath;
    }

    const normalized = normalizeGalleryPath(storedPath);
    return path.join(process.cwd(), normalized.split('/').join(path.sep));
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
        const imagePath = `public/images/${req.file.filename}`;
        const record = await Gallery.create({ image_path: imagePath, about: req.body.about });
        res.status(201).json({ message: 'Gallery image uploaded successfully', ...record.toObject() });
    } catch (err) { next(err); }
}

// delete image from gallery
async function deleteGallery(req, res, next) {
    try {
        const img = await Gallery.findById(req.params.id);
        if (img) {
            const diskPath = resolveDiskPath(img.image_path);
            if (diskPath && fs.existsSync(diskPath)) {
                fs.unlinkSync(diskPath);
            }
        }
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err)
     { next(err); }
}

module.exports={listGallery,addGallery,deleteGallery};

