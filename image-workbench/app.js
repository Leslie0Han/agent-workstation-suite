const state = {
  uploads: [],
  images: [],
  selectedIds: new Set(),
  clipboard: { mode: null, items: [] },
  editingId: null,
  sequence: 1,
  apiProfiles: [],
  activeApiId: '',
  previewItems: [],
  previewIndex: 0,
};

const els = {
  form: document.getElementById('configForm'),
  maintenance: document.getElementById('maintenanceBtn'),
  maintenanceDialog: document.getElementById('maintenanceDialog'),
  closeMaintenance: document.getElementById('closeMaintenanceBtn'),
  openAppDir: document.getElementById('openAppDirBtn'),
  openDataDir: document.getElementById('openDataDirBtn'),
  openOutputsDir: document.getElementById('openOutputsDirBtn'),
  backupData: document.getElementById('backupDataBtn'),
  openSettings: document.getElementById('openSettingsBtn'),
  activeApiLabel: document.getElementById('activeApiLabel'),
  settingsDialog: document.getElementById('settingsDialog'),
  closeSettings: document.getElementById('closeSettingsBtn'),
  profileList: document.getElementById('profileList'),
  newProfile: document.getElementById('newProfileBtn'),
  deleteProfile: document.getElementById('deleteProfileBtn'),
  applyProfile: document.getElementById('applyProfileBtn'),
  apiName: document.getElementById('apiNameInput'),
  apiCategory: document.getElementById('apiCategorySelect'),
  apiProvider: document.getElementById('apiProviderSelect'),
  apiKey: document.getElementById('apiKeyInput'),
  apiModel: document.getElementById('apiModelInput'),
  apiEndpoint: document.getElementById('apiEndpointInput'),
  apiFormat: document.getElementById('apiFormatSelect'),
  saveApi: document.getElementById('saveApiBtn'),
  aspect: document.getElementById('aspectSelect'),
  resolution: document.getElementById('resolutionSelect'),
  count: document.getElementById('countInput'),
  prompt: document.getElementById('promptInput'),
  optimizePrompt: document.getElementById('optimizePromptInput'),
  optimizeBtn: document.getElementById('optimizeBtn'),
  uploadZone: document.getElementById('uploadZone'),
  imageInput: document.getElementById('imageInput'),
  uploadList: document.getElementById('uploadList'),
  clearUploads: document.getElementById('clearUploadsBtn'),
  status: document.getElementById('statusPill'),
  canvas: document.getElementById('galleryCanvas'),
  grid: document.getElementById('thumbGrid'),
  empty: document.getElementById('emptyState'),
  generationOverlay: document.getElementById('generationOverlay'),
  generationTitle: document.getElementById('generationTitle'),
  generationText: document.getElementById('generationText'),
  selectionBox: document.getElementById('selectionBox'),
  contextMenu: document.getElementById('contextMenu'),
  galleryMeta: document.getElementById('galleryMeta'),
  previewDialog: document.getElementById('previewDialog'),
  previewImage: document.getElementById('previewImage'),
  previewName: document.getElementById('previewName'),
  previewDetails: document.getElementById('previewDetails'),
  previewPrev: document.getElementById('previewPrevBtn'),
  previewNext: document.getElementById('previewNextBtn'),
  closePreview: document.getElementById('closePreviewBtn'),
  stackDialog: document.getElementById('stackDialog'),
  stackTitle: document.getElementById('stackTitle'),
  stackMeta: document.getElementById('stackMeta'),
  stackGrid: document.getElementById('stackGrid'),
  closeStack: document.getElementById('closeStackBtn'),
  editDialog: document.getElementById('editDialog'),
  editForm: document.getElementById('editForm'),
  editName: document.getElementById('editNameInput'),
  editPrompt: document.getElementById('editPromptInput'),
  cancelEdit: document.getElementById('cancelEditBtn'),
  paste: document.getElementById('pasteBtn'),
  zipSelected: document.getElementById('zipSelectedBtn'),
  downloadSelected: document.getElementById('downloadSelectedBtn'),
};

function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function setStatus(text) {
  els.status.textContent = text;
}

function showGenerationOverlay(text = '正在连接模型接口，请稍候。') {
  els.generationText.textContent = text;
  els.generationOverlay.classList.add('show');
  els.generationOverlay.setAttribute('aria-hidden', 'false');
}

function hideGenerationOverlay() {
  els.generationOverlay.classList.remove('show');
  els.generationOverlay.setAttribute('aria-hidden', 'true');
}

function getConfig() {
  saveEditorToActiveProfile();
  return {
    apiKey: els.apiKey.value.trim(),
    apiModel: els.apiModel.value.trim() || 'gpt-image-2',
    apiEndpoint: els.apiEndpoint.value.trim() || 'https://api.openai.com/v1/images/generations',
    apiFormat: els.apiFormat.value,
    aspect: els.aspect.value,
    resolution: Number(els.resolution.value),
    count: Math.max(1, Math.min(12, Number(els.count.value) || 1)),
    prompt: els.prompt.value.trim(),
    optimize: els.optimizePrompt.checked,
  };
}

