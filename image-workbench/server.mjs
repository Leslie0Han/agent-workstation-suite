import { createServer } from 'node:http';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/generate-image') {
      await handleGenerate(req, res);
      return;
    }
    if (req.method === 'POST' && req.url === '/api/save-run') {
      await handleSaveRun(req, res);
      return;
    }
    if (req.method === 'POST' && req.url === '/api/maintenance') {
      await handleMaintenance(req, res);
      return;
    }
    if (req.method === 'POST' && req.url === '/api/save-api-profiles') {
      await handleSaveApiProfiles(req, res);
      return;
    }
    if (req.method === 'POST' && req.url === '/api/save-library') {
      await handleSaveLibrary(req, res);
      return;
    }
    if (req.method === 'GET' && req.url === '/api/load-state') {
      await handleLoadState(req, res);
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const filePath = normalize(join(root, requested));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const content = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': mime[extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(content);
  } catch (error) {
    if (req.url === '/api/generate-image') {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: error.message || 'Image API request failed' } }));
      return;
    }
    res.writeHead(error.code === 'ENOENT' ? 404 : 500);
    res.end(error.code === 'ENOENT' ? 'Not found' : error.message);
  }
}).listen(port, () => {
  console.log(`Image workbench: http://localhost:${port}`);
});

async function handleSaveRun(req, res) {
  const body = await readJson(req);
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const dataDir = join(root, 'data');
  const outputDir = join(root, 'outputs');
  await mkdir(dataDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  const savedImages = [];
  for (const [index, image] of (body.images || []).entries()) {
    const name = await uniqueOutputName(outputDir, image.name || `image-${index + 1}.png`);
    const record = { ...image };
    if (image.dataUrl?.startsWith('data:image/')) {
      const base64 = image.dataUrl.split(',')[1] || '';
      await writeFile(join(outputDir, name), Buffer.from(base64, 'base64'));
      record.name = name;
      record.savedPath = `outputs/${name}`;
      delete record.dataUrl;
    }
    savedImages.push(record);
  }

  const run = {
    id: stamp,
    createdAt: now.toISOString(),
    config: body.config || {},
    images: savedImages,
  };
  await writeFile(join(dataDir, `run-${stamp}.json`), JSON.stringify(run, null, 2), 'utf8');
  await appendLibrary(savedImages);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, id: stamp, imageCount: savedImages.length, images: savedImages }));
}

async function handleSaveApiProfiles(req, res) {
  const body = await readJson(req);
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(join(root, 'data', 'api-profiles.json'), JSON.stringify(body, null, 2), 'utf8');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
}

async function handleSaveLibrary(req, res) {
  const body = await readJson(req);
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(join(root, 'data', 'library.json'), JSON.stringify(body, null, 2), 'utf8');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
}

async function handleLoadState(req, res) {
  const [profiles, library] = await Promise.all([
    readJsonFile(join(root, 'data', 'api-profiles.json'), null),
    readJsonFile(join(root, 'data', 'library.json'), null),
  ]);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ profiles, library }));
}

async function readJsonFile(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

async function appendLibrary(images) {
  const path = join(root, 'data', 'library.json');
  const library = await readJsonFile(path, { images: [] });
  const existing = Array.isArray(library.images) ? library.images : [];
  library.images = [...existing, ...images];
  await writeFile(path, JSON.stringify(library, null, 2), 'utf8');
}

function safeFileName(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '_').slice(0, 120) || 'image.png';
}

async function uniqueOutputName(outputDir, name) {
  const safe = safeFileName(name);
  const dot = safe.lastIndexOf('.');
  const base = dot > 0 ? safe.slice(0, dot) : safe;
  const ext = dot > 0 ? safe.slice(dot) : '.png';
  let candidate = `${base}${ext}`;
  let index = 2;
  while (await fileExists(join(outputDir, candidate))) {
    candidate = `${base}-${index}${ext}`;
    index += 1;
  }
  return candidate;
}

async function fileExists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

