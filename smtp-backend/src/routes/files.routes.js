const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const pool    = require('../config/db');
const { protect }     = require('../middleware/auth');
const { generateUid } = require('../helpers/uid');

const router = express.Router();

// Ensure public/uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Auto-create template_files table
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS template_files (
        id SERIAL PRIMARY KEY,
        uid VARCHAR(100) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_size BIGINT DEFAULT 0,
        mime_type VARCHAR(100) DEFAULT 'image/png',
        extension VARCHAR(20) DEFAULT 'png',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error('💥 Failed to initialize template_files table:', err);
  }
};
initDb();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${cleanName}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max limit
});

const fmt = (r, baseUrl) => ({
  id:            r.id,
  uid:           r.uid,
  name:          r.file_name,
  original_name: r.original_name,
  url:           r.file_url.startsWith('http') ? r.file_url : `${baseUrl}${r.file_url}`,
  file_size:     parseInt(r.file_size || 0, 10),
  mime_type:     r.mime_type,
  extension:     r.extension,
  dateAdded:     r.created_at,
});

// ── GET /api/files (or /api/files/get-all-files) ─────────────
router.get(['/files', '/files/get-all-files'], protect, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM template_files WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    return res.json({
      status: 'success',
      data: rows.map((r) => fmt(r, baseUrl)),
    });
  } catch (err) {
    console.error('💥 GET /api/files error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch files' });
  }
});

// ── POST /api/files/upload ────────────────────────────────────
router.post('/files/upload', protect, upload.array('file', 10), async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const insertedFiles = [];

    for (const f of files) {
      const uid = generateUid();
      const ext = path.extname(f.originalname).replace('.', '').toLowerCase() || 'png';
      const fileUrl = `/uploads/${f.filename}`;

      const { rows } = await pool.query(
        `INSERT INTO template_files
           (uid, user_id, file_name, original_name, file_path, file_url, file_size, mime_type, extension)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          uid,
          req.user.id,
          f.originalname,
          f.originalname,
          f.path,
          fileUrl,
          f.size,
          f.mimetype,
          ext,
        ]
      );

      insertedFiles.push(fmt(rows[0], baseUrl));
    }

    return res.status(201).json({
      status: 'success',
      message: 'File(s) uploaded successfully',
      data: insertedFiles.length === 1 ? insertedFiles[0] : insertedFiles,
    });
  } catch (err) {
    console.error('💥 POST /api/files/upload error:', err);
    return res.status(500).json({ status: 'error', message: 'File upload failed', error: err.message });
  }
});

// ── DELETE /api/files/delete-a-file ───────────────────────────
router.delete(['/files/delete-a-file', '/files/:id'], protect, async (req, res) => {
  try {
    const uid = req.query.file_uid || req.query.uid || req.params.id;
    if (!uid) {
      return res.status(400).json({ status: 'error', message: 'File UID/ID is required' });
    }

    const { rows } = await pool.query(
      `SELECT * FROM template_files WHERE (uid = $1 OR id::text = $1) AND user_id = $2`,
      [uid, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'File not found' });
    }

    const fileRecord = rows[0];

    // Delete file from disk
    if (fileRecord.file_path && fs.existsSync(fileRecord.file_path)) {
      try {
        fs.unlinkSync(fileRecord.file_path);
      } catch (err) {
        console.warn('⚠️ Could not delete file from disk:', err.message);
      }
    }

    await pool.query(`DELETE FROM template_files WHERE id = $1`, [fileRecord.id]);

    return res.json({ status: 'success', message: 'File deleted successfully' });
  } catch (err) {
    console.error('💥 DELETE /api/files error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to delete file' });
  }
});

// ── PUT /api/files/rename ─────────────────────────────────────
router.put(['/files/rename', '/files/:id'], protect, async (req, res) => {
  try {
    const uid = req.query.file_uid || req.query.uid || req.params.id || req.body.id || req.body.uid;
    const { name } = req.body;
    if (!uid || !name) {
      return res.status(400).json({ status: 'error', message: 'File UID/ID and new name are required' });
    }

    const { rows } = await pool.query(
      `UPDATE template_files
       SET file_name = $1, updated_at = NOW()
       WHERE (uid = $2 OR id::text = $2) AND user_id = $3
       RETURNING *`,
      [name.trim(), uid, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'File not found' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    return res.json({ status: 'success', message: 'File renamed successfully', data: fmt(rows[0], baseUrl) });
  } catch (err) {
    console.error('💥 PUT /api/files/rename error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to rename file' });
  }
});

module.exports = router;