function defaultApiProfiles() {
  return [
    {
      id: 'gpt-official',
      name: 'GPT 官方',
      category: 'gpt',
      provider: 'official',
      apiKey: '',
      apiModel: 'gpt-image-2',
      apiEndpoint: 'https://api.openai.com/v1/images/generations',
      apiFormat: 'images',
    },
    {
      id: 'gpt-third-party',
      name: 'GPT 第三方',
      category: 'gpt',
      provider: 'third-party',
      apiKey: '',
      apiModel: 'gpt-image-2',
      apiEndpoint: 'https://ai.t8star.cn/v1/images/generations',
      apiFormat: 'images',
    },
    {
      id: 'gemini-official',
      name: 'Gemini 官方',
      category: 'gemini',
      provider: 'official',
      apiKey: '',
      apiModel: 'gemini-2.5-flash-image-preview',
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/images/generations',
      apiFormat: 'images',
    },
    {
      id: 'gemini-third-party',
      name: 'Gemini 第三方',
      category: 'gemini',
      provider: 'third-party',
      apiKey: '',
      apiModel: 'gemini-2.5-flash-image-preview',
      apiEndpoint: '',
      apiFormat: 'images',
    },
  ];
}

function saveApiConfig() {
  saveEditorToActiveProfile();
  persistApiProfiles();
  renderProfileList();
  updateActiveApiLabel();
  setStatus('已保存');
}

async function loadApiConfig() {
  const serverState = await loadServerState();
  try {
    const saved = serverState?.profiles || JSON.parse(localStorage.getItem('imageLabApiProfiles') || 'null');
    if (saved?.profiles?.length) {
      state.apiProfiles = saved.profiles;
      state.activeApiId = saved.activeApiId || saved.profiles[0].id;
    } else {
      state.apiProfiles = defaultApiProfiles();
      const legacy = JSON.parse(localStorage.getItem('imageLabApiConfig') || '{}');
      if (legacy.apiEndpoint || legacy.apiModel || legacy.apiKey) {
        Object.assign(state.apiProfiles[1], {
          apiKey: legacy.apiKey || '',
          apiModel: legacy.apiModel || state.apiProfiles[1].apiModel,
          apiEndpoint: legacy.apiEndpoint || state.apiProfiles[1].apiEndpoint,
          apiFormat: legacy.apiFormat || state.apiProfiles[1].apiFormat,
        });
        state.activeApiId = state.apiProfiles[1].id;
      } else {
        state.activeApiId = state.apiProfiles[0].id;
      }
    }
  } catch {
    state.apiProfiles = defaultApiProfiles();
    state.activeApiId = state.apiProfiles[0].id;
  }
  applyProfileToEditor(activeProfile());
  renderProfileList();
  updateActiveApiLabel();
}

function persistApiProfiles() {
  const payload = {
    activeApiId: state.activeApiId,
    profiles: state.apiProfiles,
  };
  localStorage.setItem('imageLabApiProfiles', JSON.stringify(payload));
  saveJsonToServer('/api/save-api-profiles', payload);
}

function activeProfile() {
  return state.apiProfiles.find(profile => profile.id === state.activeApiId) || state.apiProfiles[0];
}

function applyProfileToEditor(profile) {
  if (!profile) return;
  els.apiName.value = profile.name || '';
  els.apiCategory.value = profile.category || 'gpt';
  els.apiProvider.value = profile.provider || 'official';
  els.apiKey.value = profile.apiKey || '';
  els.apiModel.value = profile.apiModel || '';
  els.apiEndpoint.value = profile.apiEndpoint || '';
  els.apiFormat.value = profile.apiFormat || 'images';
}

function saveEditorToActiveProfile() {
  const profile = activeProfile();
  if (!profile) return;
  Object.assign(profile, {
    name: els.apiName.value.trim() || profile.name || '未命名接口',
    category: els.apiCategory.value,
    provider: els.apiProvider.value,
    apiKey: els.apiKey.value.trim(),
    apiModel: els.apiModel.value.trim(),
    apiEndpoint: els.apiEndpoint.value.trim(),
    apiFormat: els.apiFormat.value,
  });
}

function renderProfileList() {
  els.profileList.innerHTML = '';
  state.apiProfiles.forEach((profile) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `profile-item${profile.id === state.activeApiId ? ' active' : ''}`;
    button.dataset.id = profile.id;
    button.innerHTML = `
      <strong>${profile.name}</strong>
      <span>${profile.category.toUpperCase()} · ${profile.provider === 'official' ? '官方' : '第三方'} · ${profile.apiModel || '未设置模型'}</span>
    `;
    els.profileList.appendChild(button);
  });
}

function updateActiveApiLabel() {
  const profile = activeProfile();
  if (!profile) {
    els.activeApiLabel.textContent = '未选择接口';
    return;
  }
  els.activeApiLabel.textContent = `${profile.name} · ${profile.apiModel || '未设置模型'}`;
}

function createProfile() {
  saveEditorToActiveProfile();
  const profile = {
    ...activeProfile(),
    id: uid('api'),
    name: '新接口配置',
    apiKey: '',
  };
  state.apiProfiles.push(profile);
  state.activeApiId = profile.id;
  applyProfileToEditor(profile);
  persistApiProfiles();
  renderProfileList();
  updateActiveApiLabel();
}

function deleteActiveProfile() {
  if (state.apiProfiles.length <= 1) {
    alert('至少保留一个接口配置。');
    return;
  }
  state.apiProfiles = state.apiProfiles.filter(profile => profile.id !== state.activeApiId);
  state.activeApiId = state.apiProfiles[0].id;
  applyProfileToEditor(activeProfile());
  persistApiProfiles();
  renderProfileList();
  updateActiveApiLabel();
}

