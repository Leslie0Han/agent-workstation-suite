/**
 * 9Router adapter for the local "Model Gateway" view.
 * It keeps the dashboard embedded and proxies quick chat through 9Router's
 * OpenAI-compatible endpoint using the local key managed by 9Router itself.
 */

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROUTER_URL = process.env.NINE_ROUTER_URL || 'http://localhost:20128';
const TIMEOUT_MS = 8000;
const CHAT_TIMEOUT_MS = 60000;

let cachedCliToken = null;
let cachedApiKey = null;
let embeddedPreparedAt = 0;

function getCliToken() {
  if (cachedCliToken) return cachedCliToken;
  try {
    const { machineIdSync } = require('node-machine-id');
    cachedCliToken = createHash('sha256')
      .update(`${machineIdSync()}9r-cli-auth`)
      .digest('hex')
      .slice(0, 16);
    return cachedCliToken;
  } catch {
    return '';
  }
}

function parseProviders(data) {
  const raw = Array.isArray(data)
    ? data
    : (data?.connections || data?.providers || data?.data || []);
  return raw.map(provider => {
    const id = provider.id || provider.providerId || provider.name || provider.type || 'unknown';
    const name = provider.displayName || provider.name || provider.provider || id;
    const enabled = provider.enabled !== false && provider.disabled !== true && provider.status !== 'disabled';
    return {
      id,
      name,
      type: provider.type || provider.provider || provider.kind || 'api',
      enabled,
      model: provider.model || provider.defaultModel || provider.requestModel || provider.modelId || null,
      quotaUsed: provider.quotaUsed || provider.tokensUsed || provider.usage?.used || 0,
      quotaLimit: provider.quotaLimit || provider.tokensLimit || provider.usage?.limit || null,
      tier: provider.tier || provider.plan || provider.status || (enabled ? 'ready' : 'disabled'),
    };
  });
}

function extractErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload.slice(0, 400) || fallback;
  return payload.error?.message || payload.message || payload.error || fallback;
}

async function routerFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || TIMEOUT_MS);
  try {
    const token = getCliToken();
    const headers = {
      Accept: 'application/json',
      ...(token ? { 'x-9r-cli-token': token } : {}),
      ...(options.headers || {}),
    };
    const response = await fetch(`${ROUTER_URL}${path}`, { ...options, headers, signal: controller.signal });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `9Router ${path} -> ${response.status}`));
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function prepareRouterEmbedding() {
  const now = Date.now();
  if (now - embeddedPreparedAt < 30000) return { ok: true, cached: true };
  try {
    await routerFetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requireLogin: false }),
    });
    embeddedPreparedAt = now;
    return { ok: true, requireLogin: false };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function getRouterStatus() {
  const start = Date.now();
  try {
    const [providersData, embed] = await Promise.all([
      routerFetch('/api/providers').catch(() => ({})),
      prepareRouterEmbedding(),
    ]);
    const providers = parseProviders(providersData);
    return {
      online: true,
      url: ROUTER_URL,
      latency: Date.now() - start,
      providerCount: providers.length,
      embedReady: embed.ok,
      embedError: embed.ok ? null : embed.error,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      online: false,
      url: ROUTER_URL,
      latency: null,
      providerCount: 0,
      embedReady: false,
      error: error.message,
      checkedAt: new Date().toISOString(),
    };
  }
}

export async function getRouterProviders() {
  try {
    await prepareRouterEmbedding();
    const data = await routerFetch('/api/providers');
    return {
      ok: true,
      providers: parseProviders(data),
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return { ok: false, providers: [], error: error.message, generatedAt: new Date().toISOString() };
  }
}

export async function getRouterQuota() {
  try {
    const data = await routerFetch('/api/quota');
    return { ok: true, ...data, generatedAt: new Date().toISOString() };
  } catch (error) {
    return { ok: false, totalTokens: 0, todayTokens: 0, error: error.message, generatedAt: new Date().toISOString() };
  }
}

export async function getRouterCombos() {
  try {
    const data = await routerFetch('/api/combos');
    const combos = Array.isArray(data) ? data : (data?.combos || data?.data || []);
    return { ok: true, combos, generatedAt: new Date().toISOString() };
  } catch (error) {
    return { ok: false, combos: [], error: error.message, generatedAt: new Date().toISOString() };
  }
}

async function getRouterApiKey() {
  if (cachedApiKey) return cachedApiKey;
  const data = await routerFetch('/api/keys');
  const keys = Array.isArray(data) ? data : (data?.keys || data?.data || []);
  const active = keys.find(key => key.enabled !== false && key.revoked !== true) || keys[0];
  const value = active?.key || active?.token || active?.apiKey || active?.value;
  if (!value) throw new Error('模型中转站还没有可用的本地 API Key。请先在下方内置管理面板生成一个 Key。');
  cachedApiKey = value;
  return cachedApiKey;
}

async function pickModel(requestedModel) {
  if (requestedModel && requestedModel !== 'auto') return requestedModel;
  const data = await routerFetch('/v1/models');
  const models = Array.isArray(data) ? data : (data?.data || data?.models || []);
  const first = models.find(model => model?.id)?.id || models.find(model => typeof model === 'string');
  if (!first) throw new Error('模型中转站暂时没有返回可用模型。请先在内置管理面板连接模型服务商。');
  return first;
}

export async function routerChat(model, messages) {
  try {
    const providers = await getRouterProviders();
    if (!providers.providers.length) {
      return {
        ok: false,
        needsSetup: true,
        error: '还没有连接模型服务。请在下方“内置管理面板”的“服务商”里连接一个 9Router 模型服务商，然后再试快速对话。',
      };
    }

    const [apiKey, finalModel] = await Promise.all([getRouterApiKey(), pickModel(model)]);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
    try {
      const response = await fetch(`${ROUTER_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: finalModel,
          messages: messages || [],
          stream: false,
        }),
        signal: controller.signal,
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (!response.ok) {
        return {
          ok: false,
          model: finalModel,
          error: extractErrorMessage(data, `9Router chat -> ${response.status}`),
        };
      }
      return { ok: true, model: finalModel, ...data };
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
