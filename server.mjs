import { createServer } from 'node:http';
import { appendFile, cp, mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, normalize, resolve, relative } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { getRouterStatus, getRouterProviders, getRouterQuota, getRouterCombos, prepareRouterEmbedding, routerChat } from './router-adapter.mjs';
import { getNewApiStatus, getNewApiModels, newApiChat } from './new-api-adapter.mjs';

const root = process.cwd();
const hubRoot = process.env.AGENT_WORKSTATION_HOME || join(homedir(), '.agent-workstation');
const changeLogPath = join(hubRoot, 'changes.jsonl');
const port = Number(process.env.PORT || 4789);
const imageWorkbenchDir = process.env.IMAGE_WORKBENCH_DIR || 'D:\\leslie\\60_claude项目库\\图像生成工作台';
const pptToolDir = process.env.PPT_TOOL_DIR || 'D:\\leslie\\60_claude项目库\\PPT工具';

// ── 9Router auto-start ──
const ROUTER_PORT = process.env.NINE_ROUTER_PORT || '20128';
let routerChild = null;

function startRouter() {
  const cliPath = join(root, 'node_modules', '9router', 'cli.js');
  try {
    routerChild = spawn('node', [cliPath, '--port', ROUTER_PORT, '--tray', '--no-browser', '--skip-update'], {
      cwd: root,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: ROUTER_PORT },
      windowsHide: true,
    });
    routerChild.stdout?.on('data', d => {
      const msg = d.toString().trim();
      if (msg) console.log(`[9Router] ${msg}`);
    });
    routerChild.stderr?.on('data', d => {
      const msg = d.toString().trim();
      if (msg) console.error(`[9Router] ${msg}`);
    });
    routerChild.on('exit', code => {
      console.log(`[9Router] exited with code ${code}`);
      routerChild = null;
    });
    console.log(`[9Router] Starting on port ${ROUTER_PORT}...`);
  } catch (err) {
    console.error(`[9Router] Failed to start: ${err.message}`);
  }
}
// Graceful shutdown
function cleanup() {
  if (routerChild) { try { process.kill(-routerChild.pid); } catch {} }
  process.exit(0);
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

const skillDescriptionsZh = new Map(Object.entries({
  'algorithmic-art': '用 p5.js、随机种子和可调参数创作生成艺术、算法视觉、粒子系统与流场图形。',
  'brand-guidelines': '把 Anthropic 官方品牌色、字体和视觉规范应用到文档、页面、演示或视觉产物中。',
  'canvas-design': '用设计方法生成海报、静态视觉、PNG/PDF 艺术作品和高完成度视觉稿。',
  'claude-api': '用于 Claude API、Anthropic SDK、Agent SDK 的应用开发、接入和调试。',
  'doc-coauthoring': '用于共创文档、方案、技术规格、决策记录和结构化写作流程。',
  'docx': '用于读取、创建、编辑和处理 Word 文档，包括 .docx 文件内容和格式。',
  'frontend-design': '用于设计和实现高质量前端页面、组件、应用界面和视觉体验。',
  'hv-analysis': '卡兹克横纵分析法，用于系统研究产品、公司、概念、技术或人物并产出深度报告。',
  'internal-comms': '用于撰写公司内部沟通文本，例如状态更新、公告、内部说明和汇报材料。',
  'khazix-writer': '卡兹克公众号长文写作风格，用于根据素材生成有个人口吻和节奏的中文长文。',
  'huashu-design': '花叔 Design，用于高保真原型、交互 Demo、动画、设计变体探索和专家级设计评审。',
  'aihot': '用于查询 AI HOT 中文 AI 资讯、日报、精选条目、模型发布、产品动态和论文信息。',
  'neat-freak': '用于会话收尾时同步项目文档、AGENTS/CLAUDE 指令和跨会话记忆。',
  'lark-base': '飞书多维表格能力，用于建表、字段管理、记录读写、视图配置和数据分析。',
  'lark-calendar': '飞书日历能力，用于查看日程、创建会议、查询忙闲和推荐可用时间。',
  'lark-contact': '飞书通讯录能力，用于查询组织架构、搜索员工和获取人员信息。',
  'lark-doc': '飞书云文档能力，用于创建、读取、更新文档，以及搜索云空间文档。',
  'lark-drive': '飞书云空间能力，用于上传下载文件、整理目录、查看元数据和管理权限。',
  'lark-event': '飞书事件订阅能力，用于实时监听消息、通讯录、日历等事件并输出事件流。',
  'lark-im': '飞书即时通讯能力，用于收发消息、搜索聊天记录、管理群聊和处理附件。',
  'lark-mail': '飞书邮箱能力，用于起草、发送、回复、转发、读取和搜索邮件。',
  'lark-minutes': '飞书妙记能力，用于获取妙记基础信息、总结、待办和章节内容。',
  'lark-openapi-explorer': '飞书 OpenAPI 探索能力，用于查找并调用尚未被 CLI 封装的原生接口。',
  'lark-shared': '飞书 CLI 共享基础能力，用于应用配置、认证登录、身份切换、权限和 scope 管理。',
  'lark-sheets': '飞书电子表格能力，用于创建表格、读写单元格、追加数据和导出表格。',
  'lark-skill-maker': '飞书自定义 Skill 创建能力，用于把飞书 API 操作封装成可复用工作流。',
  'lark-task': '飞书任务能力，用于创建待办、查看任务、更新状态、拆分子任务和分配协作成员。',
  'lark-vc': '飞书视频会议能力，用于查询会议记录、获取总结、待办、章节和逐字稿。',
  'lark-whiteboard': '飞书画板能力，用于在云文档中绘制架构图、流程图、思维导图和其他图表。',
  'lark-wiki': '飞书知识库能力，用于查询知识空间、创建文档节点和组织知识库层级。',
  'lark-workflow-meeting-summary': '会议纪要整理工作流，用于汇总一段时间内的会议纪要并生成结构化报告。',
  'lark-workflow-standup-report': '日程待办摘要工作流，用于汇总指定日期的日程和未完成任务。',
}));

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

await ensureHub();

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/api/state') {
      await sendJson(res, await getState());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/open-path') {
      const body = await readJson(req);
      await openKnownPath(body.pathKey);
      await sendJson(res, { ok: true });
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/skill-sync-preview') {
      await sendJson(res, await getSkillSyncPreview());
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/agent-adapters') {
      await sendJson(res, await getAgentAdapters());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/import-skills') {
      const body = await readJson(req);
      await sendJson(res, await importSkills(body.items || []));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/skill-export-preview') {
      await sendJson(res, await getSkillExportPreview());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/export-skills') {
      const body = await readJson(req);
      await sendJson(res, await exportSkills(body.items || []));
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/install-market-skill') {
      const body = await readJson(req);
      await sendJson(res, await installMarketSkill(body));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/skill-market') {
      await sendJson(res, await getSkillMarket(url.searchParams.get('rank') || 'allTime'));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/hub-documents') {
      await sendJson(res, await getHubDocuments());
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/memory-import-preview') {
      await sendJson(res, await getMemoryImportPreview());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/import-memory-candidates') {
      const body = await readJson(req);
      await sendJson(res, await importMemoryCandidates(body.items || []));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/hub-tree') {
      await sendJson(res, await getHubTree(url.searchParams.get('path') || '/'));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/hub-snapshot') {
      await sendJson(res, await getHubSnapshot(url.searchParams.get('path') || '/'));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/hub-changes') {
      const since = Number(url.searchParams.get('since') || 0);
      await sendJson(res, await getHubChanges(Number.isFinite(since) ? since : 0, url.searchParams.get('path') || '/'));
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/hub-document') {
      const body = await readJson(req);
      await sendJson(res, await saveHubDocument(body.key, body.content));
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/hub-message') {
      const body = await readJson(req);
      await sendJson(res, await appendHubMessage(body.text));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/context-export-preview') {
      await sendJson(res, await getContextExportPreview());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/export-context') {
      const body = await readJson(req);
      await sendJson(res, await exportContext(body.targets || []));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/aihot/items') {
      await sendJson(res, await getAihotItems(url.searchParams));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/aihot/daily') {
      await sendJson(res, await getAihotDaily(url.searchParams.get('date') || ''));
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/launch-image-workbench') {
      await launchImageWorkbench();
      await sendJson(res, { ok: true, url: 'http://127.0.0.1:4173' });
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/launch-ppt-web-tool') {
      await launchPptWebTool();
      await sendJson(res, { ok: true, url: 'http://127.0.0.1:4185' });
      return;
    }

    // ── 9Router API ──
    if (req.method === 'GET' && url.pathname === '/api/router/status') {
      await sendJson(res, await getRouterStatus());
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/router/providers') {
      await sendJson(res, await getRouterProviders());
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/router/quota') {
      await sendJson(res, await getRouterQuota());
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/router/combos') {
      await sendJson(res, await getRouterCombos());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/router/chat') {
      const body = await readJson(req);
      await sendJson(res, await routerChat(body.model, body.messages));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/new-api/status') {
      await sendJson(res, await getNewApiStatus());
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/new-api/models') {
      await sendJson(res, await getNewApiModels());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/new-api/chat') {
      const body = await readJson(req);
      await sendJson(res, await newApiChat(body.model, body.messages));
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/gateway/chat') {
      const body = await readJson(req);
      const first = await newApiChat(body.model, body.messages);
      if (first?.ok) {
        await sendJson(res, first);
        return;
      }
      const fallback = await routerChat(body.model, body.messages);
      await sendJson(res, fallback?.ok ? fallback : { ...fallback, gatewayFallbackReason: first.error || first.message });
      return;
    }
    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const filePath = resolve(root, `.${requested}`);
    if (!isInside(root, filePath)) {
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
    res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: error.message || 'Request failed' }));
  }
}).listen(port, () => {
  console.log(`Agent Workstation: http://127.0.0.1:${port}`);
  // Auto-start integrated services
  startRouter();
  setTimeout(() => {
    prepareRouterEmbedding().catch(error => console.error(`[9Router] embed prepare failed: ${error.message}`));
  }, 2500);
});