function optimizePromptText(text) {
  const base = text || '高质量商业视觉图像';
  const suffix = '主体清晰，构图稳定，细节丰富，真实光影，高级质感，避免文字乱码、畸形结构和低清噪点。';
  if (base.includes('主体清晰') || base.includes('构图稳定')) return base;
  return `${base}。${suffix}`;
}

function dataUrlToBlob(dataUrl) {
  const [meta, body] = dataUrl.split(',');
  const mime = /data:(.*?);base64/.exec(meta)?.[1] || 'image/png';
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function aspectSize(aspect, base) {
  if (aspect === 'auto') return { width: base, height: base };
  const [w, h] = aspect.split(':').map(Number);
  if (w >= h) return { width: base, height: Math.round(base * h / w) };
  return { width: Math.round(base * w / h), height: base };
}

function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function colorFromHash(seed, offset) {
  const h = (seed + offset * 67) % 360;
  return `hsl(${h} 58% ${36 + (offset % 4) * 9}%)`;
}

async function createLocalGeneratedImage(config, index) {
  const { width, height } = aspectSize(config.aspect, Math.min(config.resolution, 1600));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const seed = hashString(`${config.prompt}-${config.apiModel}-${index}-${Date.now()}`);

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, colorFromHash(seed, 0));
  grad.addColorStop(.45, colorFromHash(seed, 2));
  grad.addColorStop(1, colorFromHash(seed, 5));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 24; i += 1) {
    const x = ((seed >> (i % 13)) % width + i * 91) % width;
    const y = ((seed >> (i % 11)) % height + i * 57) % height;
    const r = Math.max(width, height) * (.055 + (i % 5) * .017);
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${0.025 + (i % 4) * .018})`;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const dataUrl = canvas.toDataURL('image/png');
  return imageRecord({
    url: dataUrl,
    blob: dataUrlToBlob(dataUrl),
    prompt: config.filePrompt || config.prompt,
    model: config.apiModel,
    aspect: config.aspect,
    resolution: `${config.resolution / 1024}K`,
  });
}

function imageRecord({ url, blob, prompt, model, aspect, resolution }) {
  return {
    id: uid('img'),
    name: uniqueImageName(prompt),
    url,
    blob,
    prompt,
    model,
    aspect,
    resolution,
    createdAt: new Date(),
  };
}

function uniqueImageName(prompt) {
  const base = promptFileBase(prompt) || `生成图${state.sequence}`;
  const existing = new Set(state.images.flatMap(item => item.stackItems ? item.stackItems.map(child => child.name) : [item.name]));
  let candidate = ensurePng(base);
  let suffix = 2;
  while (existing.has(candidate)) {
    candidate = ensurePng(`${base}-${suffix}`);
    suffix += 1;
  }
  state.sequence += 1;
  return candidate;
}

function promptFileBase(prompt) {
  return (prompt || '')
    .split(/[。.!！?？]/)[0]
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 28);
}

async function callImageApi(config, index) {
  if (location.protocol.startsWith('http') && config.apiKey) {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          apiEndpoint: config.apiEndpoint,
          apiFormat: config.apiFormat,
          model: config.apiModel,
          prompt: config.prompt,
          aspect: config.aspect,
          resolution: config.resolution,
          index,
          references: state.uploads.map((item, refIndex) => ({
            name: `图片${refIndex + 1}`,
            fileName: item.file.name,
            dataUrl: item.url,
          })),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(apiErrorMessage(payload, `HTTP ${response.status}`));
      }
      if (response.ok) {
        if (payload.imageBase64 || payload.imageUrl) {
          const url = payload.imageBase64 ? `data:image/png;base64,${payload.imageBase64}` : payload.imageUrl;
          const blob = payload.imageBase64 ? dataUrlToBlob(url) : null;
          return imageRecord({
            url,
            blob,
            prompt: config.filePrompt || payload.revisedPrompt || config.prompt,
            model: config.apiModel,
            aspect: config.aspect,
            resolution: `${config.resolution / 1024}K`,
          });
        }
      }
      throw new Error(apiErrorMessage(payload, '接口没有返回图片数据'));
    } catch (error) {
      throw new Error(`真实 API 请求失败：${error.message}`);
    }
  }
  return createLocalGeneratedImage(config, index);
}

async function callImageBatch(config) {
  if (!location.protocol.startsWith('http') || !config.apiKey) {
    const created = [];
    for (let i = 0; i < config.count; i += 1) created.push(await createLocalGeneratedImage(config, i));
    return created;
  }

  const created = [];
  const firstBatch = await requestImageBatch(config, config.count, 0);
  created.push(...firstBatch);

  let attempts = 1;
  while (created.length < config.count && attempts < config.count + 3) {
    const extra = await requestImageBatch(config, 1, attempts);
    created.push(...extra);
    attempts += 1;
  }

  return created.slice(0, config.count);
}

async function requestImageBatch(config, count, variantIndex) {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: config.apiKey,
      apiEndpoint: config.apiEndpoint,
      apiFormat: config.apiFormat,
      model: config.apiModel,
      prompt: config.prompt,
      aspect: config.aspect,
      resolution: config.resolution,
      count,
      variantIndex,
      references: state.uploads.map((item, refIndex) => ({
        name: `图片${refIndex + 1}`,
        fileName: item.file.name,
        dataUrl: item.url,
      })),
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(apiErrorMessage(payload, `HTTP ${response.status}`));
  const images = payload.images || (payload.imageBase64 || payload.imageUrl ? [payload] : []);
  if (!images.length) throw new Error(apiErrorMessage(payload, '接口没有返回图片数据'));
  return images.map((image) => {
    const url = image.imageBase64 ? `data:image/png;base64,${image.imageBase64}` : image.imageUrl;
    const blob = image.imageBase64 ? dataUrlToBlob(url) : null;
    return imageRecord({
      url,
      blob,
      prompt: config.filePrompt || image.revisedPrompt || config.prompt,
      model: config.apiModel,
      aspect: config.aspect,
      resolution: `${config.resolution / 1024}K`,
    });
  });
}

function apiErrorMessage(payload, fallback) {
  if (payload?.error?.message) return payload.error.message;
  if (payload?.error && typeof payload.error === 'string') return payload.error;
  if (payload?.message) return payload.message;
  if (payload?.rawShape) return `接口已返回成功，但没有识别到图片字段。响应摘要：${payload.rawShape}`;
  return fallback;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = text.split('');
  let line = '';
  let lines = 0;
  for (let i = 0; i < chars.length; i += 1) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      line = chars[i];
      lines += 1;
      if (lines >= maxLines) return;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y + lines * lineHeight);
}

function renderUploads() {
  els.uploadList.innerHTML = '';
  state.uploads.forEach((item, index) => {
    const node = document.createElement('div');
    node.className = 'upload-item';
    const image = document.createElement('img');
    image.src = item.url;
    image.alt = `图片${index + 1}`;

    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `图片${index + 1}`;
    const name = document.createElement('span');
    name.textContent = item.file.name;
    copy.append(title, name);

    const remove = document.createElement('button');
    remove.className = 'upload-remove';
    remove.type = 'button';
    remove.title = `删除图片${index + 1}`;
    remove.setAttribute('aria-label', `删除图片${index + 1}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      state.uploads.splice(index, 1);
      renderUploads();
    });

    node.append(image, copy, remove);
    els.uploadList.appendChild(node);
  });
}

