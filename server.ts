import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { del, put } from '@vercel/blob';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const UPLOADS_ROOT = path.resolve(__dirname, 'public', 'uploads');
const ADMIN_OWNER_EMAILS = new Set(['contato@macieldsgn.com', 'palazzomotos@gmail.com']);

if (!fs.existsSync(UPLOADS_ROOT)) {
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}

interface VerifiedFirebaseUser {
  localId: string;
  email: string;
  emailVerified: boolean;
}

async function verifyFirebaseBearerToken(authHeader?: string): Promise<VerifiedFirebaseUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) return null;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      users?: Array<{ localId?: string; email?: string; emailVerified?: boolean }>;
    };
    const user = data.users?.[0];
    if (!user?.localId || !user?.email || !user.emailVerified) {
      return null;
    }
    return {
      localId: user.localId,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
    };
  } catch (err) {
    console.error('Firebase token verification error:', err);
    return null;
  }
}

function sanitizeSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'general';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));

  // Serve uploaded assets from public/uploads
  app.use('/uploads', express.static(UPLOADS_ROOT, { maxAge: '7d' }));

  // Authenticated upload endpoint (stores WebP assets cleanly by vehicle UUID or site-assets)
  app.post('/api/upload', async (req, res) => {
    const user = await verifyFirebaseBearerToken(req.headers.authorization);
    if (!user) {
      res.status(401).json({ error: 'Autenticação administrativa necessária para upload.' });
      return;
    }
    if (!ADMIN_OWNER_EMAILS.has(user.email.toLowerCase())) {
      // Check Firestore admins doc via REST if not primary owner
      try {
        const docUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/admins/${encodeURIComponent(user.localId)}`;
        const adminRes = await fetch(docUrl, {
          headers: { Authorization: req.headers.authorization || '' },
        });
        if (!adminRes.ok) {
          res.status(403).json({ error: 'Permissão administrativa negada.' });
          return;
        }
      } catch {
        res.status(403).json({ error: 'Permissão administrativa negada.' });
        return;
      }
    }

    const { dataUrl, folder = 'site-assets' } = req.body as {
      dataUrl?: string;
      folder?: string;
    };

    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Imagem inválida.' });
      return;
    }

    const match = /^data:image\/(webp|jpeg|png|avif);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Formato de imagem não suportado.' });
      return;
    }

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.byteLength > 8 * 1024 * 1024) {
      res.status(413).json({ error: 'Imagem otimizada excede 8 MB.' });
      return;
    }

    const safeFolder = folder
      .split('/')
      .filter(Boolean)
      .map(sanitizeSegment)
      .join('/');

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const mimeType = match[1] === 'jpeg' ? 'image/jpeg' : `image/${match[1]}`;
      const pathname = `palazzo/${safeFolder || 'site-assets'}/${crypto.randomUUID()}.${ext}`;
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType: mimeType,
        addRandomSuffix: false,
      });
      res.json({ url: blob.url, bytes: buffer.byteLength });
      return;
    }

    const targetDir = path.resolve(UPLOADS_ROOT, safeFolder || 'site-assets');
    if (!targetDir.startsWith(UPLOADS_ROOT)) {
      res.status(400).json({ error: 'Caminho de destino inválido.' });
      return;
    }

    fs.mkdirSync(targetDir, { recursive: true });
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const fullPath = path.join(targetDir, fileName);
    fs.writeFileSync(fullPath, buffer);

    const publicUrl = `/uploads/${safeFolder || 'site-assets'}/${fileName}`;
    res.json({ url: publicUrl, bytes: buffer.byteLength });
  });

  // Delete orphaned uploaded asset (Vercel Blob or local public/uploads)
  app.delete('/api/upload', async (req, res) => {
    const user = await verifyFirebaseBearerToken(req.headers.authorization);
    if (!user) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }

    const { url } = req.body as { url?: string };
    if (!url || typeof url !== 'string') {
      res.json({ deleted: false });
      return;
    }

    if (url.includes('.blob.vercel-storage.com/') && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.blob.vercel-storage.com')) {
          await del(url);
          res.json({ deleted: true });
          return;
        }
      } catch {
        res.json({ deleted: false });
        return;
      }
    }

    if (!url.startsWith('/uploads/')) {
      res.json({ deleted: false });
      return;
    }

    const rel = url.replace(/^\/uploads\//, '');
    const targetPath = path.resolve(UPLOADS_ROOT, rel);
    if (!targetPath.startsWith(UPLOADS_ROOT)) {
      res.status(400).json({ error: 'Caminho inválido.' });
      return;
    }

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      res.json({ deleted: true });
      return;
    }
    res.json({ deleted: false });
  });

  // Technical SEO: robots.txt & sitemap.xml
  app.get('/robots.txt', (req, res) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /admin/*',
        `Sitemap: ${origin.replace(/\/$/, '')}/sitemap.xml`,
      ].join('\n'),
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const staticUrls = ['/', '/motos'];
    const urlsXml = staticUrls
      .map(
        (route) =>
          `<url><loc>${origin}${route}</loc><changefreq>daily</changefreq><priority>${route === '/' ? '1.0' : '0.9'}</priority></url>`,
      )
      .join('');
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlsXml}</urlset>`,
    );
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Palazzo Motos server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Palazzo Motos server:', err);
  process.exit(1);
});