async function ensureHub() {
  const dirs = ['profile', 'skills', 'memory', 'projects', 'secrets', 'messages', 'artifacts', 'adapters', 'router'];
  await mkdir(hubRoot, { recursive: true });
  await Promise.all(dirs.map(dir => mkdir(join(hubRoot, dir), { recursive: true })));
  await mkdir(join(hubRoot, 'projects', 'image-workbench'), { recursive: true });
  await ensureFile(join(hubRoot, 'profile', 'preferences.md'), '# Preferences\n\n- Keep workflows local-first.\n');
  await ensureFile(join(hubRoot, 'memory', 'global.md'), '# Global Memory\n\n');
  await ensureFile(join(hubRoot, 'projects', 'image-workbench', 'context.md'), '# Image Workbench Context\n\n- Keep the existing image workbench project independent.\n');
  await ensureFile(join(hubRoot, 'adapters', 'agent-routing.md'), '# Agent Routing\n\n- Hub is the local source of truth for shared skills, profile, memory, and project notes.\n- Claude and Codex adapters should export from Hub instead of editing Hub content implicitly.\n');
  await ensureFile(join(hubRoot, 'messages', 'inbox.jsonl'), '');
  await ensureFile(changeLogPath, '');
}

async function ensureFile(path, content) {
  try {
    await stat(path);
  } catch {
    await writeFile(path, content, 'utf8');
  }
}

async function getState() {
  const [claudeSkills, codexSkills, hubSkills, hubCounts, imageWorkbench] = await Promise.all([
    scanSkills(join(homedir(), '.claude', 'skills')),
    scanSkills(join(homedir(), '.codex', 'skills')),
    scanSkills(join(hubRoot, 'skills')),
    countHub(),
    describePath(imageWorkbenchDir),
  ]);

  const names = new Set([...claudeSkills, ...codexSkills, ...hubSkills].map(item => item.name));
  const matrix = [...names].sort((a, b) => a.localeCompare(b)).map(name => ({
    name,
    hub: hubSkills.some(item => item.name === name),
    claude: claudeSkills.some(item => item.name === name),
    codex: codexSkills.some(item => item.name === name),
  }));

  return {
    generatedAt: new Date().toISOString(),
    paths: {
      hubRoot,
      claudeSkills: join(homedir(), '.claude', 'skills'),
      codexSkills: join(homedir(), '.codex', 'skills'),
      imageWorkbench: imageWorkbenchDir,
    },
    counts: {
      claudeSkills: claudeSkills.length,
      codexSkills: codexSkills.length,
      hubSkills: hubSkills.length,
      memoryFiles: hubCounts.memoryFiles,
      projects: hubCounts.projects,
      messages: hubCounts.messages,
    },
    skills: { claude: claudeSkills, codex: codexSkills, hub: hubSkills, matrix },
    imageWorkbench,
  };
}

async function getSkillSyncPreview() {
  const [claudeSkills, codexSkills, hubSkills] = await Promise.all([
    scanSkills(join(homedir(), '.claude', 'skills')),
    scanSkills(join(homedir(), '.codex', 'skills')),
    scanSkills(join(hubRoot, 'skills')),
  ]);
  const hubByFolder = new Map(hubSkills.map(skill => [skill.folder, skill]));
  const candidates = [];
  for (const source of [
    { id: 'claude', label: 'Claude', path: join(homedir(), '.claude', 'skills'), skills: claudeSkills },
    { id: 'codex', label: 'Codex', path: join(homedir(), '.codex', 'skills'), skills: codexSkills },
  ]) {
    for (const skill of source.skills) {
      const hubSkill = hubByFolder.get(skill.folder);
      const status = !hubSkill ? 'new' : hubSkill.size === skill.size && hubSkill.updatedAt === skill.updatedAt ? 'same' : 'changed';
      candidates.push({
        id: `${source.id}:${skill.folder}`,
        source: source.id,
        sourceLabel: source.label,
        name: skill.name,
        folder: skill.folder,
        description: skill.description,
        descriptionZh: skill.descriptionZh,
        sourcePath: join(source.path, skill.folder),
        hubPath: join(hubRoot, 'skills', skill.folder),
        status,
        sourceUpdatedAt: skill.updatedAt,
        hubUpdatedAt: hubSkill?.updatedAt || null,
        size: skill.size,
        hubSize: hubSkill?.size || null,
      });
    }
  }
  return {
    generatedAt: new Date().toISOString(),
    candidates: candidates.sort((a, b) => {
      const rank = { new: 0, changed: 1, same: 2 };
      return (rank[a.status] - rank[b.status]) || a.name.localeCompare(b.name);
    }),
  };
}