function renderGallery() {
  els.grid.innerHTML = '';
  els.empty.style.display = state.images.length ? 'none' : 'grid';
  els.galleryMeta.textContent = `${state.images.length} 张图片，已选 ${state.selectedIds.size} 张`;
  state.images.forEach((item) => {
    const card = document.createElement('article');
    card.className = `thumb-card${item.stackItems ? ' stack-card' : ''}${state.selectedIds.has(item.id) ? ' selected' : ''}${item.cut ? ' cut' : ''}`;
    card.dataset.id = item.id;
    if (item.stackItems) card.dataset.stack = 'true';
    card.innerHTML = `
      <img src="${item.url}" alt="${item.name}">
      ${item.stackItems ? `<span class="stack-badge">${item.stackItems.length}张</span>` : ''}
      <div class="thumb-info">
        <strong title="${item.name}">${item.name}</strong>
        <span>${item.stackItems ? '叠放图组' : item.model} · ${item.aspect} · ${item.resolution}</span>
      </div>
    `;
    els.grid.appendChild(card);
  });
}

async function loadServerState() {
  if (!location.protocol.startsWith('http')) return null;
  try {
    const response = await fetch('/api/load-state');
    if (!response.ok) return null;
    const statePayload = await response.json();
    if (statePayload?.library?.images?.length) {
      state.images = statePayload.library.images.map(restoreLibraryItem);
    }
    return statePayload;
  } catch {
    return null;
  }
}

function restoreLibraryItem(item) {
  const restored = {
    ...item,
    url: item.savedPath ? encodeURI(item.savedPath.replace(/\\/g, '/')) : item.url,
    blob: null,
    cut: false,
  };
  if (item.stackItems) restored.stackItems = item.stackItems.map(restoreLibraryItem);
  if (restored.stackItems?.length && !restored.url) restored.url = restored.stackItems[0].url;
  return restored;
}

function saveLibrary() {
  saveJsonToServer('/api/save-library', { images: state.images.map(serializeLibraryItem) });
}

function serializeLibraryItem(item) {
  return {
    id: item.id,
    name: item.name,
    prompt: item.prompt,
    model: item.model,
    aspect: item.aspect,
    resolution: item.resolution,
    url: item.url?.startsWith('data:image/') ? undefined : item.url,
    savedPath: item.savedPath,
    stackItems: item.stackItems ? item.stackItems.map(serializeLibraryItem) : undefined,
  };
}

async function saveJsonToServer(url, payload) {
  if (!location.protocol.startsWith('http')) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn('Failed to save local state.', error);
  }
}

async function handleFiles(files) {
  const imageFiles = [...files].filter(file => file.type.startsWith('image/'));
  const loaded = await Promise.all(imageFiles.map(file => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ id: uid('upload'), file, url: reader.result });
    reader.readAsDataURL(file);
  })));
  state.uploads.push(...loaded);
  renderUploads();
}

function selectedImages() {
  return state.images.filter(item => state.selectedIds.has(item.id));
}

function ensureSelection(id) {
  if (!state.selectedIds.has(id)) {
    state.selectedIds.clear();
    state.selectedIds.add(id);
    renderGallery();
  }
}

function openContextMenu(x, y) {
  updateContextMenu();
  els.contextMenu.style.display = 'block';
  const rect = els.contextMenu.getBoundingClientRect();
  els.contextMenu.style.left = `${Math.min(x, window.innerWidth - rect.width - 8)}px`;
  els.contextMenu.style.top = `${Math.min(y, window.innerHeight - rect.height - 8)}px`;
}

