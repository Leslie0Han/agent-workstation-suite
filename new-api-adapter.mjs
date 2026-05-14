const NEW_API_URL = (process.env.NEW_API_URL || 'http://127.0.0.1:3010').replace(/\/$/, '');
const NEW_API_KEY = process.env.NEW_API_KEY || process.env.NEW_API_TOKEN || '';

function authHeaders(extra = {}) {
  return NEW_API_KEY
    ? { ...extra, Authorization: `Bearer ${NEW_API_KEY}` }
    : extra;
}

async function fetchJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.NEW_API_TIMEOUT_MS || 8000));
  try {
    const response = await fetch(`${NEW_API_URL}${path}`, {
      ...options,
      headers: authHeaders(options.headers || {}),
      signal: controller.signal,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      const message = data?.error?.message || data?.message || data?.error || `New API ${path} -> ${response.status}`;
      throw new Error(message);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getNewApiStatus() {
  const started = Date.now();
  try {
    const response = await fetch(`${NEW_API_URL}/`, { method: 'GET' });
    return {
      ok: true,
      online: response.status < 500,
      url: NEW_API_URL,
      latency: Date.now() - started,
      needsToken: !NEW_API_KEY,
    };
  } catch (error) {
    return {
      ok: false,
      online: false,
      url: NEW_API_URL,
      error: error.message,
      needsToken: !NEW_API_KEY,
    };
  }
}

export async function getNewApiModels() {
  if (!NEW_API_KEY) return { ok: false, models: [], needsToken: true, error: 'NEW_API_KEY is not configured.' };
  try {
    const data = await fetchJson('/v1/models');
    const models = Array.isArray(data.data) ? data.data : Array.isArray(data.models) ? data.models : [];
    return { ok: true, models };
  } catch (error) {
    return { ok: false, models: [], error: error.message };
  }
}

export async function newApiChat(model, messages) {
  if (!NEW_API_KEY) {
    return {
      ok: false,
      needsSetup: true,
      error: 'New API 已检测为本地网关，但工作站还没有配置 NEW_API_KEY。请先在 New API 里创建 Token，再把它写入工作站启动环境。',
    };
  }
  try {
    const data = await fetchJson('/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model && model !== 'auto' ? model : process.env.NEW_API_DEFAULT_MODEL || 'gpt-4o-mini',
        messages,
        stream: false,
      }),
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export { NEW_API_URL };
