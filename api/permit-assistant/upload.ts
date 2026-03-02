import crypto from 'crypto';

type UploadRecord = {
  imageRef: string;
  filename: string;
  contentType: string;
  expectedSize: number;
  uploadedSize?: number;
  uploadedAt?: string;
  dataUrl?: string;
  createdAt: string;
};

type UploadMap = Map<string, UploadRecord>;

function getUploadMap(): UploadMap {
  const globalStore = globalThis as typeof globalThis & { __permitAssistantUploads?: UploadMap };
  if (!globalStore.__permitAssistantUploads) {
    globalStore.__permitAssistantUploads = new Map();
  }
  return globalStore.__permitAssistantUploads;
}

function getSecret(): string {
  return process.env.UPLOAD_SIGNING_SECRET || process.env.OPENAI_API_KEY || 'permit-assistant-dev-secret';
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function buildToken(imageRef: string, expiresAt: number): string {
  const payload = `${imageRef}.${expiresAt}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function verifyToken(token: string): { imageRef: string; valid: boolean } {
  const [imageRef, expiresRaw, signature] = token.split('.');
  const expiresAt = Number(expiresRaw);
  if (!imageRef || !expiresAt || !signature) return { imageRef: '', valid: false };
  if (Date.now() > expiresAt) return { imageRef, valid: false };
  const expected = signPayload(`${imageRef}.${expiresAt}`);
  return { imageRef, valid: crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) };
}

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readBodyBuffer(req: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const uploads = getUploadMap();

  if (req.method === 'POST') {
    const files = Array.isArray(req.body?.files) ? req.body.files.slice(0, 5) : [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'Provide files[] to upload.' });
    }

    const payload = files.map((file: { filename?: string; contentType?: string; size?: number }) => {
      const imageRef = `img_${crypto.randomUUID()}`;
      const record: UploadRecord = {
        imageRef,
        filename: file.filename || 'upload.jpg',
        contentType: file.contentType || 'image/jpeg',
        expectedSize: Number(file.size || 0),
        createdAt: new Date().toISOString()
      };
      uploads.set(imageRef, record);
      const expiresAt = Date.now() + 10 * 60 * 1000;
      const token = buildToken(imageRef, expiresAt);
      return {
        imageRef,
        uploadUrl: `/api/permit-assistant/upload?token=${encodeURIComponent(token)}`,
        headers: { 'Content-Type': record.contentType }
      };
    });

    return res.status(200).json({ uploads: payload });
  }

  if (req.method === 'PUT') {
    const token = req.query?.token as string;
    if (!token) return res.status(400).json({ error: 'Missing token.' });
    const verification = verifyToken(token);
    if (!verification.valid) return res.status(401).json({ error: 'Invalid or expired token.' });

    const record = uploads.get(verification.imageRef);
    if (!record) return res.status(404).json({ error: 'Image ref not found.' });

    const buffer = await readBodyBuffer(req);
    const base64 = buffer.toString('base64');
    record.uploadedSize = buffer.length;
    record.uploadedAt = new Date().toISOString();
    record.dataUrl = `data:${record.contentType};base64,${base64}`;
    uploads.set(record.imageRef, record);

    return res.status(200).json({
      imageRef: record.imageRef,
      uploaded: true,
      metadata: {
        filename: record.filename,
        contentType: record.contentType,
        uploadedSize: record.uploadedSize
      }
    });
  }

  if (req.method === 'GET') {
    const imageRef = String(req.query?.imageRef || '');
    const record = uploads.get(imageRef);
    if (!record) return res.status(404).json({ error: 'Image ref not found.' });
    return res.status(200).json({
      imageRef: record.imageRef,
      filename: record.filename,
      contentType: record.contentType,
      uploadedAt: record.uploadedAt,
      uploadedSize: record.uploadedSize
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