function updateContextMenu() {
  const items = selectedImages();
  const hasStack = items.some(item => item.stackItems);
  const canStack = items.length > 1 && !hasStack;
  setMenuActionVisible('stack', canStack);
  setMenuActionVisible('unstack', items.length === 1 && hasStack);
  setMenuActionVisible('regenerate', !hasStack);
}

function setMenuActionVisible(action, visible) {
  const button = els.contextMenu.querySelector(`[data-action="${action}"]`);
  if (button) button.style.display = visible ? '' : 'none';
}

function closeContextMenu() {
  els.contextMenu.style.display = 'none';
}

function previewImage(item = selectedImages()[0], items = null, index = 0) {
  if (!item) return;
  if (item.stackItems) {
    openStackDetail(item);
    return;
  }
  state.previewItems = items || [item];
  state.previewIndex = index;
  renderPreview();
  els.previewDialog.showModal();
}

function renderPreview() {
  const item = state.previewItems[state.previewIndex];
  if (!item) return;
  els.previewImage.src = item.url;
  els.previewName.textContent = item.name;
  els.previewDetails.textContent = `${item.model} · ${item.aspect} · ${item.resolution}`;
  const canPage = state.previewItems.length > 1;
  els.previewPrev.style.display = canPage ? '' : 'none';
  els.previewNext.style.display = canPage ? '' : 'none';
}

function pagePreview(delta) {
  if (!state.previewItems.length) return;
  state.previewIndex = (state.previewIndex + delta + state.previewItems.length) % state.previewItems.length;
  renderPreview();
}

function openStackDetail(stack) {
  if (!stack?.stackItems?.length) return;
  els.stackTitle.textContent = stack.name;
  els.stackMeta.textContent = `${stack.stackItems.length} 张叠放图片 · 点击缩略图后可翻页查看`;
  els.stackGrid.innerHTML = '';
  stack.stackItems.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stack-item';
    button.dataset.index = String(index);
    button.innerHTML = `
      <img src="${item.url}" alt="${item.name}">
      <span>${item.name}</span>
    `;
    els.stackGrid.appendChild(button);
  });
  els.stackDialog.showModal();
}

function openEdit(item = selectedImages()[0]) {
  if (!item) return;
  state.editingId = item.id;
  els.editName.value = item.name;
  els.editPrompt.value = item.prompt || '';
  els.editDialog.showModal();
}

function renameSelected() {
  const items = selectedImages();
  if (!items.length) return;
  const firstName = items[0].stackItems ? items[0].name : items[0].name.replace(/\.png$/i, '');
  const name = prompt(items.length === 1 ? '输入新名称' : '输入批量名称前缀', firstName);
  if (!name) return;
  items.forEach((item, index) => {
    const nextName = items.length === 1 ? name : `${name}-${index + 1}`;
    item.name = item.stackItems ? nextName : ensurePng(nextName);
  });
  renderGallery();
  saveLibrary();
}

function ensurePng(name) {
  return name.toLowerCase().endsWith('.png') ? name : `${name}.png`;
}

async function regenerateSelected() {
  const items = selectedImages();
  if (!items.length) return;
  setStatus('生成中');
  const config = getConfig();
  for (const item of items) {
    if (item.stackItems) continue;
    const generated = await callImageApi({ ...config, prompt: item.prompt || config.prompt }, 0);
    item.url = generated.url;
    item.blob = generated.blob;
    item.model = config.apiModel;
    item.aspect = config.aspect;
    item.resolution = `${config.resolution / 1024}K`;
    item.createdAt = new Date();
  }
  setStatus('完成');
  renderGallery();
  saveLibrary();
}

function deleteSelected() {
  if (!state.selectedIds.size) return;
  state.images = state.images.filter(item => !state.selectedIds.has(item.id));
  state.selectedIds.clear();
  renderGallery();
  saveLibrary();
}

function copySelected(mode) {
  const items = selectedImages();
  if (!items.length) return;
  state.clipboard = { mode, items: items.map(cloneItemForClipboard) };
  state.images.forEach(item => { item.cut = mode === 'cut' && state.selectedIds.has(item.id); });
  renderGallery();
}

function cloneItemForClipboard(item) {
  return {
    ...item,
    cut: false,
    stackItems: item.stackItems ? item.stackItems.map(child => ({ ...child, cut: false })) : undefined,
  };
}

function pasteClipboard() {
  if (!state.clipboard.items.length) return;
  if (state.clipboard.mode === 'cut') {
    state.images = state.images.filter(item => !state.selectedIds.has(item.id));
  }
  const clones = state.clipboard.items.map(item => ({
    ...item,
    id: uid('img'),
    name: item.stackItems ? `${item.name} 副本` : item.name.replace(/\.png$/i, ' 副本.png'),
    cut: false,
    stackItems: item.stackItems ? item.stackItems.map(child => ({ ...child, id: uid('img'), cut: false })) : undefined,
  }));
  state.images.push(...clones);
  state.selectedIds = new Set(clones.map(item => item.id));
  state.clipboard = { mode: null, items: [] };
  renderGallery();
  saveLibrary();
}