async function importSkills(items) {
  const allowed = await getSkillSyncPreview();
  const byId = new Map(allowed.candidates.map(item => [item.id, item]));
  const results = [];
  for (const requested of items) {
    const candidate = byId.get(requested.id || requested);
    if (!candidate) {
      results.push({ id: requested.id || requested, ok: false, error: 'Unknown skill candidate' });
      continue;
    }
    if (candidate.status === 'same') {
      results.push({ id: candidate.id, ok: true, skipped: true, message: 'Already in sync' });
      continue;
    }
    const target = candidate.hubPath;
    const backup = `${target}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    try {
      if (!isInside(join(hubRoot, 'skills'), target)) throw new Error('Target path escaped hub skills directory');
      if (await exists(target)) {
        await rename(target, backup);
      }
      await cp(candidate.sourcePath, target, {
        recursive: true,
        force: false,
        dereference: true,
        filter: source => !source.includes(`${candidate.folder}\\.git\\`) && !source.includes(`${candidate.folder}/.git/`),
      });
      await recordHubChange({
        action: candidate.status === 'new' ? 'skill_imported' : 'skill_updated',
        path: `/skills/${candidate.folder}/SKILL.md`,
        source: candidate.source,
        metadata: { name: candidate.name, sourcePath: candidate.sourcePath },
      });
      results.push({
        id: candidate.id,
        ok: true,
        name: candidate.name,
        status: candidate.status,
        backup: await exists(backup) ? backup : null,
      });
    } catch (error) {
      results.push({ id: candidate.id, ok: false, name: candidate.name, error: error.message });
    }
  }
  return { ok: results.every(item => item.ok), results };
}

async function getSkillExportPreview() {
  const [hubSkills, claudeSkills, codexSkills] = await Promise.all([
    scanSkills(join(hubRoot, 'skills')),
    scanSkills(join(homedir(), '.claude', 'skills')),
    scanSkills(join(homedir(), '.codex', 'skills')),
  ]);
  const targets = [
    { id: 'claude', label: 'Claude', root: join(homedir(), '.claude', 'skills'), skills: claudeSkills },
    { id: 'codex', label: 'Codex', root: join(homedir(), '.codex', 'skills'), skills: codexSkills },
  ];
  const candidates = [];
  for (const hubSkill of hubSkills) {
    for (const target of targets) {
      const targetSkill = target.skills.find(skill => skill.folder === hubSkill.folder);
      const status = !targetSkill ? 'new' : targetSkill.size === hubSkill.size && targetSkill.updatedAt === hubSkill.updatedAt ? 'same' : 'changed';
      candidates.push({
        id: `${hubSkill.folder}:${target.id}`,
        target: target.id,
        targetLabel: target.label,
        name: hubSkill.name,
        folder: hubSkill.folder,
        description: hubSkill.description,
        descriptionZh: hubSkill.descriptionZh,
        sourcePath: join(hubRoot, 'skills', hubSkill.folder),
        targetPath: join(target.root, hubSkill.folder),
        status,
        hubUpdatedAt: hubSkill.updatedAt,
        targetUpdatedAt: targetSkill?.updatedAt || null,
        size: hubSkill.size,
        targetSize: targetSkill?.size || null,
      });
    }
  }
  return {
    generatedAt: new Date().toISOString(),
    candidates: candidates.sort((a, b) => {
      const rank = { new: 0, changed: 1, same: 2 };
      return (rank[a.status] - rank[b.status]) || a.name.localeCompare(b.name) || a.target.localeCompare(b.target);
    }),
  };
}

async function exportSkills(items) {
  const allowed = await getSkillExportPreview();
  const byId = new Map(allowed.candidates.map(item => [item.id, item]));
  const targetRoots = {
    claude: join(homedir(), '.claude', 'skills'),
    codex: join(homedir(), '.codex', 'skills'),
  };
  const results = [];
  for (const requested of items) {
    const candidate = byId.get(requested.id || requested);
    if (!candidate) {
      results.push({ id: requested.id || requested, ok: false, error: 'Unknown export candidate' });
      continue;
    }
    if (candidate.status === 'same') {
      results.push({ id: candidate.id, ok: true, skipped: true, message: 'Already in sync' });
      continue;
    }
    const targetRoot = targetRoots[candidate.target];
    const target = candidate.targetPath;
    const backup = `${target}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    try {
      if (!targetRoot || !isInside(targetRoot, target)) throw new Error('Target path escaped agent skills directory');
      await mkdir(targetRoot, { recursive: true });
      if (await exists(target)) {
        await rename(target, backup);
      }
      await cp(candidate.sourcePath, target, {
        recursive: true,
        force: false,
        dereference: true,
        filter: source => !source.includes(`${candidate.folder}\\.git\\`) && !source.includes(`${candidate.folder}/.git/`),
      });
      await recordHubChange({
        action: candidate.status === 'new' ? 'skill_exported' : 'skill_distributed',
        path: `/skills/${candidate.folder}/SKILL.md`,
        source: 'agent-workstation',
        metadata: { name: candidate.name, target: candidate.target, targetPath: candidate.targetPath },
      });
      results.push({
        id: candidate.id,
        ok: true,
        name: candidate.name,
        target: candidate.target,
        status: candidate.status,
        backup: await exists(backup) ? backup : null,
      });
    } catch (error) {
      results.push({ id: candidate.id, ok: false, name: candidate.name, target: candidate.target, error: error.message });
    }
  }
  return { ok: results.every(item => item.ok), results };
}

async function installMarketSkill(skill) {
  const name = String(skill?.name || skill?.folder || '').trim();
  const folder = sanitizeSkillFolder(skill?.folder || name);
  if (!name || !folder) throw new Error('Missing skill name');
  const targetDir = join(hubRoot, 'skills', folder);
  const skillPath = join(targetDir, 'SKILL.md');
  if (!isInside(join(hubRoot, 'skills'), targetDir)) throw new Error('Target path escaped hub skills directory');
  await mkdir(targetDir, { recursive: true });
  let content = '';
  if (skill.rawUrl) {
    try {
      const response = await fetch(skill.rawUrl);
      if (response.ok) content = await response.text();
    } catch {}
  }
  if (!content.trim()) {
    content = [
      `# ${name}`,
      '',
      String(skill.description || 'Reusable Agent skill.'),
      '',
      '## Source',
      '',
      `- Registry: ${skill.repo || 'Skill Market'}`,
      `- Category: ${skill.category || 'General'}`,
      '',
      '## Usage',
      '',
      'Use this skill when the user request matches the description above.',
      '',
    ].join('\n');
  }
  await writeFile(skillPath, content, 'utf8');
  await recordHubChange({
    action: 'skill_market_installed',
    path: `/skills/${folder}/SKILL.md`,
    source: 'skill-market',
    metadata: { name, repo: skill.repo || null, category: skill.category || null },
  });
  return { ok: true, name, folder, path: skillPath };
}

