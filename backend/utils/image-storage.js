const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('./cloudinary');

const MIME_EXTENSION_MAP = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

function isHttpUrl(value = '') {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function sanitizeFolder(value = '') {
  return String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '');
}

function getFileExtension(file = {}) {
  const extFromName = path.extname(file.originalname || '').toLowerCase();
  if (extFromName) return extFromName;
  return MIME_EXTENSION_MAP[file.mimetype] || '.jpg';
}

function createFileToken(prefix = 'image', file = {}) {
  const safePrefix = String(prefix || 'image').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'image';
  return `${safePrefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${getFileExtension(file)}`;
}

function buildCloudinaryFolder(folder = '') {
  const rootFolder = sanitizeFolder(process.env.CLOUDINARY_FOLDER || 'alumni-management-system');
  const nestedFolder = sanitizeFolder(folder);
  return [rootFolder, nestedFolder].filter(Boolean).join('/');
}

function buildLocalFolder(folder = '') {
  const cleaned = sanitizeFolder(folder);
  return cleaned || 'images';
}

function toRelativePublicPath(storedPath = '') {
  const normalized = String(storedPath || '').replace(/\\/g, '/');
  if (!normalized || isHttpUrl(normalized)) {
    return '';
  }

  const publicMatch = normalized.match(/public\/.*/i);
  if (publicMatch) {
    return publicMatch[0].replace(/^public\//i, 'public/');
  }

  return normalized.replace(/^\/+/, '');
}

function resolveLocalDiskPath(storedPath = '') {
  const relativePath = toRelativePublicPath(storedPath);
  if (!relativePath) return '';
  return path.join(process.cwd(), ...relativePath.split('/'));
}

function cloudinaryPublicIdFromUrl(url = '') {
  if (!isHttpUrl(url) || !/res\.cloudinary\.com/i.test(url)) {
    return '';
  }

  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return '';

  let tail = url.slice(uploadIndex + '/upload/'.length);
  const queryIndex = tail.indexOf('?');
  if (queryIndex >= 0) {
    tail = tail.slice(0, queryIndex);
  }

  const parts = tail.split('/').filter(Boolean);
  if (!parts.length) return '';

  const versionIndex = parts.findIndex((item) => /^v\d+$/.test(item));
  const fileParts = versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts;
  if (!fileParts.length) return '';

  return fileParts.join('/').replace(/\.[a-zA-Z0-9]+$/, '');
}

async function saveLocally(file, options = {}) {
  if (!file || !file.buffer) {
    throw new Error('Invalid upload payload');
  }

  const folder = buildLocalFolder(options.folder);
  const fileName = createFileToken(options.prefix || 'image', file);
  const targetDir = path.join(process.cwd(), 'public', ...folder.split('/'));
  await fs.promises.mkdir(targetDir, { recursive: true });

  const diskPath = path.join(targetDir, fileName);
  await fs.promises.writeFile(diskPath, file.buffer);

  return {
    path: ['public', ...folder.split('/'), fileName].join('/'),
    publicId: '',
    provider: 'local',
  };
}

async function uploadImage(file, options = {}) {
  if (!file || !file.buffer) {
    throw new Error('Image file is required');
  }

  if (isCloudinaryConfigured()) {
    const cloudFolder = buildCloudinaryFolder(options.folder);
    const publicToken = createFileToken(options.prefix || 'image', file).replace(/\.[a-zA-Z0-9]+$/, '');

    const uploaded = await uploadBufferToCloudinary(file.buffer, {
      folder: cloudFolder,
      publicId: publicToken,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    return {
      path: uploaded.secureUrl,
      publicId: uploaded.publicId,
      provider: 'cloudinary',
    };
  }

  return saveLocally(file, options);
}

async function deleteImage(storedPath = '', publicId = '') {
  const cloudPublicId = publicId || cloudinaryPublicIdFromUrl(storedPath);

  if (cloudPublicId && isCloudinaryConfigured()) {
    try {
      await deleteFromCloudinary(cloudPublicId);
      return;
    } catch (err) {
      console.error('Cloud image deletion failed:', err.message);
    }
  }

  const diskPath = resolveLocalDiskPath(storedPath);
  if (!diskPath) return;

  try {
    await fs.promises.unlink(diskPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

module.exports = {
  uploadImage,
  deleteImage,
  isHttpUrl,
};