async function stackSelected() {
  const items = selectedImages();
  if (items.length < 2) return;
  setStatus('叠放中');
  const { width, height } = aspectSize(getConfig().aspect, 1400);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#11130e';
  ctx.fillRect(0, 0, width, height);
  const loaded = await Promise.all(items.map(loadImage));
  loaded.forEach((img, index) => {
    const scale = .72 - index * .035;
    const drawW = width * Math.max(.44, scale);
    const drawH = drawW * img.height / img.width;
    const x = (width - drawW) / 2 + index * 34 - (items.length - 1) * 17;
    const y = (height - drawH) / 2 + index * 28 - (items.length - 1) * 14;
    ctx.globalAlpha = .9;
    ctx.drawImage(img, x, y, drawW, drawH);
  });
  ctx.globalAlpha = 1;
  const dataUrl = canvas.toDataURL('image/png');
  const stacked = imageRecord({
    url: dataUrl,
    blob: dataUrlToBlob(dataUrl),
    prompt: items.map(item => item.prompt).filter(Boolean).join(' / '),
    model: getConfig().apiModel,
    aspect: getConfig().aspect,
    resolution: '合成',
  });
  stacked.name = stacked.name.replace(/生成图(\d+)\.png$/, '叠放图组$1');
  stacked.stackItems = items.map(item => ({ ...item, cut: false }));
  state.images = state.images.filter(item => !state.selectedIds.has(item.id));
  state.images.push(stacked);
  state.selectedIds = new Set([stacked.id]);
  setStatus('完成');
  renderGallery();
  saveLibrary();
}

function unstackSelected() {
  const stacks = selectedImages().filter(item => item.stackItems?.length);
  if (!stacks.length) return;
  const restored = [];
  stacks.forEach(stack => {
    stack.stackItems.forEach(item => {
      restored.push({ ...item, id: uid('img'), cut: false });
    });
  });
  state.images = state.images.filter(item => !state.selectedIds.has(item.id));
  state.images.push(...restored);
  state.selectedIds = new Set(restored.map(item => item.id));
  setStatus('已取消');
  renderGallery();
  saveLibrary();
}

function loadImage(item) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = item.url;
  });
}

function downloadSelected() {
  expandSelectedForExport().forEach(item => downloadFile(item));
}

function downloadFile(item) {
  if (item.blob) {
    downloadBlob(item.blob, item.name);
    return;
  }
  if (item.url) {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportZip() {
  const items = expandSelectedForExport();
  if (!items.length) return;
  const missing = items.filter(item => !item.blob);
  if (missing.length) {
    alert('部分图片来自远程 URL，当前本地服务无法拉取这些图片，不能打包 ZIP。请先使用单图下载，或换一个本机可访问的图片托管地址。');
    return;
  }
  setStatus('打包中');
  const files = await Promise.all(items.map(async item => ({
    name: item.name,
    data: new Uint8Array(await item.blob.arrayBuffer()),
  })));
  downloadBlob(new Blob([makeZip(files)], { type: 'application/zip' }), `image-lab-${Date.now()}.zip`);
  setStatus('完成');
}

function expandSelectedForExport() {
  return selectedImages().flatMap(item => {
    if (!item.stackItems) return [item];
    return item.stackItems.map(child => ({
      ...child,
      name: `${safeFolderName(item.name)}/${child.name}`,
    }));
  });
}

function safeFolderName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_');
}

function makeZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);
    const local = concatBytes([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(file.data.length), u32(file.data.length),
      u16(name.length), u16(0), name, file.data,
    ]);
    localParts.push(local);
    centralParts.push(concatBytes([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(file.data.length), u32(file.data.length),
      u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name,
    ]));
    offset += local.length;
  });
  const central = concatBytes(centralParts);
  const end = concatBytes([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(central.length), u32(offset), u16(0),
  ]);
  return concatBytes([...localParts, central, end]);
}

function u16(value) {
  return new Uint8Array([value & 255, (value >> 8) & 255]);
}

