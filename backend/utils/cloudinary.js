const crypto = require('crypto');

const CLOUDINARY_API_BASE = 'https://api.cloudinary.com/v1_1';

function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  };
}

function isCloudinaryConfigured() {
  const cfg = getCloudinaryConfig();
  return Boolean(cfg.cloudName && cfg.apiKey && cfg.apiSecret);
}

function buildSignature(params, apiSecret) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${serialized}${apiSecret}`)
    .digest('hex');
}

async function uploadBufferToCloudinary(buffer, options = {}) {
  const cfg = getCloudinaryConfig();
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }
  if (typeof fetch !== 'function' || typeof FormData === 'undefined' || typeof Blob === 'undefined') {
    throw new Error('Cloudinary upload requires Node.js 18+ (fetch/FormData support)');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = options.folder || '';
  const publicId = options.publicId || '';
  const paramsToSign = { timestamp };
  if (folder) {
    paramsToSign.folder = folder;
  }
  if (publicId) {
    paramsToSign.public_id = publicId;
  }

  const signature = buildSignature(paramsToSign, cfg.apiSecret);
  const form = new FormData();
  const fileName = options.originalname || `upload_${Date.now()}.jpg`;
  const fileType = options.mimetype || 'application/octet-stream';
  form.append('file', new Blob([buffer], { type: fileType }), fileName);
  form.append('api_key', cfg.apiKey);
  form.append('timestamp', String(timestamp));
  if (folder) {
    form.append('folder', folder);
  }
  if (publicId) {
    form.append('public_id', publicId);
  }
  form.append('signature', signature);

  const response = await fetch(`${CLOUDINARY_API_BASE}/${cfg.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const data = await response.json();
  if (!response.ok) {
    const cloudMessage = data?.error?.message || 'Failed to upload image to Cloudinary';
    throw new Error(cloudMessage);
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
  };
}

async function deleteFromCloudinary(publicId) {
  if (!publicId) return { result: 'not_found' };
  const cfg = getCloudinaryConfig();
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }
  if (typeof fetch !== 'function') {
    throw new Error('Cloudinary deletion requires Node.js 18+ (fetch support)');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildSignature({ public_id: publicId, timestamp }, cfg.apiSecret);
  const body = new URLSearchParams({
    public_id: publicId,
    api_key: cfg.apiKey,
    timestamp: String(timestamp),
    signature,
  });

  const response = await fetch(`${CLOUDINARY_API_BASE}/${cfg.cloudName}/image/destroy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    const cloudMessage = data?.error?.message || 'Failed to delete image from Cloudinary';
    throw new Error(cloudMessage);
  }

  return data;
}

module.exports = {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};
