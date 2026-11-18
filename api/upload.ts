import crypto from 'crypto';
import fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';
import { createRequire } from 'module';
import path from 'path';
import { del, put } from '@vercel/blob';

interface FirebaseAppletConfig {
  projectId: string;
  apiKey: string;
  firestoreDatabaseId: string;
}

function loadFirebaseConfig(): FirebaseAppletConfig {
  try {
    const require = createRequire(import.meta.url);
    return require('../firebase-applet-config.json') as FirebaseAppletConfig;
  } catch {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8')) as FirebaseAppletConfig;
  }
}

const firebaseConfig = loadFirebaseConfig();

const ADMIN_OWNER_EMAILS = new Set(['contato@macieldsgn.com', 'palazzomotos@gmail.com']);

interface VerifiedFirebaseUser {
  localId: string;
  email: string;
  emailVerified: boolean;
}

type VercelNodeRequest = IncomingMessage & {
  body?: unknown;
};

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sanitizeSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'general';
}

function isVercelBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

async function readJsonBody(req: VercelNodeRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    return JSON.parse(req.body) as Record<string, unknown>;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

async function verifyAdminCaller(authHeader?: string): Promise<VerifiedFirebaseUser | null> {
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

    if (!ADMIN_OWNER_EMAILS.has(user.email.toLowerCase())) {
      const docUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/admins/${encodeURIComponent(user.localId)}`;
      const adminRes = await fetch(docUrl, {
        headers: { Authorization: authHeader },
      });
      if (!adminRes.ok) {
        return null;
      }
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

export default async function handler(req: VercelNodeRequest, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const authHeader =
    typeof req.headers.authorization === 'string' ? req.headers.authorization : undefined;
  const user = await verifyAdminCaller(authHeader);
  if (!user) {
    sendJson(res, 401, { error: 'Autenticação administrativa necessária para gerenciar imagens.' });
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    sendJson(res, 500, {
      error:
        'Variável BLOB_READ_WRITE_TOKEN não configurada na Vercel. Crie um Blob Store na aba Storage do projeto.',
    });
    return;
  }

  try {
    const body = await readJsonBody(req);

    if (req.method === 'POST') {
      const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
      const folder = typeof body.folder === 'string' ? body.folder : 'site-assets';

      const match = /^data:image\/(webp|jpeg|png|avif);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
      if (!match) {
        sendJson(res, 400, { error: 'Formato de imagem não suportado.' });
        return;
      }

      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const mimeType = match[1] === 'jpeg' ? 'image/jpeg' : `image/${match[1]}`;
      const buffer = Buffer.from(match[2], 'base64');

      if (buffer.byteLength > 4 * 1024 * 1024) {
        sendJson(res, 413, { error: 'Imagem otimizada excede o limite de 4 MB.' });
        return;
      }

      const safeFolder = folder
        .split('/')
        .filter(Boolean)
        .map(sanitizeSegment)
        .join('/');

      const pathname = `palazzo/${safeFolder || 'site-assets'}/${crypto.randomUUID()}.${ext}`;
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType: mimeType,
        addRandomSuffix: false,
      });

      sendJson(res, 200, { url: blob.url, bytes: buffer.byteLength });
      return;
    }

    if (req.method === 'DELETE') {
      const url = typeof body.url === 'string' ? body.url : '';
      if (!url || !isVercelBlobUrl(url)) {
        sendJson(res, 200, { deleted: false });
        return;
      }

      await del(url);
      sendJson(res, 200, { deleted: true });
      return;
    }

    res.setHeader('Allow', 'POST, DELETE, OPTIONS');
    sendJson(res, 405, { error: `Método ${req.method} não permitido.` });
  } catch (err) {
    console.error('Vercel Blob upload error:', err);
    sendJson(res, 500, {
      error: err instanceof Error ? err.message : 'Erro interno ao processar upload de imagem.',
    });
  }
}