function sanitizeSkillFolder(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function getSkillMarket(rank) {
  const key = ['trending', 'hot'].includes(rank) ? rank : 'allTime';
  const path = key === 'allTime' ? '' : key;
  const url = `https://www.skills.sh/${path}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Agent Workstation Skill Market',
      'Accept': 'text/html',
    },
  });
  if (!response.ok) throw new Error(`Skill market fetch failed: ${response.status}`);
  const html = await response.text();
  const items = parseSkillsSh(html).map(item => ({
    ...item,
    category: inferSkillCategory(item.name, item.repo),
    descriptionZh: describeMarketSkillZh(item.name, item.repo),
    icon: skillInitialsServer(item.name),
  }));
  return {
    ok: true,
    rank: key,
    source: url,
    generatedAt: new Date().toISOString(),
    total: items.length,
    items,
  };
}

function parseSkillsSh(html) {
  const items = [];
  const re = /href="\/([^"\/]+)\/([^"\/]+)\/([^"\/]+)"[\s\S]*?<span[^>]*>(\d+)<\/span>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<p[^>]*>([^<]+)<\/p>[\s\S]*?<span class="font-mono text-sm text-foreground">([^<]+)<\/span>/g;
  let match;
  while ((match = re.exec(html))) {
    const repo = decodeHtml(match[6]);
    const name = decodeHtml(match[5]);
    items.push({
      rank: Number(match[4]),
      name,
      folder: sanitizeSkillFolder(name),
      repo,
      displayInstalls: decodeHtml(match[7]),
      installScore: parseMetric(match[7]),
      href: `https://www.skills.sh/${match[1]}/${match[2]}/${match[3]}`,
    });
  }
  return items;
}

function parseMetric(value) {
  const raw = String(value || '').split(/\s|\+/)[0].trim().toUpperCase();
  const number = Number(raw.replace(/[KM]/g, ''));
  if (!Number.isFinite(number)) return 0;
  if (raw.includes('M')) return Math.round(number * 1_000_000);
  if (raw.includes('K')) return Math.round(number * 1_000);
  return number;
}

function inferSkillCategory(name, repo) {
  const value = `${name} ${repo}`.toLowerCase();
  if (/lark|feishu/.test(value)) return '飞书';
  if (/azure|microsoft/.test(value)) return 'Azure';
  if (/react|frontend|design|interface|web-design/.test(value)) return '前端设计';
  if (/video|remotion|kling/.test(value)) return '视频';
  if (/image|photo/.test(value)) return '图像';
  if (/browser/.test(value)) return '浏览器';
  if (/cli/.test(value)) return 'CLI';
  if (/agent|copilot/.test(value)) return 'Agent';
  return '通用';
}

function describeMarketSkillZh(name, repo) {
  const category = inferSkillCategory(name, repo);
  const readable = String(name || '').replace(/-/g, ' ');
  const patterns = {
    '飞书': `用于飞书相关工作流的 Skill，覆盖 ${readable} 场景。`,
    Azure: `用于 Azure / Microsoft 生态的 Skill，帮助处理 ${readable} 相关任务。`,
    '前端设计': `用于前端设计、界面打磨和实现规范的 Skill。`,
    '视频': `用于视频生成、剪辑或合成工作流的 Skill。`,
    '图像': `用于图像生成、编辑或视觉素材处理的 Skill。`,
    '浏览器': `用于浏览器自动化、网页检查和交互测试的 Skill。`,
    CLI: `用于命令行工具和本地自动化流程的 Skill。`,
    Agent: `用于 Agent 工作流、助手编排或 Copilot 场景的 Skill。`,
    '通用': `来自 ${repo} 的 Skill，用于扩展 Agent 的 ${readable} 能力。`,
  };
  return patterns[category] || patterns['通用'];
}

