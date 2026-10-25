import http from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
app.use(express.json());

const PORT = 3000;

// Persistent Server-Side Student Registry (Never expires, shared across all windows/browsers)
const DATA_DIR = path.resolve(__dirname, 'data');
const STUDENTS_FILE = path.resolve(DATA_DIR, 'students_registry.json');
const REGISTRY_META_FILE = path.resolve(DATA_DIR, 'registry_meta.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read persistent students and last active student
app.get('/api/students', (_req, res) => {
  try {
    let students: any[] = [];
    let lastActiveStudentId: string | null = null;

    if (fs.existsSync(STUDENTS_FILE)) {
      const data = fs.readFileSync(STUDENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      students = Array.isArray(parsed) ? parsed : [];
    }

    if (fs.existsSync(REGISTRY_META_FILE)) {
      try {
        const meta = JSON.parse(fs.readFileSync(REGISTRY_META_FILE, 'utf-8'));
        lastActiveStudentId = meta.lastActiveStudentId || null;
      } catch {
        // ignore
      }
    }

    // If no meta but students exist, default last active to the first student
    if (!lastActiveStudentId && students.length > 0) {
      lastActiveStudentId = students[0].id;
    }

    return res.json({ students, lastActiveStudentId });
  } catch (err) {
    console.error('Error reading students file:', err);
    return res.json({ students: [], lastActiveStudentId: null });
  }
});

// Save persistent students and update lastActiveStudentId
app.post('/api/students', (req, res) => {
  try {
    const { students, lastActiveStudentId } = req.body;
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: 'Expected students array' });
    }
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');

    if (lastActiveStudentId) {
      fs.writeFileSync(
        REGISTRY_META_FILE,
        JSON.stringify({ lastActiveStudentId, updatedAt: new Date().toISOString() }, null, 2),
        'utf-8'
      );
    }

    return res.json({ success: true, count: students.length, lastActiveStudentId });
  } catch (err) {
    console.error('Error saving students file:', err);
    return res.status(500).json({ error: 'Failed to persist student records' });
  }
});

// Save last active student ID separately
app.post('/api/students/active', (req, res) => {
  try {
    const { studentId } = req.body;
    if (studentId) {
      fs.writeFileSync(
        REGISTRY_META_FILE,
        JSON.stringify({ lastActiveStudentId: studentId, updatedAt: new Date().toISOString() }, null, 2),
        'utf-8'
      );
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Error saving active student ID:', err);
    return res.status(500).json({ error: 'Failed to save active student' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Serve static assets from public/ (including high-res real cobla audio recordings)
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!isProd) {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 CoblaBot Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
