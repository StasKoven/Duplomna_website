const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const PRODUCT_DIR = path.join(UPLOAD_ROOT, 'products');

// Ensure upload directory exists at startup so multer doesn't choke on the
// first POST after a fresh checkout.
fs.mkdirSync(PRODUCT_DIR, { recursive: true });

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MAX_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, PRODUCT_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : '.jpg';
    const id = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${id}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Дозволені формати: JPEG, PNG, WEBP, GIF, AVIF'));
    }
    cb(null, true);
  },
});

function buildPublicUrl(req, filename) {
  // Always serve from /uploads/products/<filename>. Use the request origin so
  // the URL is reachable from whatever host the admin used (Railway, localhost).
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString().split(',')[0].trim();
  const host = req.get('host');
  return `${proto}://${host}/uploads/products/${filename}`;
}

/**
 * POST /api/uploads/image
 * field: file
 * Returns: { url }
 */
router.post('/image', verifyToken, requireAdmin, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Файл завеликий (максимум 5 MB)'
          : err.message || 'Не вдалось завантажити файл';
      return res.status(400).json({ message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Файл відсутній. Поле повинно називатись "file".' });
    }

    return res.status(201).json({
      url: buildPublicUrl(req, req.file.filename),
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});

module.exports = router;