function skillInitialsServer(value) {
  return String(value || 'SK').split(/[\s-_]+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'SK';
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

async function getAgentAdapters() {
  const [contextPreview, hubSkills, claudeSkills, codexSkills, changes] = await Promise.all([
    getContextExportPreview(),
    scanSkills(join(hubRoot, 'skills')),
    scanSkills(join(homedir(), '.claude', 'skills')),
    scanSkills(join(homedir(), '.codex', 'skills')),
    readHubChanges(),
  ]);
  const hubFolders = new Set(hubSkills.map(skill => skill.folder));
  const skillCoverage = skills => {
    const folders = new Set(skills.map(skill => skill.folder));
    const missingFromAgent = [...hubFolders].filter(folder => !folders.has(folder)).sort();
    const extraInAgent = skills.filter(skill => !hubFolders.has(skill.folder)).map(skill => skill.folder).sort();
    return {
      totalHub: hubFolders.size,
      installed: skills.filter(skill => hubFolders.has(skill.folder)).length,
      missing: missingFromAgent.length,
      extra: extraInAgent.length,
      missingFolders: missingFromAgent.slice(0, 8),
    };
  };

  const targetById = new Map(contextPreview.targets.map(target => [target.id, target]));
  const latestCursor = changes.at(-1)?.cursor || 0;
  const adapters = [
    {
      id: 'claude',
      label: 'Claude',
      root: join(homedir(), '.claude'),
      skillsPath: join(homedir(), '.claude', 'skills'),
      contextPath: join(homedir(), '.claude', 'CLAUDE.md'),
      skills: skillCoverage(claudeSkills),
    },
    {
      id: 'codex',
      label: 'Codex',
      root: join(homedir(), '.codex'),
      skillsPath: join(homedir(), '.codex', 'skills'),
      contextPath: join(homedir(), '.codex', 'AGENTS.md'),
      skills: skillCoverage(codexSkills),
    },
  ].map(adapter => {
    const target = targetById.get(adapter.id);
    const contextReady = target?.exists && target.status === 'same';
    return {
      ...adapter,
      mode: contextReady ? 'read_hub' : 'needs_export',
      writePolicy: 'read_only',
      readLayers: {
        profile: contextReady,
        globalMemory: contextReady,
        projectContext: contextReady,
        skills: adapter.skills.missing === 0 && adapter.skills.totalHub > 0,
        inbox: false,
      },
      context: {
        exists: Boolean(target?.exists),
        status: target?.status || 'missing',
        path: adapter.contextPath,
      },
      cursor: latestCursor,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    latestCursor,
    adapters,
  };
}

const hubDocuments = [
  {
    key: 'profile',
    title: 'Profile',
    titleZh: '稳定偏好',
    description: 'Stable preferences every agent should respect.',
    descriptionZh: '跨 Agent 都应该遵守的稳定偏好和工作习惯。',
    path: join(hubRoot, 'profile', 'preferences.md'),
    editable: true,
  },
  {
    key: 'memory',
    title: 'Global Memory',
    titleZh: '全局记忆',
    description: 'Durable facts that should survive across sessions.',
    descriptionZh: '需要跨会话保留的长期事实、约定和背景。',
    path: join(hubRoot, 'memory', 'global.md'),
    editable: true,
  },
  {
    key: 'imageProject',
    title: 'Image Workbench',
    titleZh: '图像工作台项目笔记',
    description: 'Context and decisions for the linked image generation workbench.',
    descriptionZh: '图像生成工作台相关的上下文、决策和注意事项。',
    path: join(hubRoot, 'projects', 'image-workbench', 'context.md'),
    editable: true,
  },
  {
    key: 'routing',
    title: 'Agent Routing',
    titleZh: 'Agent 路由规则',
    description: 'Rules for how agents consume Hub content.',
    descriptionZh: 'Claude / Codex 等 Agent 如何读取和导出 Hub 内容的规则。',
    path: join(hubRoot, 'adapters', 'agent-routing.md'),
    editable: true,
  },
  {
    key: 'inbox',
    title: 'Inbox',
    titleZh: '消息收件箱',
    description: 'Append-only notes and handoff messages.',
    descriptionZh: '追加式记录，用来放临时想法、交接信息和待整理内容。',
    path: join(hubRoot, 'messages', 'inbox.jsonl'),
    editable: false,
  },
  {
    key: 'routerConfig',
    title: 'Router Config',
    titleZh: '模型中转站配置',
    description: 'Preferred AI provider configuration and combo setups for 9Router.',
    descriptionZh: '9Router 偏好的 AI Provider 配置和 Combo 组合记录。',
    path: join(hubRoot, 'router', 'config.md'),
    editable: true,
  },
];

async function getHubDocuments() {
  await ensureHub();
  const documents = await Promise.all(hubDocuments.map(async doc => {
    const raw = await readFile(doc.path, 'utf8').catch(() => '');
    const content = doc.key === 'inbox' ? formatInbox(raw) : raw;
    const info = await stat(doc.path).catch(() => null);
    return {
      key: doc.key,
      title: doc.title,
      titleZh: doc.titleZh,
      description: doc.description,
      descriptionZh: doc.descriptionZh,
      path: doc.path,
      editable: doc.editable,
      content,
      updatedAt: info?.mtime.toISOString() || null,
      size: info?.size || 0,
    };
  }));
  return { generatedAt: new Date().toISOString(), documents };
}

async function saveHubDocument(key, content) {
  const doc = hubDocuments.find(item => item.key === key);
  if (!doc || !doc.editable) throw new Error('Unknown or read-only hub document');
  if (!isInside(hubRoot, doc.path)) throw new Error('Document path escaped hub root');
  await writeFile(doc.path, String(content || ''), 'utf8');
  await recordHubChange({
    action: 'document_saved',
    path: toVirtualPath(doc.path),
    source: 'agent-workstation',
    metadata: { key },
  });
  return { ok: true, key, updatedAt: new Date().toISOString() };
}

async function appendHubMessage(text) {
  const cleanText = clean(text);
  if (!cleanText) throw new Error('Message is empty');
  const target = join(hubRoot, 'messages', 'inbox.jsonl');
  if (!isInside(hubRoot, target)) throw new Error('Inbox path escaped hub root');
  const entry = {
    createdAt: new Date().toISOString(),
    text: cleanText,
    source: 'agent-workstation',
  };
  await appendFile(target, `${JSON.stringify(entry)}\n`, 'utf8');
  await recordHubChange({
    action: 'message_appended',
    path: '/inbox/default/incoming/inbox.jsonl',
    source: 'agent-workstation',
    metadata: { length: cleanText.length },
  });
  return { ok: true, entry };
}

async function getMemoryImportPreview() {
  await ensureHub();
  const candidates = dedupeMemoryCandidates([
    ...await scanClaudeMemoryFiles(),
    ...await scanClaudeHistory(),
    ...await scanCodexGlobalState(),
    ...await scanCodexRules(),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    candidates: candidates.slice(0, 80),
  };
}

async function importMemoryCandidates(items) {
  const preview = await getMemoryImportPreview();
  const byId = new Map(preview.candidates.map(candidate => [candidate.id, candidate]));
  const picked = items.map(item => byId.get(item.id || item)).filter(Boolean);
  const groups = new Map();
  for (const candidate of picked) {
    if (!groups.has(candidate.target)) groups.set(candidate.target, []);
    groups.get(candidate.target).push(candidate);
  }
  const results = [];
  for (const [target, candidates] of groups) {
    const doc = hubDocuments.find(item => item.key === target);
    if (!doc || !doc.editable) {
      results.push({ target, ok: false, error: 'Unknown or read-only target' });
      continue;
    }
    const current = await readFile(doc.path, 'utf8').catch(() => '');
    const block = [
      '',
      `## Imported Agent Memory - ${new Date().toISOString()}`,
      '',
      ...candidates.map(candidate => [
        `- ${candidate.summary}`,
        `  - Source: ${candidate.sourceLabel}`,
        `  - Path: ${candidate.sourcePath}`,
      ].join('\n')),
      '',
    ].join('\n');
    await writeFile(doc.path, `${current.trimEnd()}${block}`, 'utf8');
    await recordHubChange({
      action: 'memory_candidates_imported',
      path: toVirtualPath(doc.path),
      source: 'agent-workstation',
      metadata: { target, count: candidates.length },
    });
    results.push({ target, ok: true, count: candidates.length });
  }
  return { ok: results.every(item => item.ok), results };
}

async function scanClaudeMemoryFiles() {
  const rootPath = join(homedir(), '.claude', 'projects');
  const files = await findFiles(rootPath, file => file.toLowerCase().endsWith('.md') && file.toLowerCase().includes(`${sepPattern()}memory${sepPattern()}`), 40);
  const candidates = [];
  for (const file of files) {
    if (file.split(/[\\/]/).pop()?.toLowerCase() === 'memory.md') continue;
    const content = await readFile(file, 'utf8').catch(() => '');
    const frontmatterDescription = /^description:\s*(.+)$/m.exec(content)?.[1];
    const text = cleanMarkdown(content);
    const summary = clean(frontmatterDescription || text);
    if (!isUsefulMemoryText(summary)) continue;
    candidates.push(memoryCandidate({
      source: 'claude',
      sourceLabel: 'Claude Memory',
      sourcePath: file,
      target: 'profile',
      summary,
      confidence: 0.88,
    }));
  }
  return candidates;
}

async function scanClaudeHistory() {
  const file = join(homedir(), '.claude', 'history.jsonl');
  const lines = await readJsonLines(file, 260);
  return lines
    .map(item => clean(item.display || ''))
    .filter(isUsefulHistoryPrompt)
    .slice(-24)
    .map(text => memoryCandidate({
      source: 'claude',
      sourceLabel: 'Claude History',
      sourcePath: file,
      target: classifyMemoryTarget(text),
      summary: summarizePrompt(text),
      confidence: 0.52,
    }));
}

async function scanCodexGlobalState() {
  const file = join(homedir(), '.codex', '.codex-global-state.json');
  const raw = await readFile(file, 'utf8').catch(() => '');
  if (!raw) return [];
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  const state = parsed['electron-persisted-atom-state'] || {};
  const prompts = Array.isArray(state['prompt-history']) ? state['prompt-history'] : [];
  const workspaceRoots = Array.isArray(parsed['electron-saved-workspace-roots']) ? parsed['electron-saved-workspace-roots'] : [];
  const candidates = prompts
    .map(clean)
    .filter(isUsefulHistoryPrompt)
    .slice(-36)
    .map(text => memoryCandidate({
      source: 'codex',
      sourceLabel: 'Codex Prompt History',
      sourcePath: file,
      target: classifyMemoryTarget(text),
      summary: summarizePrompt(text),
      confidence: 0.58,
    }));
  workspaceRoots.map(clean).filter(Boolean).forEach(rootPath => {
    candidates.push(memoryCandidate({
      source: 'codex',
      sourceLabel: 'Codex Workspace Roots',
      sourcePath: file,
      target: rootPath.includes('图像') || rootPath.toLowerCase().includes('image') ? 'imageProject' : 'memory',
      summary: `常用工作区路径：${rootPath}`,
      confidence: 0.7,
    }));
  });
  return candidates;
}

async function scanCodexRules() {
  const dir = join(homedir(), '.codex', 'rules');
  const files = await findFiles(dir, file => file.toLowerCase().endsWith('.rules'), 20);
  const candidates = [];
  for (const file of files) {
    const content = await readFile(file, 'utf8').catch(() => '');
    const lines = content.split(/\r?\n/).map(clean).filter(line => line && !line.startsWith('prefix_rule(')).slice(0, 24);
    if (lines.length) {
      candidates.push(memoryCandidate({
        source: 'codex',
        sourceLabel: 'Codex Rules',
        sourcePath: file,
        target: 'routing',
        summary: `${lines.length} 条 Codex 规则可作为 Agent 路由/权限参考。`,
        confidence: 0.5,
      }));
    }
  }
  return candidates;
}

function memoryCandidate({ source, sourceLabel, sourcePath, target, summary, confidence }) {
  const cleaned = clean(summary).slice(0, 260);
  return {
    id: checksum(`${source}|${sourcePath}|${target}|${cleaned}`).slice(0, 16),
    source,
    sourceLabel,
    sourcePath,
    target,
    targetLabel: memoryTargetLabel(target),
    summary: cleaned,
    confidence,
  };
}

function dedupeMemoryCandidates(candidates) {
  const seen = new Set();
  const result = [];
  for (const candidate of candidates) {
    const key = `${candidate.target}:${candidate.summary.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  return result.sort((a, b) => b.confidence - a.confidence || a.target.localeCompare(b.target));
}

function classifyMemoryTarget(text) {
  const value = String(text || '').toLowerCase();
  if (value.includes('图像') || value.includes('图片') || value.includes('image') || value.includes('workbench')) return 'imageProject';
  if (value.includes('ui') || value.includes('huashu') || value.includes('skill') || value.includes('agent') || value.includes('sync')) return 'routing';
  if (value.includes('偏好') || value.includes('prefer') || value.includes('默认') || value.includes('不要')) return 'profile';
  return 'memory';
}

function memoryTargetLabel(target) {
  return {
    profile: 'Profile',
    memory: 'Global Memory',
    imageProject: 'Image Workbench',
    routing: 'Agent Routing',
  }[target] || target;
}

function summarizePrompt(text) {
  const value = clean(text);
  if (value.length <= 180) return value;
  return `${value.slice(0, 177)}...`;
}

function cleanMarkdown(text) {
  return String(text || '')
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/\[[^\]]+\]\([^)]+\)/g, match => match.replace(/^\[|\]\([^)]+\)$/g, ''))
    .replace(/[#*_`>-]/g, ' ');
}

function isUsefulMemoryText(text) {
  const value = clean(text);
  return value.length >= 18 && !/^(hello|hi|nihao|你好)$/i.test(value);
}

function isUsefulHistoryPrompt(text) {
  const value = clean(text);
  if (!isUsefulMemoryText(value)) return false;
  if (value.length < 24) return false;
  return /记忆|偏好|工作站|agent|skill|同步|图像|图片|项目|ui|huashu|claude|codex|不要|路径|workbench|memory|sync|prompt|rules/i.test(value);
}

async function readJsonLines(file, limit = 200) {
  const raw = await readFile(file, 'utf8').catch(() => '');
  const lines = raw.split(/\r?\n/).filter(Boolean).slice(-limit);
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

async function findFiles(dir, predicate, limit = 100) {
  const files = [];
  async function walk(current) {
    if (files.length >= limit) return;
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (files.length >= limit) break;
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && predicate(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  await walk(dir);
  return files;
}

function sepPattern() {
  return process.platform === 'win32' ? '\\' : '/';
}

async function getContextExportPreview() {
  const block = await buildManagedContextBlock();
  const targets = await Promise.all(contextTargets().map(async target => {
    const current = await readFile(target.path, 'utf8').catch(() => '');
    const next = replaceManagedBlock(current, block);
    return {
      id: target.id,
      label: target.label,
      path: target.path,
      exists: await exists(target.path),
      status: current === next ? 'same' : current.includes(managedStart()) ? 'changed' : 'new',
      preview: block,
      currentSize: current.length,
      nextSize: next.length,
    };
  }));
  return { generatedAt: new Date().toISOString(), targets };
}

async function exportContext(targetIds) {
  const allowed = await getContextExportPreview();
  const byId = new Map(allowed.targets.map(target => [target.id, target]));
  const block = await buildManagedContextBlock();
  const results = [];
  for (const targetId of targetIds) {
    const target = byId.get(targetId);
    if (!target) {
      results.push({ id: targetId, ok: false, error: 'Unknown context export target' });
      continue;
    }
    try {
      const current = await readFile(target.path, 'utf8').catch(() => '');
      const next = replaceManagedBlock(current, block);
      if (current === next) {
        results.push({ id: target.id, ok: true, skipped: true, path: target.path });
        continue;
      }
      await mkdir(resolve(target.path, '..'), { recursive: true });
      if (current) {
        const backup = `${target.path}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
        await writeFile(backup, current, 'utf8');
        await writeFile(target.path, next, 'utf8');
        await recordHubChange({
          action: 'context_exported',
          path: `/adapters/${target.id}/managed-context.md`,
          source: 'agent-workstation',
          metadata: { target: target.id, targetPath: target.path, backup },
        });
        results.push({ id: target.id, ok: true, path: target.path, backup });
      } else {
        await writeFile(target.path, next, 'utf8');
        await recordHubChange({
          action: 'context_exported',
          path: `/adapters/${target.id}/managed-context.md`,
          source: 'agent-workstation',
          metadata: { target: target.id, targetPath: target.path, backup: null },
        });
        results.push({ id: target.id, ok: true, path: target.path, backup: null });
      }
    } catch (error) {
      results.push({ id: target.id, ok: false, path: target.path, error: error.message });
    }
  }
  return { ok: results.every(item => item.ok), results };
}

function contextTargets() {
  return [
    { id: 'claude', label: 'Claude', path: join(homedir(), '.claude', 'CLAUDE.md') },
    { id: 'codex', label: 'Codex', path: join(homedir(), '.codex', 'AGENTS.md') },
  ];
}

async function buildManagedContextBlock() {
  const docs = await getHubDocuments();
  const pick = key => docs.documents.find(doc => doc.key === key)?.content?.trim() || '';
  return [
    managedStart(),
    '# Agent Workstation Shared Context',
    '',
    `Hub: ${hubRoot}`,
    '',
    '## How To Use',
    '',
    '- Treat this block as a read-only export from the local Agent Workstation Hub.',
    '- Edit shared preferences, memory, and project notes in the workstation UI, then export again.',
    '- Do not place secrets here. Keep secrets in the Hub secrets area or each agent native secret store.',
    '',
    '## Profile',
    '',
    pick('profile') || '_No profile content yet._',
    '',
    '## Global Memory',
    '',
    pick('memory') || '_No global memory yet._',
    '',
    '## Image Workbench Project',
    '',
    pick('imageProject') || '_No image workbench notes yet._',
    '',
    '## Agent Routing',
    '',
    pick('routing') || '_No routing rules yet._',
    managedEnd(),
    '',
  ].join('\n');
}

function replaceManagedBlock(current, block) {
  const start = managedStart();
  const end = managedEnd();
  const text = String(current || '');
  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end);
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = text.slice(0, startIndex).trimEnd();
    const after = text.slice(endIndex + end.length).trimStart();
    return [before, block.trimEnd(), after].filter(Boolean).join('\n\n') + '\n';
  }
  return [text.trimEnd(), block.trimEnd()].filter(Boolean).join('\n\n') + '\n';
}

function managedStart() {
  return '<!-- BEGIN AGENT-WORKSTATION MANAGED CONTEXT -->';
}

function managedEnd() {
  return '<!-- END AGENT-WORKSTATION MANAGED CONTEXT -->';
}

function formatInbox(raw) {
  const lines = String(raw || '').split(/\r?\n/).filter(Boolean);
  if (!lines.length) return '# Inbox\n\nNo messages yet.\n';
  const entries = lines.map(line => {
    try {
      const item = JSON.parse(line);
      return `- ${item.createdAt || 'unknown'} - ${item.text || ''}`;
    } catch {
      return `- ${line}`;
    }
  });
  return `# Inbox\n\n${entries.join('\n')}\n`;
}

async function getHubTree(path = '/') {
  const normalizedPath = normalizeVirtualPath(path);
  const snapshot = await getHubSnapshot(normalizedPath);
  const children = snapshot.nodes
    .filter(node => node.path !== normalizedPath && parentVirtualPath(node.path) === normalizedPath)
    .sort(compareHubNodes);
  return {
    generatedAt: new Date().toISOString(),
    path: normalizedPath,
    children,
    cursor: snapshot.cursor,
    rootChecksum: snapshot.rootChecksum,
  };
}

async function getHubSnapshot(path = '/') {
  await ensureHub();
  const normalizedPath = normalizeVirtualPath(path);
  const [nodes, changes] = await Promise.all([buildVirtualNodes(), readHubChanges()]);
  const versionByPath = changes.reduce((acc, change) => {
    const changePath = normalizeVirtualPath(change.path || '/');
    acc.set(changePath, (acc.get(changePath) || 0) + 1);
    return acc;
  }, new Map());
  const cursor = changes.at(-1)?.cursor || 0;
  const scoped = nodes
    .filter(node => node.path === normalizedPath || isVirtualDescendant(normalizedPath, node.path))
    .map(node => ({
      ...node,
      version: Math.max(1, versionByPath.get(node.path) || 1),
      cursor,
    }))
    .sort(compareHubNodes);
  const rootChecksum = checksum(scoped.map(node => `${node.path}:${node.checksum}`).join('\n'));
  return {
    generatedAt: new Date().toISOString(),
    path: normalizedPath,
    cursor,
    rootChecksum,
    nodes: scoped,
  };
}

async function getHubChanges(since = 0, path = '/') {
  await ensureHub();
  const normalizedPath = normalizeVirtualPath(path);
  const changes = (await readHubChanges())
    .filter(change => Number(change.cursor || 0) > since)
    .filter(change => normalizedPath === '/' || change.path === normalizedPath || isVirtualDescendant(normalizedPath, change.path))
    .slice(-80);
  return {
    generatedAt: new Date().toISOString(),
    since,
    path: normalizedPath,
    latestCursor: changes.at(-1)?.cursor || since,
    changes,
  };
}

async function buildVirtualNodes() {
  const files = await listHubFiles(hubRoot);
  const fileNodes = await Promise.all(files.map(async file => {
    const info = await stat(file);
    const content = await readFile(file);
    const virtualPath = toVirtualPath(file);
    return {
      path: virtualPath,
      kind: kindForVirtualPath(virtualPath),
      isDirectory: false,
      contentType: contentTypeForPath(file),
      metadata: metadataForVirtualPath(virtualPath, file),
      checksum: checksum(content),
      version: 1,
      cursor: 0,
      updatedAt: info.mtime.toISOString(),
      size: info.size,
      physicalPath: file,
    };
  }));

  const dirs = new Map();
  for (const node of fileNodes) {
    let current = parentVirtualPath(node.path);
    while (!dirs.has(current)) {
      dirs.set(current, {
        path: current,
        kind: current === '/' ? 'hub_root' : 'directory',
        isDirectory: true,
        contentType: 'inode/directory',
        metadata: {
          source: 'agent-workstation',
          editable: false,
          trustLevel: 'work',
        },
        checksum: '',
        version: 1,
        cursor: 0,
        updatedAt: node.updatedAt,
        size: 0,
      });
      if (current === '/') break;
      current = parentVirtualPath(current);
    }
  }

  const allNodes = [...dirs.values(), ...fileNodes];
  for (const dir of dirs.values()) {
    const descendants = allNodes.filter(node => node.path !== dir.path && parentVirtualPath(node.path) === dir.path);
    dir.checksum = checksum(descendants.map(node => `${node.path}:${node.checksum}`).sort().join('\n'));
    dir.updatedAt = descendants
      .map(node => node.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) || dir.updatedAt;
    dir.size = descendants.length;
  }
  return allNodes;
}

async function listHubFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (!isInside(hubRoot, fullPath)) continue;
    const firstSegment = relative(hubRoot, fullPath).split(/[\\/]+/).filter(Boolean)[0];
    if (firstSegment === 'secrets') continue;
    if (entry.name.includes('.backup-')) continue;
    if (entry.isDirectory()) {
      files.push(...await listHubFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function toVirtualPath(file) {
  const rel = relative(hubRoot, file).split(/[\\/]+/).filter(Boolean);
  if (!rel.length) return '/';
  if (rel[0] === 'profile' && rel[1] === 'preferences.md') return '/memory/profile/preferences.md';
  if (rel[0] === 'memory') return `/${rel.join('/')}`;
  if (rel[0] === 'projects') return `/${rel.join('/')}`;
  if (rel[0] === 'adapters') return `/${rel.join('/')}`;
  if (rel[0] === 'skills' && rel[2] === 'SKILL.md') return `/skills/${rel[1]}/SKILL.md`;
  if (rel[0] === 'messages' && rel[1] === 'inbox.jsonl') return '/inbox/default/incoming/inbox.jsonl';
  if (rel[0] === 'changes.jsonl') return '/system/changes.jsonl';
  return `/${rel.join('/')}`;
}

function kindForVirtualPath(path) {
  if (path === '/') return 'hub_root';
  if (path === '/memory/profile/preferences.md') return 'profile_preferences';
  if (path === '/memory/global.md') return 'memory_global';
  if (path.startsWith('/projects/') && path.endsWith('/context.md')) return 'project_context';
  if (path.startsWith('/skills/') && path.endsWith('/SKILL.md')) return 'skill';
  if (path.startsWith('/inbox/')) return 'inbox';
  if (path.startsWith('/adapters/')) return 'adapter';
  if (path.startsWith('/system/')) return 'system';
  return 'file';
}

function metadataForVirtualPath(path, physicalPath) {
  const doc = hubDocuments.find(item => normalize(resolve(item.path)) === normalize(resolve(physicalPath)));
  const metadata = {
    source: 'agent-workstation',
    editable: Boolean(doc?.editable),
    trustLevel: path.startsWith('/system/') ? 'system' : 'work',
  };
  if (path.startsWith('/skills/')) {
    metadata.sourcePlatform = 'hub';
    metadata.captureMode = 'folder';
    metadata.exactness = 'file';
  }
  if (doc) metadata.documentKey = doc.key;
  return metadata;
}

function contentTypeForPath(path) {
  const ext = extname(path).toLowerCase();
  if (ext === '.md') return 'text/markdown';
  if (ext === '.jsonl') return 'application/jsonl';
  if (ext === '.json') return 'application/json';
  return 'application/octet-stream';
}

async function recordHubChange({ action, path, source, metadata = {} }) {
  await ensureFile(changeLogPath, '');
  const changes = await readHubChanges();
  const cursor = (changes.at(-1)?.cursor || 0) + 1;
  const entry = {
    cursor,
    createdAt: new Date().toISOString(),
    action,
    path: normalizeVirtualPath(path),
    source: source || 'agent-workstation',
    metadata,
  };
  await appendFile(changeLogPath, `${JSON.stringify(entry)}\n`, 'utf8');
  return entry;
}

async function readHubChanges() {
  const raw = await readFile(changeLogPath, 'utf8').catch(() => '');
  return raw.split(/\r?\n/).filter(Boolean).map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function normalizeVirtualPath(path) {
  const cleanPath = String(path || '/').replace(/\\/g, '/').trim();
  if (!cleanPath || cleanPath === '/') return '/';
  return `/${cleanPath.replace(/^\/+|\/+$/g, '')}`;
}

function parentVirtualPath(path) {
  const normalizedPath = normalizeVirtualPath(path);
  if (normalizedPath === '/') return '/';
  const parts = normalizedPath.split('/').filter(Boolean);
  parts.pop();
  return parts.length ? `/${parts.join('/')}` : '/';
}

function isVirtualDescendant(parent, child) {
  const parentPath = normalizeVirtualPath(parent);
  const childPath = normalizeVirtualPath(child);
  return parentPath === '/' ? childPath !== '/' : childPath.startsWith(`${parentPath}/`);
}

function compareHubNodes(a, b) {
  if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
  return a.path.localeCompare(b.path);
}

function checksum(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function scanSkills(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const skills = [];
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const skillPath = join(dir, entry.name, 'SKILL.md');
      try {
        const text = await readFile(skillPath, 'utf8');
        const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] || '';
        const title = /^name:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim() || entry.name;
        const description = extractDescription(frontmatter);
        const descriptionZh = describeSkillZh(entry.name, title, description);
        const info = await stat(skillPath);
        skills.push({
          name: title.replace(/^["']|["']$/g, ''),
          folder: entry.name,
          description,
          descriptionZh,
          path: skillPath,
          updatedAt: info.mtime.toISOString(),
          size: info.size,
        });
      } catch {
        // Ignore folders that are not skills.
      }
    }
    return skills.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

function describeSkillZh(folder, title, description) {
  const key = String(folder || '').toLowerCase();
  const named = skillDescriptionsZh.get(key) || skillDescriptionsZh.get(String(title || '').toLowerCase());
  if (named) return named;
  if (key.startsWith('lark-')) return '飞书/Lark 工作流能力，用于把对应的飞书操作封装成可复用的本地 Agent 技能。';
  if (hasCjk(description)) return clean(description).slice(0, 180);
  const label = clean(title || folder || 'Skill');
  return `${label} 技能，用于扩展本地 Agent 的专项工作流；原始说明为英文，可在 SKILL.md 中继续补充中文介绍。`;
}

function hasCjk(text) {
  return /[\u3400-\u9fff]/u.test(String(text || ''));
}

function extractDescription(frontmatter) {
  const inline = /^description:\s*(.+)$/m.exec(frontmatter)?.[1];
  if (inline && !['|', '>'].includes(inline.trim())) return clean(inline).slice(0, 220);
  const block = /^description:\s*[|>]\s*\r?\n([\s\S]*?)(?:\n[a-zA-Z_-]+:|$)/m.exec(frontmatter)?.[1] || '';
  return clean(block).slice(0, 220);
}

function clean(text) {
  return String(text || '').replace(/\s+/g, ' ').replace(/^["']|["']$/g, '').trim();
}

async function countHub() {
  return {
    memoryFiles: await countFiles(join(hubRoot, 'memory')),
    projects: await countDirs(join(hubRoot, 'projects')),
    messages: await countLines(join(hubRoot, 'messages', 'inbox.jsonl')),
  };
}

async function countFiles(dir) {
  try {
    return (await readdir(dir, { withFileTypes: true })).filter(item => item.isFile()).length;
  } catch {
    return 0;
  }
}

async function countDirs(dir) {
  try {
    return (await readdir(dir, { withFileTypes: true })).filter(item => item.isDirectory()).length;
  } catch {
    return 0;
  }
}

async function countLines(path) {
  try {
    const text = await readFile(path, 'utf8');
    return text.split(/\r?\n/).filter(Boolean).length;
  } catch {
    return 0;
  }
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function describePath(path) {
  try {
    const info = await stat(path);
    return { exists: true, directory: info.isDirectory(), path };
  } catch {
    return { exists: false, directory: false, path };
  }
}

async function openKnownPath(pathKey) {
  const map = {
    hub: hubRoot,
    claude: join(homedir(), '.claude', 'skills'),
    codex: join(homedir(), '.codex', 'skills'),
    imageWorkbench: imageWorkbenchDir,
  };
  const target = map[pathKey];
  if (!target) throw new Error(`Unknown path key: ${pathKey}`);
  spawn('explorer.exe', [target], { detached: true, stdio: 'ignore' }).unref();
}

async function launchImageWorkbench() {
  const serverPath = join(imageWorkbenchDir, 'server.mjs');
  await stat(serverPath);
  const child = spawn('node', ['server.mjs'], {
    cwd: imageWorkbenchDir,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PORT: process.env.IMAGE_WORKBENCH_PORT || '4173' },
    windowsHide: true,
  });
  child.unref();
}

async function launchPptWebTool() {
  const appPath = join(pptToolDir, 'web_app.py');
  await stat(appPath);
  const pythonBin = process.env.PPT_WEB_PYTHON || 'C:\\Users\\hanxuan\\AppData\\Local\\Programs\\Python\\Python311\\python.exe';
  const child = spawn(pythonBin, ['web_app.py'], {
    cwd: pptToolDir,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PPT_WEB_PORT: process.env.PPT_WEB_PORT || '4185' },
    windowsHide: true,
  });
  child.unref();
}

async function getAihotItems(searchParams) {
  const mode = ['selected', 'all'].includes(searchParams.get('mode')) ? searchParams.get('mode') : 'selected';
  const category = ['ai-models', 'ai-products', 'industry', 'paper', 'tip'].includes(searchParams.get('category')) ? searchParams.get('category') : '';
  const take = Math.max(1, Math.min(50, Number.parseInt(searchParams.get('take') || '24', 10) || 24));
  const q = clean(searchParams.get('q') || '').slice(0, 120);
  const upstream = new URL('https://aihot.virxact.com/api/public/items');
  upstream.searchParams.set('mode', mode);
  upstream.searchParams.set('take', String(take));
  if (category) upstream.searchParams.set('category', category);
  if (q.length >= 2) upstream.searchParams.set('q', q);
  return getAihotJson(upstream);
}

async function getAihotDaily(date) {
  const cleanDate = /^\d{4}-\d{2}-\d{2}$/.test(String(date || '')) ? date : '';
  const upstream = new URL(cleanDate
    ? `https://aihot.virxact.com/api/public/daily/${cleanDate}`
    : 'https://aihot.virxact.com/api/public/daily');
  return getAihotJson(upstream);
}

async function getAihotJson(url) {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 AgentWorkstation/1.0 (+local-first)',
    },
  });
  if (!response.ok) throw new Error(`AI HOT upstream returned ${response.status}`);
  return response.json();
}

function isInside(parent, child) {
  const rel = relative(resolve(parent), resolve(child));
  return rel === '' || (!rel.startsWith('..') && !normalize(rel).startsWith('..\\') && !resolve(rel).startsWith('\\\\'));
}

function readJson(req) {
  return new Promise((resolveJson, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolveJson(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function sendJson(res, body) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