function u32(value) {
  return new Uint8Array([value & 255, (value >> 8) & 255, (value >> 16) & 255, (value >> 24) & 255]);
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function crc32(data) {
  let crc = -1;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i];
    for (let j = 0; j < 8; j += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function rectsIntersect(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

els.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const config = getConfig();
  config.filePrompt = config.prompt;
  if (config.optimize) config.prompt = optimizePromptText(config.prompt);
  if (config.optimize) els.prompt.value = config.prompt;
  setStatus('生成中');
  showGenerationOverlay(config.apiKey ? '正在请求真实接口，生成时间取决于模型服务。' : '正在使用本地测试生成器。');
  try {
    const created = await callImageBatch(config);
    state.images.push(...created);
    state.selectedIds = new Set(created.map(item => item.id));
    setStatus(config.apiKey ? 'API完成' : '测试完成');
    renderGallery();
    persistRun(config, created);
    saveLibrary();
  } catch (error) {
    setStatus('API失败');
    alert(error.message);
  } finally {
    hideGenerationOverlay();
  }
});

async function persistRun(config, images) {
  if (!location.protocol.startsWith('http')) return;
  try {
    const response = await fetch('/api/save-run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          apiProfile: activeProfile()?.name,
          apiModel: config.apiModel,
          apiEndpoint: config.apiEndpoint,
          apiFormat: config.apiFormat,
          aspect: config.aspect,
          resolution: config.resolution,
          count: config.count,
          prompt: config.filePrompt || config.prompt,
          optimize: config.optimize,
        },
        images: images.map((image) => ({
          id: image.id,
          name: image.name,
          prompt: image.prompt,
          model: image.model,
          aspect: image.aspect,
          resolution: image.resolution,
          url: image.url?.startsWith('data:image/') ? undefined : image.url,
          dataUrl: image.url?.startsWith('data:image/') ? image.url : undefined,
        })),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (payload?.images?.length) {
      payload.images.forEach((saved, index) => {
        if (images[index] && saved.savedPath) images[index].savedPath = saved.savedPath;
      });
      saveLibrary();
    }
  } catch (error) {
    console.warn('Run persistence failed.', error);
  }
}

els.openSettings.addEventListener('click', () => {
  applyProfileToEditor(activeProfile());
  renderProfileList();
  els.settingsDialog.showModal();
});
els.maintenance.addEventListener('click', () => els.maintenanceDialog.showModal());
els.closeMaintenance.addEventListener('click', () => els.maintenanceDialog.close());
els.openAppDir.addEventListener('click', () => maintenanceAction('open-app-dir'));
els.openDataDir.addEventListener('click', () => maintenanceAction('open-data-dir'));
els.openOutputsDir.addEventListener('click', () => maintenanceAction('open-outputs-dir'));
els.backupData.addEventListener('click', () => maintenanceAction('backup-data'));
els.closeSettings.addEventListener('click', () => els.settingsDialog.close());
els.saveApi.addEventListener('click', saveApiConfig);
els.applyProfile.addEventListener('click', () => {
  saveApiConfig();
  els.settingsDialog.close();
});
els.newProfile.addEventListener('click', createProfile);
els.deleteProfile.addEventListener('click', deleteActiveProfile);
els.profileList.addEventListener('click', (event) => {
  const item = event.target.closest('.profile-item');
  if (!item) return;
  saveEditorToActiveProfile();
  state.activeApiId = item.dataset.id;
  applyProfileToEditor(activeProfile());
  persistApiProfiles();
  renderProfileList();
  updateActiveApiLabel();
});
els.optimizeBtn.addEventListener('click', () => {
  els.prompt.value = optimizePromptText(els.prompt.value.trim());
});

els.imageInput.addEventListener('change', (event) => handleFiles(event.target.files));
els.clearUploads.addEventListener('click', () => {
  state.uploads = [];
  els.imageInput.value = '';
  renderUploads();
});

['dragenter', 'dragover'].forEach(type => {
  els.uploadZone.addEventListener(type, (event) => {
    event.preventDefault();
    els.uploadZone.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach(type => {
  els.uploadZone.addEventListener(type, () => els.uploadZone.classList.remove('drag-over'));
});

els.uploadZone.addEventListener('drop', (event) => {
  event.preventDefault();
  handleFiles(event.dataTransfer.files);
});

els.grid.addEventListener('click', (event) => {
  const card = event.target.closest('.thumb-card');
  if (!card) return;
  const id = card.dataset.id;
  const item = state.images.find(image => image.id === id);
  if (card.dataset.stack === 'true' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    state.selectedIds.clear();
    state.selectedIds.add(id);
    closeContextMenu();
    renderGallery();
    openStackDetail(item);
    return;
  }
  if (event.ctrlKey || event.metaKey) {
    state.selectedIds.has(id) ? state.selectedIds.delete(id) : state.selectedIds.add(id);
  } else if (event.shiftKey) {
    state.selectedIds.add(id);
  } else {
    state.selectedIds.clear();
    state.selectedIds.add(id);
    closeContextMenu();
    renderGallery();
    previewImage(item);
    return;
  }
  closeContextMenu();
  renderGallery();
});

els.grid.addEventListener('dblclick', (event) => {
  const card = event.target.closest('.thumb-card');
  if (!card) return;
  const item = state.images.find(image => image.id === card.dataset.id);
  item?.stackItems ? openStackDetail(item) : previewImage(item);
});

els.grid.addEventListener('contextmenu', (event) => {
  const card = event.target.closest('.thumb-card');
  if (!card) return;
  event.preventDefault();
  ensureSelection(card.dataset.id);
  openContextMenu(event.clientX, event.clientY);
});

els.canvas.addEventListener('mousedown', (event) => {
  if (event.button !== 0 || event.target.closest('.thumb-card')) return;
  const canvasRect = els.canvas.getBoundingClientRect();
  const startX = event.clientX + els.canvas.scrollLeft - canvasRect.left;
  const startY = event.clientY + els.canvas.scrollTop - canvasRect.top;
  state.selectedIds.clear();
  closeContextMenu();

  function onMove(moveEvent) {
    const currentX = moveEvent.clientX + els.canvas.scrollLeft - canvasRect.left;
    const currentY = moveEvent.clientY + els.canvas.scrollTop - canvasRect.top;
    const box = {
      left: Math.min(startX, currentX),
      top: Math.min(startY, currentY),
      right: Math.max(startX, currentX),
      bottom: Math.max(startY, currentY),
    };
    Object.assign(els.selectionBox.style, {
      display: 'block',
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.right - box.left}px`,
      height: `${box.bottom - box.top}px`,
    });
    document.querySelectorAll('.thumb-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const localRect = {
        left: rect.left + els.canvas.scrollLeft - canvasRect.left,
        top: rect.top + els.canvas.scrollTop - canvasRect.top,
        right: rect.right + els.canvas.scrollLeft - canvasRect.left,
        bottom: rect.bottom + els.canvas.scrollTop - canvasRect.top,
      };
      if (rectsIntersect(box, localRect)) state.selectedIds.add(card.dataset.id);
      else state.selectedIds.delete(card.dataset.id);
    });
    renderGallery();
  }

  function onUp() {
    els.selectionBox.style.display = 'none';
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
});

els.contextMenu.addEventListener('click', async (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  closeContextMenu();
  if (action === 'preview') previewImage();
  if (action === 'edit') openEdit();
  if (action === 'delete') deleteSelected();
  if (action === 'regenerate') await regenerateSelected();
  if (action === 'rename') renameSelected();
  if (action === 'copy') copySelected('copy');
  if (action === 'cut') copySelected('cut');
  if (action === 'stack') await stackSelected();
  if (action === 'unstack') unstackSelected();
  if (action === 'zip') await exportZip();
  if (action === 'download') downloadSelected();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.context-menu')) closeContextMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Delete') deleteSelected();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') copySelected('copy');
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'x') copySelected('cut');
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') pasteClipboard();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && document.activeElement === document.body) {
    event.preventDefault();
    state.selectedIds = new Set(state.images.map(item => item.id));
    renderGallery();
  }
});

els.closePreview.addEventListener('click', () => els.previewDialog.close());
els.previewPrev.addEventListener('click', () => pagePreview(-1));
els.previewNext.addEventListener('click', () => pagePreview(1));
els.closeStack.addEventListener('click', () => els.stackDialog.close());
els.stackGrid.addEventListener('click', (event) => {
  const itemButton = event.target.closest('.stack-item');
  if (!itemButton) return;
  const stack = selectedImages()[0] || state.images.find(image => image.stackItems);
  const index = Number(itemButton.dataset.index);
  const item = stack?.stackItems?.[index];
  if (!item) return;
  els.stackDialog.close();
  previewImage(item, stack.stackItems, index);
});
els.cancelEdit.addEventListener('click', () => els.editDialog.close());
els.editForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const item = state.images.find(image => image.id === state.editingId);
  if (item) {
    const nextName = els.editName.value.trim() || item.name;
    item.name = item.stackItems ? nextName : ensurePng(nextName);
    item.prompt = els.editPrompt.value.trim();
  }
  els.editDialog.close();
  renderGallery();
  saveLibrary();
});

els.paste.addEventListener('click', pasteClipboard);
els.zipSelected.addEventListener('click', exportZip);
els.downloadSelected.addEventListener('click', downloadSelected);

initializeApp();
initNeuroCanvas();

async function initializeApp() {
  await loadApiConfig();
  renderUploads();
  renderGallery();
}

function initNeuroCanvas() {
  const canvas = document.getElementById('neuroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const pointer = { x: .5, y: .5 };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let dots = [];
  let streaks = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const dotCount = Math.max(90, Math.floor(width * height / 15000));
    dots = Array.from({ length: dotCount }, (_, index) => ({
      x: ((index * 97) % width) / width,
      y: ((index * 53) % height) / height,
      z: .22 + ((index * 37) % 100) / 100,
    }));
    streaks = Array.from({ length: 34 }, (_, index) => ({
      x: .28 + ((index * 29) % 48) / 100,
      y: -0.2 - ((index * 17) % 100) / 100,
      len: .22 + ((index * 11) % 34) / 100,
      hue: index % 3,
      speed: .00022 + (index % 7) * .000045,
      alpha: .16 + (index % 5) * .045,
    }));
  }

  function draw(time) {
    const t = time || 0;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'screen';

    const driftX = (pointer.x - .5) * 18;
    const driftY = (pointer.y - .5) * 10;
    const horizon = height * .34;
    const vanishing = width * .54 + driftX;

    for (const dot of dots) {
      const pulse = .5 + .5 * Math.sin(t * .001 + dot.z * 8);
      const x = dot.x * width + driftX * dot.z;
      const y = dot.y * height + driftY * dot.z;
      const r = .55 + dot.z * 1.15;
      ctx.fillStyle = `rgba(255,255,255,${(.025 + pulse * .055) * dot.z})`;
      ctx.fillRect(x, y, r, r);
    }

    for (const streak of streaks) {
      streak.y += streak.speed * (16 + (t % 20));
      if (streak.y > 1.04) streak.y = -streak.len;
      const x = streak.x * width + driftX * .9;
      const y = streak.y * height;
      const len = streak.len * height;
      const color = streak.hue === 0 ? '255,255,255' : streak.hue === 1 ? '75,75,160' : '143,71,174';
      const grad = ctx.createLinearGradient(x, y, x, y + len);
      grad.addColorStop(0, `rgba(${color},0)`);
      grad.addColorStop(.45, `rgba(${color},${streak.alpha})`);
      grad.addColorStop(1, `rgba(${color},0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = streak.hue === 0 ? 1.35 : .85;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (x - vanishing) * .14, y + len);
      ctx.stroke();
    }

    for (let i = 0; i < 26; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const spread = 70 + i * 22;
      const endX = vanishing + side * spread * 5.5;
      const endY = height + i * 10;
      const color = i % 3 === 0 ? '255,255,255' : i % 3 === 1 ? '75,75,160' : '143,71,174';
      const grad = ctx.createLinearGradient(vanishing, horizon, endX, endY);
      grad.addColorStop(0, `rgba(${color},0)`);
      grad.addColorStop(.52, `rgba(${color},${.06 + (i % 5) * .018})`);
      grad.addColorStop(1, `rgba(${color},0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(vanishing + side * (8 + i * 2), horizon);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX / Math.max(1, width);
    pointer.y = event.clientY / Math.max(1, height);
  });
  resize();
  requestAnimationFrame(draw);
}

async function maintenanceAction(action) {
  try {
    const response = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.error?.message || `操作失败：${action}`);
    if (payload.message) alert(payload.message);
  } catch (error) {
    alert(error.message);
  }
}