async function handleMaintenance(req, res) {
  const body = await readJson(req);
  const action = body.action;
  let message = '';
  if (action === 'open-app-dir') {
    openFolder(root);
    message = '已打开程序目录。';
  } else if (action === 'open-data-dir') {
    const dir = join(root, 'data');
    await mkdir(dir, { recursive: true });
    openFolder(dir);
    message = '已打开数据目录。';
  } else if (action === 'open-outputs-dir') {
    const dir = join(root, 'outputs');
    await mkdir(dir, { recursive: true });
    openFolder(dir);
    message = '已打开输出目录。';
  } else if (action === 'backup-data') {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupRoot = join(root, 'backups', `backup-${stamp}`);
    await mkdir(backupRoot, { recursive: true });
    await copyIfExists(join(root, 'data'), join(backupRoot, 'data'));
    await copyIfExists(join(root, 'outputs'), join(backupRoot, 'outputs'));
    openFolder(backupRoot);
    message = `已备份到 backups/backup-${stamp}`;
  } else {
    throw new Error(`未知维护操作：${action}`);
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, message }));
}

async function copyIfExists(from, to) {
  try {
    await cp(from, to, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function openFolder(path) {
  spawn('explorer.exe', [path], { detached: true, stdio: 'ignore' }).unref();
}

async function handleGenerate(req, res) {
  const body = await readJson(req);
  const apiKey = body.apiKey || process.env.OPENAI_API_KEY;
  let apiEndpoint = body.apiEndpoint || process.env.IMAGE_API_ENDPOINT || 'https://api.openai.com/v1/images/generations';
  const model = body.model || 'gpt-image-2';

  if (!apiKey) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API key is not set' }));
    return;
  }

  const count = Math.max(1, Math.min(12, Number(body.count) || 1));
  const references = normalizeReferences(body.references);
  const usesImageEdit = references.length > 0 && body.apiFormat !== 'chat';
  const requestBody = usesImageEdit
    ? buildImageEditForm(body, model, count, references)
    : buildRequestBody(body, model, count, references);
  const size = imageSize(body.aspect);
  if (size && body.apiFormat !== 'chat') {
    if (usesImageEdit) requestBody.append('size', size);
    else requestBody.size = size;
  }
  if (usesImageEdit) apiEndpoint = imageEditEndpoint(apiEndpoint);

  assertHttpUrl(apiEndpoint, '请求地址');

  const headers = { Authorization: `Bearer ${apiKey}` };
  if (!usesImageEdit) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: usesImageEdit ? requestBody : JSON.stringify(requestBody),
    });
  } catch (error) {
    throw new Error(`请求地址连接失败：${formatFetchError(error)}；地址：${apiEndpoint}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.startsWith('image/')) {
    const buffer = Buffer.from(await response.arrayBuffer());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ images: [{ imageBase64: buffer.toString('base64') }] }));
    return;
  }

  const rawText = await response.text();
  if (contentType.includes('text/html')) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: {
        message: `请求地址返回的是网页 HTML，不是图片生成 API 响应。请填写完整 API 端点，例如 ${apiEndpoint.replace(/\/$/, '')}/v1/images/generations`,
      },
    }));
    return;
  }
  const payload = parseJson(rawText);
  if (!response.ok) {
    res.writeHead(response.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload || { error: { message: rawText || `HTTP ${response.status}` } }));
    return;
  }

  const extractedImages = extractImages(payload ?? rawText);
  for (const image of extractedImages) {
    if (!image.imageBase64 && image.imageUrl) {
      try {
        image.imageBase64 = await fetchImageAsBase64(image.imageUrl, apiKey);
      } catch (error) {
        image.proxyWarning = error.message;
      }
    }
  }
  const hasImages = extractedImages.some(image => image.imageBase64 || image.imageUrl);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    images: extractedImages,
    imageBase64: extractedImages[0]?.imageBase64,
    imageUrl: extractedImages[0]?.imageUrl,
    revisedPrompt: extractedImages[0]?.revisedPrompt,
    proxyWarning: extractedImages[0]?.proxyWarning,
    rawShape: hasImages ? undefined : summarizePayload(payload ?? rawText),
  }));
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}

function extractImage(payload) {
  if (typeof payload === 'string') return extractImageFromText(payload);
  if (!payload || typeof payload !== 'object') return {};
  const candidates = [
    payload.data?.[0],
    payload.data,
    payload.images?.[0],
    payload.images,
    payload.image,
    payload.result,
    payload.output,
    payload,
  ].filter(Boolean);

  for (const item of candidates) {
    if (typeof item === 'string') {
      const extracted = extractImageFromText(item);
      if (extracted.imageBase64 || extracted.imageUrl) return extracted;
      continue;
    }
    const imageBase64 = item.b64_json || item.base64 || item.image_base64 || item.imageBase64 || item.image || item.data;
    const imageUrl = item.url || item.image_url || item.imageUrl || item.uri;
    if (imageBase64 || imageUrl) {
      return normalizeExtractedImage({ imageBase64, imageUrl, revisedPrompt: item.revised_prompt || item.revisedPrompt });
    }
  }

  for (const output of payload.output || []) {
    if (typeof output === 'string') {
      const extracted = extractImageFromText(output);
      if (extracted.imageBase64 || extracted.imageUrl) return extracted;
      continue;
    }
    for (const content of output.content || []) {
      if (typeof content === 'string') {
        const extracted = extractImageFromText(content);
        if (extracted.imageBase64 || extracted.imageUrl) return extracted;
        continue;
      }
      const imageBase64 = content.image_base64 || content.imageBase64 || content.b64_json || content.base64;
      const imageUrl = content.image_url || content.imageUrl || content.url || content.uri;
      if (imageBase64 || imageUrl) return normalizeExtractedImage({ imageBase64, imageUrl });
    }
  }

  const text = payload.choices?.[0]?.message?.content || payload.content || payload.text || payload.message;
  if (typeof text === 'string') {
    const extracted = extractImageFromText(text);
    if (extracted.imageBase64 || extracted.imageUrl) return extracted;
  }

  return {};
}

function extractImages(payload) {
  if (typeof payload === 'string') {
    const single = extractImageFromText(payload);
    return single.imageBase64 || single.imageUrl ? [single] : [];
  }
  if (!payload || typeof payload !== 'object') return [];
  const sources = [];
  if (Array.isArray(payload.data)) sources.push(...payload.data);
  if (Array.isArray(payload.images)) sources.push(...payload.images);
  if (Array.isArray(payload.output)) sources.push(...payload.output);
  const extracted = sources
    .map(item => extractImage(item))
    .filter(item => item.imageBase64 || item.imageUrl);
  if (extracted.length) return dedupeImages(extracted);
  const single = extractImage(payload);
  return single.imageBase64 || single.imageUrl ? [single] : [];
}

function dedupeImages(images) {
  const seen = new Set();
  return images.filter(image => {
    const key = image.imageBase64 || image.imageUrl;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeExtractedImage({ imageBase64, imageUrl, revisedPrompt }) {
  if (typeof imageBase64 === 'string') {
    const dataUrl = /^data:image\/[^;]+;base64,/.exec(imageBase64);
    if (dataUrl) imageBase64 = imageBase64.slice(dataUrl[0].length);
    if (/^https?:\/\//i.test(imageBase64)) {
      imageUrl = imageBase64;
      imageBase64 = undefined;
    }
  }
  if (typeof imageUrl === 'string') {
    imageUrl = imageUrl.replace(/[)"'\]\s]+$/g, '');
  }
  return { imageBase64, imageUrl, revisedPrompt };
}

function extractImageFromText(text) {
  const parsed = parseJson(text);
  if (parsed && parsed !== text) {
    const extracted = extractImage(parsed);
    if (extracted.imageBase64 || extracted.imageUrl) return extracted;
  }
  const dataUrl = /(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/.exec(text)?.[1];
  if (dataUrl) return normalizeExtractedImage({ imageBase64: dataUrl });
  const markdownUrl = /!\[[^\]]*]\((https?:\/\/[^)]+)\)/.exec(text)?.[1];
  const htmlUrl = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i.exec(text)?.[1];
  const plainUrl = /(https?:\/\/[^\s"'<>),\]]+)/i.exec(text)?.[1];
  if (markdownUrl || htmlUrl || plainUrl) return normalizeExtractedImage({ imageUrl: markdownUrl || htmlUrl || plainUrl });
  const base64 = /(?:b64_json|base64|image_base64|imageBase64)["']?\s*[:=]\s*["']([A-Za-z0-9+/=]{120,})["']/i.exec(text)?.[1];
  if (base64) return { imageBase64: base64 };
  return {};
}

async function fetchImageAsBase64(url, apiKey) {
  assertHttpUrl(url, '图片地址');
  let response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } catch (error) {
    throw new Error(`图片地址拉取失败：${formatFetchError(error)}；地址：${url}`);
  }
  if (!response.ok) throw new Error(`图片 URL 拉取失败：HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.toString('base64');
}

function assertHttpUrl(url, label) {
  if (!/^https?:\/\//i.test(url || '')) {
    throw new Error(`${label}必须以 http:// 或 https:// 开头，当前是：${url || '(空)'}`);
  }
}

function formatFetchError(error) {
  const parts = [
    error?.message,
    error?.cause?.code,
    error?.cause?.message,
    error?.cause?.errno,
    error?.cause?.syscall,
  ].filter(Boolean);
  return parts.join(' | ') || 'fetch failed';
}

function summarizePayload(payload) {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return (text || '').slice(0, 3000);
}

function buildPrompt(body) {
  const prompt = body.prompt || 'Generate a high quality image.';
  const variant = Number(body.variantIndex || 0);
  const hasReferences = Array.isArray(body.references) && body.references.length > 0;
  const variantInstruction = hasReferences
    ? 'If multiple variants are requested, make only small controlled changes while preserving the reference image.'
    : 'Create a visually distinct variation while preserving the user\'s intent.';
  const nonce = body.apiKey ? `\nRequest nonce: ${Date.now()}-${Math.random().toString(36).slice(2, 8)}. Variant index: ${variant}. ${variantInstruction} Do not render this metadata as text.` : '';
  const references = Array.isArray(body.references) && body.references.length
    ? `\nUse the uploaded reference image${body.references.length > 1 ? 's' : ''} as visual input, not just inspiration. Preserve the user's intended subject, identity, composition cues, colors, and important visual details unless the prompt asks to change them. Reference files: ${body.references.map(item => item.name || item.fileName).join(', ')}.`
    : '';
  return `${prompt}${references}${nonce}`;
}

function buildRequestBody(body, model, count, references = []) {
  const prompt = buildPrompt(body);
  if (body.apiFormat === 'chat') {
    const content = [
      { type: 'text', text: prompt },
      ...references.map(reference => ({
        type: 'image_url',
        image_url: { url: reference.dataUrl },
      })),
    ];
    return {
      model,
      messages: [
        {
          role: 'user',
          content: references.length ? content : prompt,
        },
      ],
      n: count,
    };
  }
  return {
    model,
    prompt,
    n: count,
    seed: Math.floor(Math.random() * 2147483647),
  };
}

function buildImageEditForm(body, model, count, references) {
  const form = new FormData();
  form.append('model', model);
  form.append('prompt', buildPrompt(body));
  form.append('n', String(count));
  references.slice(0, 16).forEach((reference) => {
    form.append('image', new Blob([reference.buffer], { type: reference.mime }), reference.fileName);
  });
  return form;
}

function imageEditEndpoint(endpoint) {
  if (/\/images\/generations\/?$/i.test(endpoint)) return endpoint.replace(/\/images\/generations\/?$/i, '/images/edits');
  return endpoint;
}

function normalizeReferences(references) {
  if (!Array.isArray(references)) return [];
  return references
    .map((reference, index) => {
      const dataUrl = String(reference?.dataUrl || '');
      const match = /^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
      if (!match) return null;
      const mime = match[1].toLowerCase().replace('image/jpg', 'image/jpeg');
      const ext = mime.includes('jpeg') ? 'jpg' : mime.split('/')[1];
      return {
        dataUrl,
        mime,
        buffer: Buffer.from(match[2], 'base64'),
        fileName: safeFileName(reference.fileName || reference.name || `reference-${index + 1}.${ext}`),
      };
    })
    .filter(Boolean);
}

function imageSize(aspect) {
  if (aspect === 'auto') return null;
  if (aspect === '21:9') return '1536x640';
  if (aspect === '3:2') return '1536x1024';
  if (aspect === '2:3') return '1024x1536';
  if (aspect === '16:9' || aspect === '4:3') return '1536x1024';
  if (aspect === '9:16' || aspect === '3:4') return '1024x1536';
  return '1024x1024';
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}
