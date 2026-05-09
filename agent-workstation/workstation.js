const els = {
  status: document.getElementById('statusPill'),
  languageToggle: document.getElementById('languageToggle'),
  hubPath: document.getElementById('hubPath'),
  imagePath: document.getElementById('imagePath'),
  imageAppStatus: document.getElementById('imageAppStatus'),
  projectState: document.getElementById('projectState'),
  refresh: document.getElementById('refreshBtn'),
  title: document.getElementById('viewTitle'),
  claudeSkillCount: document.getElementById('claudeSkillCount'),
  codexSkillCount: document.getElementById('codexSkillCount'),
  hubSkillCount: document.getElementById('hubSkillCount'),
  memoryCount: document.getElementById('memoryCount'),
  coverageMeta: document.getElementById('coverageMeta'),
  coverageList: document.getElementById('coverageList'),
  skillList: document.getElementById('skillList'),
  launchImage: document.getElementById('launchImageBtn'),
  launchImageAlt: document.getElementById('launchImageBtnAlt'),
  selectAll: document.getElementById('selectAllBtn'),
  clearSelection: document.getElementById('clearSelectionBtn'),
  runSync: document.getElementById('runSyncBtn'),
  syncTable: document.getElementById('syncTable'),
  syncResult: document.getElementById('syncResult'),
  planSummary: document.getElementById('planSummary'),
  syncDirectionLabel: document.getElementById('syncDirectionLabel'),
  reloadAdapters: document.getElementById('reloadAdaptersBtn'),
  adapterGrid: document.getElementById('adapterGrid'),
  adapterMeta: document.getElementById('adapterMeta'),
  memoryTabs: document.getElementById('memoryTabs'),
  memoryTitle: document.getElementById('memoryTitle'),
  memoryMeta: document.getElementById('memoryMeta'),
  memoryEditor: document.getElementById('memoryEditor'),
  saveMemory: document.getElementById('saveMemoryBtn'),
  reloadMemory: document.getElementById('reloadMemoryBtn'),
  memoryResult: document.getElementById('memoryResult'),
  inboxInput: document.getElementById('inboxInput'),
  appendInbox: document.getElementById('appendInboxBtn'),
  scanMemoryImport: document.getElementById('scanMemoryImportBtn'),
  importMemory: document.getElementById('importMemoryBtn'),
  memoryImportList: document.getElementById('memoryImportList'),
  memoryImportMeta: document.getElementById('memoryImportMeta'),
  memoryImportResult: document.getElementById('memoryImportResult'),
  reloadContextPreview: document.getElementById('reloadContextPreviewBtn'),
  contextTargets: document.getElementById('contextTargets'),
  contextPreview: document.getElementById('contextPreview'),
  exportContext: document.getElementById('exportContextBtn'),
  contextResult: document.getElementById('contextResult'),
  reloadHubIndex: document.getElementById('reloadHubIndexBtn'),
  hubTreeMeta: document.getElementById('hubTreeMeta'),
  hubTreeList: document.getElementById('hubTreeList'),
  hubChangesMeta: document.getElementById('hubChangesMeta'),
  hubChangesList: document.getElementById('hubChangesList'),
  connectionMethodGrid: document.getElementById('connectionMethodGrid'),
  dashboardAllCount: document.getElementById('dashboardAllCount'),
  dashboardProjectCount: document.getElementById('dashboardProjectCount'),
  dashboardConnectionCount: document.getElementById('dashboardConnectionCount'),
  dashboardFileList: document.getElementById('dashboardFileList'),
  dashboardSummaryList: document.getElementById('dashboardSummaryList'),
  dashboardSearch: document.getElementById('dashboardSearch'),
  dashboardTypeFilter: document.getElementById('dashboardTypeFilter'),
  dashboardSourceFilter: document.getElementById('dashboardSourceFilter'),
  aihotRefresh: document.getElementById('aihotRefreshBtn'),
  aihotSearch: document.getElementById('aihotSearch'),
  aihotCategory: document.getElementById('aihotCategory'),
  aihotMode: document.getElementById('aihotMode'),
  aihotMeta: document.getElementById('aihotMeta'),
  aihotList: document.getElementById('aihotList'),
  aihotBrief: document.getElementById('aihotBrief'),
  aihotDaily: document.getElementById('aihotDaily'),
};

const translations = {
  zh: {
    localHub: '\u672c\u5730\u4e2d\u67a2',
    navOverview: '\u603b\u89c8',
    navSync: 'Agent \u540c\u6b65',
    navAihot: 'AI \u70ed\u70b9',
    navMemory: '\u8bb0\u5fc6\u5e93',
    navProjects: '\u9879\u76ee\u5e93',
    navApps: '\u5e94\u7528',
    hubRoot: '\u4e2d\u67a2\u76ee\u5f55',
    openFolder: '\u6253\u5f00\u76ee\u5f55',
    tagline: '\u8de8 Agent \u5171\u4eab\u4e0a\u4e0b\u6587\u5de5\u4f5c\u53f0',
    refresh: '\u5237\u65b0',
    hubSkills: '\u4e2d\u67a2 Skills',
    memoryFiles: '\u8bb0\u5fc6\u6587\u4ef6',
    syncMap: '\u540c\u6b65\u5730\u56fe',
    skillCoverage: 'Skill \u8986\u76d6\u60c5\u51b5',
    builtInApp: '\u5185\u7f6e\u5e94\u7528',
    imageWorkbench: '\u56fe\u50cf\u751f\u6210\u5de5\u4f5c\u53f0',
    imageCopy: '\u4fdd\u6301\u56fe\u50cf\u751f\u6210\u9879\u76ee\u72ec\u7acb\uff0c\u53ea\u4ece\u8fd9\u4e2a\u5de5\u4f5c\u7ad9\u542f\u52a8\u548c\u8fdb\u5165\u5b83\u3002',
    connectionMethods: '\u63a5\u5165\u9762\u677f',
    connectionHint: '\u53ea\u6709\u771f\u6b63\u6388\u6743\u6216\u5b89\u88c5\u7684\u9002\u914d\u5668\u624d\u7b97\u5df2\u63a5\u5165\uff1b\u672c\u5730\u76ee\u5f55\u53ea\u6807\u8bb0\u4e3a\u5df2\u53d1\u73b0\u3002',
    manageConnections: '\u7ba1\u7406\u63a5\u5165',
    statAll: '\u5168\u90e8',
    connections: '\u63a5\u5165',
    files: '\u6587\u4ef6',
    editMemory: '\u7f16\u8f91\u8bb0\u5fc6',
    exportAll: '\u5168\u90e8\u5206\u53d1',
    searchFiles: '\u641c\u7d22\u6587\u4ef6',
    summary: '\u6458\u8981',
    connected: '\u5df2\u63a5\u5165',
    notConnected: '\u672a\u63a5\u5165',
    detected: '\u5df2\u53d1\u73b0',
    localReady: '\u672c\u673a\u53ef\u7528',
    linkedApp: '\u5df2\u94fe\u63a5',
    storage: '\u5b58\u50a8',
    lastSync: '\u4e0a\u6b21\u540c\u6b65',
    folders: '\u6587\u4ef6\u5939',
    pending: '\u5f85\u5904\u7406',
    folderType: '\u6587\u4ef6\u5939',
    fileType: '\u6587\u4ef6',
    sourceHub: 'Hub',
    sourceAgent: 'Agent',
    sourceSystem: '\u7cfb\u7edf',
    noDashboardFiles: '\u6ca1\u6709\u5339\u914d\u7684 Hub \u6761\u76ee\u3002',
    aihotTitle: 'AI \u60c5\u62a5\u53f0',
    aihotCopy: '\u628a AI HOT \u7684\u7cbe\u9009\u8d44\u8baf\u63a5\u5165\u672c\u5730\u5de5\u4f5c\u7ad9\uff0c\u6309\u6a21\u578b\u3001\u4ea7\u54c1\u3001\u884c\u4e1a\u3001\u8bba\u6587\u548c\u6280\u5de7\u5feb\u901f\u626b\u8bfb\u3002',
    aihotSearchPlaceholder: '\u641c\u7d22 OpenAI / Sora / RAG',
    aihotCategoryAll: '\u5168\u90e8\u5206\u7c7b',
    aihotCategoryModels: '\u6a21\u578b\u53d1\u5e03',
    aihotCategoryProducts: '\u4ea7\u54c1\u66f4\u65b0',
    aihotCategoryIndustry: '\u884c\u4e1a\u52a8\u6001',
    aihotCategoryPaper: '\u8bba\u6587\u7814\u7a76',
    aihotCategoryTip: '\u6280\u5de7\u89c2\u70b9',
    aihotModeSelected: '\u7cbe\u9009',
    aihotModeAll: '\u5168\u91cf',
    aihotRefresh: '\u5237\u65b0\u60c5\u62a5',
    aihotPrinciple1Title: '\u7cbe\u9009\u4f18\u5148',
    aihotPrinciple1Body: '\u9ed8\u8ba4\u53ea\u8bfb\u7cbe\u9009\u6c60\uff0c\u907f\u514d\u628a\u540c\u4e00\u4e8b\u4ef6\u548c\u5f31\u76f8\u5173\u566a\u58f0\u704c\u8fdb\u5de5\u4f5c\u6d41\u3002',
    aihotPrinciple2Title: '\u6309\u4efb\u52a1\u626b\u8bfb',
    aihotPrinciple2Body: '\u9700\u8981\u6a21\u578b\u3001\u4ea7\u54c1\u3001\u8bba\u6587\u65f6\u76f4\u63a5\u5207\u5206\u7c7b\uff0c\u4e0d\u4ece\u65f6\u95f4\u7ebf\u91cc\u786c\u635e\u3002',
    aihotPrinciple3Title: '\u56de\u5230\u6e90\u5934',
    aihotPrinciple3Body: '\u6bcf\u6761\u4fdd\u7559\u539f\u59cb\u6765\u6e90\u94fe\u63a5\uff0c\u5224\u65ad\u524d\u5148\u770b\u6e90\u6587\u3002',
    aihotFeedEyebrow: 'Selected Stream',
    aihotFeedTitle: '\u7cbe\u9009\u52a8\u6001',
    aihotDailyEyebrow: 'Daily',
    aihotDailyTitle: '\u4eca\u65e5\u65e5\u62a5',
    aihotLoading: '\u8bfb\u53d6 AI HOT \u4e2d...',
    aihotEmpty: '\u6ca1\u6709\u5339\u914d\u7684 AI HOT \u6761\u76ee\u3002',
    aihotOpenSource: '\u6253\u5f00\u6e90\u6587',
    aihotItemsCount: '{count} \u6761\u7cbe\u9009',
    aihotDailyDate: '\u65e5\u62a5 {date}',
    launch: '\u542f\u52a8',
    open: '\u6253\u5f00',
    folder: '\u76ee\u5f55',
    previewFirst: '\u5148\u9884\u89c8',
    syncConsoleTitle: '\u540c\u6b65\u63a7\u5236\u53f0',
    syncConsoleCopy: '\u9009\u62e9\u4e00\u4e2a\u65b9\u5411\uff0c\u5de5\u4f5c\u7ad9\u4f1a\u81ea\u52a8\u5217\u51fa\u53ef\u540c\u6b65\u9879\u3002\u9ed8\u8ba4\u53ea\u52fe\u9009\u65b0\u589e\u9879\uff1b\u5df2\u6709\u5dee\u5f02\u7684\u9879\u76ee\u9700\u8981\u4f60\u624b\u52a8\u786e\u8ba4\u3002',
    directionToHub: '\u6c47\u603b\u5230 Hub',
    directionToHubCopy: '\u4ece Claude / Codex \u6536\u96c6 Skills\uff0c\u653e\u8fdb\u7edf\u4e00\u4e2d\u67a2\u3002',
    directionFromHub: '\u5206\u53d1\u5230 Agent',
    directionFromHubCopy: '\u4ece Hub \u5206\u53d1\u5230 Claude / Codex\u3002',
    adapterEyebrow: 'Adapters',
    adapterTitle: 'Agent \u63a5\u5165\u72b6\u6001',
    adapterCopy: '\u4ee5 Hub \u4e3a\u771f\u6e90\uff0c\u770b\u6bcf\u4e2a Agent \u5df2\u8bfb\u5230\u54ea\u4e9b\u5171\u4eab\u5c42\u3002',
    refreshAdapters: '\u5237\u65b0\u63a5\u5165',
    readHub: '\u8bfb Hub',
    writeHub: '\u5199\u56de Hub',
    readOnlyMode: '\u53ea\u8bfb',
    adapterNeedsExport: '\u9700\u8981\u5206\u53d1',
    adapterConnected: '\u5df2\u63a5\u5165',
    adapterReadOnly: '\u53ea\u8bfb\u6a21\u5f0f',
    layerProfile: 'Profile',
    layerGlobalMemory: 'Memory',
    layerProjectContext: 'Project',
    layerSkills: 'Skills',
    layerInbox: 'Inbox',
    skillsCoverage: 'Skills {installed}/{total}',
    currentDirection: '\u5f53\u524d\u65b9\u5411',
    selectAll: '\u5168\u9009',
    selectNone: '\u5168\u4e0d\u9009',
    runSync: '\u6267\u884c\u540c\u6b65',
    rules: '\u89c4\u5219',
    safeWriteRules: '\u5b89\u5168\u5199\u5165\u539f\u5219',
    syncStep1Title: '1. \u4ee5\u4e2d\u67a2\u4e3a\u771f\u6e90',
    syncStep1Body: '\u628a\u7a33\u5b9a\u504f\u597d\u3001\u8bb0\u5fc6\u3001Skills \u548c\u9879\u76ee\u7b14\u8bb0\u7edf\u4e00\u653e\u5728\u5de5\u4f5c\u7ad9\u4e2d\u67a2\u91cc\u3002',
    syncStep2Title: '2. \u901a\u8fc7\u9002\u914d\u5668\u5bfc\u51fa',
    syncStep2Body: '\u628a\u9009\u4e2d\u7684 Skills \u548c\u6307\u4ee4\u6309 Claude / Codex \u7684\u76ee\u5f55\u7ea6\u5b9a\u5bfc\u51fa\u3002',
    syncStep3Title: '3. \u5199\u5165\u524d\u5148\u770b\u5dee\u5f02',
    syncStep3Body: '\u6240\u6709\u5199\u5165\u90fd\u5148\u5c55\u793a\u9884\u89c8\uff0c\u9ed8\u8ba4 merge\uff1bmirror \u5fc5\u987b\u662f\u660e\u786e\u64cd\u4f5c\u3002',
    registry: '\u6ce8\u518c\u8868',
    installedSkills: '\u5df2\u5b89\u88c5 Skills',
    memoryLayers: '\u5171\u4eab\u4e0a\u4e0b\u6587\u5c42',
    memoryCopy: 'Profile \u653e\u7a33\u5b9a\u504f\u597d\uff0cMemory \u653e\u957f\u671f\u4e8b\u5b9e\uff0c\u9879\u76ee\u7b14\u8bb0\u653e\u672c\u9879\u76ee\u51b3\u7b56\u3002',
    reloadMemory: '\u91cd\u65b0\u8bfb\u53d6',
    saveMemory: '\u4fdd\u5b58',
    appendInbox: '\u8ffd\u52a0',
    inboxPlaceholder: '\u5199\u4e00\u6761\u4e34\u65f6\u6d88\u606f\uff0c\u8ffd\u52a0\u5230 Inbox',
    memorySaved: '\u5df2\u4fdd\u5b58\u5230 Hub',
    memoryLoaded: '\u5df2\u8bfb\u53d6 Hub \u5185\u5bb9',
    inboxAppended: '\u5df2\u8ffd\u52a0\u5230 Inbox',
    readOnlyDoc: '\u8fd9\u4e2a\u6587\u6863\u662f\u8ffd\u52a0\u5f0f\u8bb0\u5f55\uff0c\u8bf7\u7528\u4e0b\u65b9\u8f93\u5165\u6846\u5199\u5165\u65b0\u6d88\u606f\u3002',
    memoryImportEyebrow: '\u63d0\u70bc',
    memoryImportTitle: '\u4ece\u73b0\u6709 Agent \u63d0\u53d6\u8bb0\u5fc6',
    memoryImportCopy: '\u53ea\u751f\u6210\u5019\u9009\u6458\u8981\uff0c\u4e0d\u4f1a\u81ea\u52a8\u5bfc\u5165\u5386\u53f2\u4f1a\u8bdd\u3002\u52fe\u9009\u540e\u624d\u5199\u5165 Hub\u3002',
    scanMemory: '\u626b\u63cf\u5019\u9009',
    importSelectedMemory: '\u5bfc\u5165\u9009\u4e2d\u8bb0\u5fc6',
    noMemoryCandidates: '\u6682\u65f6\u6ca1\u6709\u53ef\u5bfc\u5165\u7684\u5019\u9009\u8bb0\u5fc6\u3002',
    memoryImportDone: '\u8bb0\u5fc6\u5bfc\u5165\u5b8c\u6210',
    memoryImportNone: '\u8bf7\u5148\u52fe\u9009\u8981\u5bfc\u5165\u7684\u5019\u9009\u3002',
    target: '\u76ee\u6807',
    source: '\u6765\u6e90',
    contextExportEyebrow: '\u5206\u53d1',
    contextExportTitle: '\u628a Hub \u5185\u5bb9\u5199\u7ed9 Agent',
    contextExportCopy: '\u53ea\u66f4\u65b0 AGENT-WORKSTATION \u6258\u7ba1\u533a\u5757\uff0c\u4e0d\u8986\u76d6\u533a\u5757\u5916\u7684\u539f\u6709\u5185\u5bb9\u3002',
    reloadPreview: '\u5237\u65b0\u9884\u89c8',
    exportContext: '\u5206\u53d1\u7ed9\u9009\u4e2d Agent',
    contextExportDone: '\u4e0a\u4e0b\u6587\u5206\u53d1\u5b8c\u6210',
    contextExportNone: '\u8bf7\u5148\u9009\u62e9\u8981\u5206\u53d1\u7684 Agent\u3002',
    hubIndexEyebrow: 'Hub Index',
    hubIndexTitle: '\u865a\u62df\u6811\u4e0e\u53d8\u66f4\u6d41',
    hubIndexCopy: '\u628a Hub \u5185\u5bb9\u6309 neuDrive \u5f0f\u6807\u51c6\u8def\u5f84\u5c55\u5f00\uff0c\u4f9b\u4e0d\u540c Agent \u8bfb\u53d6\u540c\u4e00\u4efd\u5185\u5bb9\u7d22\u5f15\u3002',
    refreshIndex: '\u5237\u65b0\u7d22\u5f15',
    virtualTree: '\u865a\u62df\u6587\u4ef6\u6811',
    changeStream: '\u53d8\u66f4\u6d41',
    noChanges: '\u6682\u65f6\u8fd8\u6ca1\u6709\u53d8\u66f4\u8bb0\u5f55\u3002',
    noHubNodes: '\u8fd8\u6ca1\u6709\u53ef\u5c55\u793a\u7684 Hub \u8282\u70b9\u3002',
    projects: '\u9879\u76ee',
    projectRegistry: '\u9879\u76ee\u6ce8\u518c\u8868',
    projectCopy: '\u7b2c\u4e00\u4e2a\u63a5\u5165\u7684\u5e94\u7528\u662f\u4f60\u7684\u56fe\u50cf\u751f\u6210\u5de5\u4f5c\u53f0\u3002\u540e\u7eed\u9879\u76ee\u53ef\u4ee5\u6ce8\u518c\u8fdb\u6765\uff0c\u4e0d\u9700\u8981\u79fb\u52a8\u6e90\u7801\u76ee\u5f55\u3002',
    appDock: '\u5e94\u7528\u575e',
    imageGenerationWorkbench: '\u56fe\u50cf\u751f\u6210\u5de5\u4f5c\u53f0',
    launchApp: '\u542f\u52a8\u5e94\u7528',
    separateAppTitle: '\u4f5c\u4e3a\u72ec\u7acb\u672c\u5730\u5e94\u7528\u8fd0\u884c',
    separateAppBody: '\u5de5\u4f5c\u7ad9\u53ea\u8d1f\u8d23\u542f\u52a8\u5b83\u7684\u670d\u52a1\u5e76\u6253\u5f00\u73b0\u6709\u5730\u5740\uff0c\u4e0d\u4f1a\u628a\u56fe\u7247\u5de5\u4f5c\u7ad9\u6587\u4ef6\u590d\u5236\u8fdb\u672c\u9879\u76ee\u3002',
    scanning: '\u626b\u63cf\u4e2d',
    ready: '\u5c31\u7eea',
    error: '\u9519\u8bef',
    launching: '\u542f\u52a8\u4e2d',
    importing: '\u540c\u6b65\u4e2d',
    linked: '\u5df2\u63a5\u5165',
    missing: '\u672a\u627e\u5230',
    tracked: '\u4e2a\u6761\u76ee',
    noSkills: '\u8fd9\u4e2a\u6765\u6e90\u8fd8\u6ca1\u6709\u53d1\u73b0 Skills\u3002',
    noSyncPreview: '\u6b63\u5728\u8bfb\u53d6\u53ef\u540c\u6b65\u9879\u3002',
    noPlanItems: '\u8fd9\u4e2a\u65b9\u5411\u6682\u65f6\u6ca1\u6709\u53ef\u540c\u6b65\u9879\u3002',
    planSummary: '\u65b0\u589e {newCount}\uff0c\u6709\u5dee\u5f02 {changedCount}\uff0c\u5df2\u540c\u6b65 {sameCount}',
    importDone: '\u5bfc\u5165\u5b8c\u6210',
    exportDone: '\u5bfc\u51fa\u5b8c\u6210',
    importNone: '\u8bf7\u5148\u52fe\u9009\u8981\u5bfc\u5165\u7684 Skill\u3002',
    exportNone: '\u8bf7\u5148\u52fe\u9009\u8981\u5bfc\u51fa\u7684\u76ee\u6807\u3002',
    statusNew: '\u65b0\u589e',
    statusChanged: '\u6709\u5dee\u5f02',
    statusSame: '\u5df2\u540c\u6b65',
    pathNotFound: '\u8def\u5f84\u672a\u627e\u5230',
    viewOverview: '\u603b\u89c8',
    viewSync: 'Agent \u540c\u6b65',
    viewAihot: 'AI \u70ed\u70b9',
    viewSkills: 'Skills',
    viewMemory: '\u8bb0\u5fc6\u5e93',
    viewProjects: '\u9879\u76ee\u5e93',
    viewApps: '\u5e94\u7528',
  },
  en: {
    localHub: 'Local Hub',
    navOverview: 'Overview',
    navSync: 'Agent Sync',
    navAihot: 'AI Hot',
    navMemory: 'Memory',
    navProjects: 'Projects',
    navApps: 'Apps',
    hubRoot: 'Hub Root',
    openFolder: 'Open Folder',
    tagline: 'Shared context station',
    refresh: 'Refresh',
    hubSkills: 'Hub Skills',
    memoryFiles: 'Memory Files',
    syncMap: 'Sync Map',
    skillCoverage: 'Skill Coverage',
    builtInApp: 'Built-in App',
    imageWorkbench: 'Image Workbench',
    imageCopy: 'Keep the image generation project independent while launching it from this workstation.',
    connectionMethods: 'Connection panel',
    connectionHint: 'Only authorized adapters count as connected. Local folders are marked as detected.',
    manageConnections: 'Manage connections',
    statAll: 'All',
    connections: 'Connections',
    files: 'Files',
    editMemory: 'Edit memory',
    exportAll: 'Export all',
    searchFiles: 'Search files',
    summary: 'Summary',
    connected: 'Connected',
    notConnected: 'Not connected',
    detected: 'Detected',
    localReady: 'Local ready',
    linkedApp: 'Linked app',
    storage: 'Storage',
    lastSync: 'Last sync',
    folders: 'Folders',
    pending: 'Pending',
    folderType: 'Folder',
    fileType: 'File',
    sourceHub: 'Hub',
    sourceAgent: 'Agent',
    sourceSystem: 'System',
    noDashboardFiles: 'No matching Hub items.',
    aihotTitle: 'AI Intel Desk',
    aihotCopy: 'Bring AI HOT selected news into the local workstation, grouped by models, products, industry, papers, and tactics.',
    aihotSearchPlaceholder: 'Search OpenAI / Sora / RAG',
    aihotCategoryAll: 'All categories',
    aihotCategoryModels: 'Model releases',
    aihotCategoryProducts: 'Product updates',
    aihotCategoryIndustry: 'Industry',
    aihotCategoryPaper: 'Papers',
    aihotCategoryTip: 'Tactics',
    aihotModeSelected: 'Selected',
    aihotModeAll: 'All',
    aihotRefresh: 'Refresh Intel',
    aihotPrinciple1Title: 'Selected first',
    aihotPrinciple1Body: 'Default to the curated pool so repeated events and weak signals do not flood your workflow.',
    aihotPrinciple2Title: 'Scan by task',
    aihotPrinciple2Body: 'Jump straight to models, products, or papers instead of fishing through a raw timeline.',
    aihotPrinciple3Title: 'Return to source',
    aihotPrinciple3Body: 'Every item keeps the original source link for judgment before action.',
    aihotFeedEyebrow: 'Selected Stream',
    aihotFeedTitle: 'Selected Updates',
    aihotDailyEyebrow: 'Daily',
    aihotDailyTitle: 'Daily Report',
    aihotLoading: 'Loading AI HOT...',
    aihotEmpty: 'No matching AI HOT items.',
    aihotOpenSource: 'Open source',
    aihotItemsCount: '{count} selected items',
    aihotDailyDate: 'Daily {date}',
    launch: 'Launch',
    open: 'Open',
    folder: 'Folder',
    previewFirst: 'Preview First',
    syncConsoleTitle: 'Sync Console',
    syncConsoleCopy: 'Choose one direction. The workstation lists syncable items automatically. New items are selected by default; changed items need manual confirmation.',
    directionToHub: 'Collect into Hub',
    directionToHubCopy: 'Collect skills from Claude / Codex into the shared hub.',
    directionFromHub: 'Distribute to Agents',
    directionFromHubCopy: 'Distribute Hub skills into Claude / Codex.',
    adapterEyebrow: 'Adapters',
    adapterTitle: 'Agent Connection Status',
    adapterCopy: 'Use Hub as source of truth and see which shared layers each agent can read.',
    refreshAdapters: 'Refresh Adapters',
    readHub: 'Read Hub',
    writeHub: 'Write Back',
    readOnlyMode: 'Read Only',
    adapterNeedsExport: 'Needs Export',
    adapterConnected: 'Connected',
    adapterReadOnly: 'Read-only Mode',
    layerProfile: 'Profile',
    layerGlobalMemory: 'Memory',
    layerProjectContext: 'Project',
    layerSkills: 'Skills',
    layerInbox: 'Inbox',
    skillsCoverage: 'Skills {installed}/{total}',
    currentDirection: 'Current Direction',
    selectAll: 'Select All',
    selectNone: 'Select None',
    runSync: 'Run Sync',
    rules: 'Rules',
    safeWriteRules: 'Safe Write Rules',
    syncStep1Title: '1. Hub as source',
    syncStep1Body: 'Keep canonical profile, memory, skills, and project notes under the workstation hub.',
    syncStep2Title: '2. Adapter export',
    syncStep2Body: 'Export selected skills and instructions into Claude and Codex paths with platform-specific notes.',
    syncStep3Title: '3. Diff before apply',
    syncStep3Body: 'Every write operation should show a preview, then merge. Mirror stays a deliberate action.',
    registry: 'Registry',
    installedSkills: 'Installed Skills',
    memoryLayers: 'Shared Context Layers',
    memoryCopy: 'Use profile for stable preferences, memory for durable facts, and project notes for local decisions.',
    reloadMemory: 'Reload',
    saveMemory: 'Save',
    appendInbox: 'Append',
    inboxPlaceholder: 'Write a temporary note and append it to Inbox',
    memorySaved: 'Saved to Hub',
    memoryLoaded: 'Loaded Hub content',
    inboxAppended: 'Appended to Inbox',
    readOnlyDoc: 'This document is append-only. Use the input below to add a new message.',
    memoryImportEyebrow: 'Extract',
    memoryImportTitle: 'Extract Memory From Existing Agents',
    memoryImportCopy: 'Creates short candidates only. Historical chats are imported into Hub only after you select them.',
    scanMemory: 'Scan Candidates',
    importSelectedMemory: 'Import Selected Memory',
    noMemoryCandidates: 'No memory candidates found yet.',
    memoryImportDone: 'Memory import complete',
    memoryImportNone: 'Select at least one candidate first.',
    target: 'Target',
    source: 'Source',
    contextExportEyebrow: 'Distribute',
    contextExportTitle: 'Write Hub content to Agents',
    contextExportCopy: 'Only updates the AGENT-WORKSTATION managed block and keeps existing content outside it.',
    reloadPreview: 'Reload Preview',
    exportContext: 'Export to Selected Agents',
    contextExportDone: 'Context export complete',
    contextExportNone: 'Select at least one agent first.',
    hubIndexEyebrow: 'Hub Index',
    hubIndexTitle: 'Virtual Tree and Change Stream',
    hubIndexCopy: 'Expose Hub content through neuDrive-style canonical paths so different agents can read the same content index.',
    refreshIndex: 'Refresh Index',
    virtualTree: 'Virtual File Tree',
    changeStream: 'Change Stream',
    noChanges: 'No changes recorded yet.',
    noHubNodes: 'No Hub nodes to show yet.',
    projects: 'Projects',
    projectRegistry: 'Project Registry',
    projectCopy: 'The first linked app is your image generation workbench. More projects can be registered without moving their source folders.',
    appDock: 'App Dock',
    imageGenerationWorkbench: 'Image Generation Workbench',
    launchApp: 'Launch App',
    separateAppTitle: 'Runs as a separate local app',
    separateAppBody: 'The workstation starts its server and opens the existing app URL. No files are copied into this project.',
    scanning: 'Scanning',
    ready: 'Ready',
    error: 'Error',
    launching: 'Launching',
    importing: 'Syncing',
    linked: 'Linked',
    missing: 'Missing',
    tracked: 'tracked',
    noSkills: 'No skills found in this source yet.',
    noSyncPreview: 'Loading syncable items.',
    noPlanItems: 'No syncable items in this direction yet.',
    planSummary: 'New {newCount}, changed {changedCount}, in sync {sameCount}',
    importDone: 'Import complete',
    exportDone: 'Export complete',
    importNone: 'Select at least one skill to import.',
    exportNone: 'Select at least one target to export.',
    statusNew: 'New',
    statusChanged: 'Changed',
    statusSame: 'In Sync',
    pathNotFound: 'Path not found',
    viewOverview: 'Overview',
    viewSync: 'Agent Sync',
    viewAihot: 'AI Hot',
    viewSkills: 'Skills',
    viewMemory: 'Memory',
    viewProjects: 'Projects',
    viewApps: 'Apps',
  },
};

let lang = localStorage.getItem('agentWorkstationLanguage') || 'zh';
let state = null;
let skillSource = 'claude';
let syncMode = 'toHub';
let plan = null;
let adapters = null;
let hubDocuments = [];
let activeHubDocumentKey = 'profile';
let memoryImportPreview = null;
let contextPreview = null;
let hubSnapshot = null;
let hubChanges = null;
let aihotItems = null;
let aihotDaily = null;

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
document.querySelectorAll('.mini-tab').forEach(button => {
  button.addEventListener('click', () => {
    skillSource = button.dataset.skillSource;
    document.querySelectorAll('.mini-tab').forEach(item => item.classList.toggle('active', item === button));
    renderSkills();
  });
});
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openPath(button.dataset.open)));
document.querySelectorAll('.direction-card').forEach(button => button.addEventListener('click', () => setSyncMode(button.dataset.direction)));
document.querySelectorAll('[data-view-jump]').forEach(button => button.addEventListener('click', () => setView(button.dataset.viewJump)));

els.refresh.addEventListener('click', loadState);
els.launchImage.addEventListener('click', launchImageWorkbench);
els.launchImageAlt.addEventListener('click', launchImageWorkbench);
els.selectAll.addEventListener('click', selectAll);
els.clearSelection.addEventListener('click', clearSelection);
els.runSync.addEventListener('click', runSync);
els.reloadAdapters?.addEventListener('click', loadAdapters);
els.reloadMemory.addEventListener('click', loadHubDocuments);
els.saveMemory.addEventListener('click', saveActiveHubDocument);
els.appendInbox.addEventListener('click', appendInboxMessage);
els.scanMemoryImport?.addEventListener('click', loadMemoryImportPreview);
els.importMemory?.addEventListener('click', importSelectedMemory);
els.reloadContextPreview.addEventListener('click', loadContextPreview);
els.exportContext.addEventListener('click', exportContextToAgents);
els.reloadHubIndex?.addEventListener('click', loadHubIndex);
els.dashboardSearch?.addEventListener('input', renderDashboardFiles);
els.dashboardTypeFilter?.addEventListener('change', renderDashboardFiles);
els.dashboardSourceFilter?.addEventListener('change', renderDashboardFiles);
els.aihotRefresh?.addEventListener('click', loadAihot);
els.aihotSearch?.addEventListener('keydown', event => {
  if (event.key === 'Enter') loadAihot();
});
els.aihotCategory?.addEventListener('change', loadAihot);
els.aihotMode?.addEventListener('change', loadAihot);
els.languageToggle.addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('agentWorkstationLanguage', lang);
  applyLanguage();
  renderState();
  renderPlan();
  renderAdapters();
  renderHubDocuments();
  renderMemoryImportPreview();
  renderContextPreview();
  renderHubIndex();
  renderAihot();
});

applyLanguage();
loadState();

function setView(view) {
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  document.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === `${view}View`));
  els.title.textContent = t(`view${view[0].toUpperCase()}${view.slice(1)}`) || t('viewOverview');
  if (view === 'sync') {
    if (!adapters) loadAdapters();
    if (!plan) loadPlan();
  }
  if (view === 'memory') {
    if (!hubDocuments.length) loadHubDocuments();
    if (!memoryImportPreview) loadMemoryImportPreview();
    if (!contextPreview) loadContextPreview();
    if (!hubSnapshot) loadHubIndex();
  }
  if (view === 'aihot' && !aihotItems) {
    loadAihot();
  }
}

function setSyncMode(mode) {
  syncMode = mode;
  plan = null;
  document.querySelectorAll('.direction-card').forEach(button => button.classList.toggle('active', button.dataset.direction === mode));
  els.syncResult.textContent = '';
  renderPlan();
  loadPlan();
}

async function loadState() {
  setStatus('scanning');
  try {
    const response = await fetch('/api/state');
    if (!response.ok) throw new Error('State scan failed');
    state = await response.json();
    renderState();
    setStatus('ready');
  } catch (error) {
    setStatus('error');
    console.error(error);
  }
}

async function loadPlan() {
  setStatus('scanning');
  els.syncResult.textContent = '';
  const endpoint = syncMode === 'toHub' ? '/api/skill-sync-preview' : '/api/skill-export-preview';
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Preview failed');
    plan = await response.json();
    renderPlan();
    setStatus('ready');
  } catch (error) {
    setStatus('error');
    els.syncResult.textContent = error.message;
  }
}

async function loadAdapters() {
  setStatus('scanning');
  try {
    const response = await fetch('/api/agent-adapters');
    if (!response.ok) throw new Error('Adapter scan failed');
    adapters = await response.json();
    renderAdapters();
    setStatus('ready');
  } catch (error) {
    setStatus('error');
    if (els.adapterMeta) els.adapterMeta.textContent = error.message;
  }
}

function renderState() {
  if (!state) return;
  els.hubPath.textContent = state.paths.hubRoot;
  els.imagePath.textContent = state.paths.imageWorkbench;
  els.imageAppStatus.textContent = state.imageWorkbench.exists ? t('linked') : t('missing');
  els.projectState.textContent = state.imageWorkbench.exists ? state.paths.imageWorkbench : t('pathNotFound');
  els.claudeSkillCount.textContent = state.counts.claudeSkills;
  els.codexSkillCount.textContent = state.counts.codexSkills;
  els.hubSkillCount.textContent = state.counts.hubSkills;
  els.memoryCount.textContent = state.counts.memoryFiles;
  renderDashboard();
  renderCoverage();
  renderSkills();
}

function renderDashboard() {
  renderConnectionMethods();
  renderDashboardStats();
  renderDashboardFiles();
  renderDashboardSummary();
}

function renderConnectionMethods() {
  if (!els.connectionMethodGrid || !state) return;
  const methods = [
    {
      id: 'claude-code',
      name: 'Claude Code',
      description: lang === 'zh' ? '本地 skills 目录' : 'Local skills folder',
      status: state.counts.claudeSkills > 0 ? 'detected' : 'notConnected',
      view: 'skills',
    },
    {
      id: 'codex',
      name: 'Codex',
      description: lang === 'zh' ? '本地 skills 目录' : 'Local skills folder',
      status: state.counts.codexSkills > 0 ? 'detected' : 'notConnected',
      view: 'skills',
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      description: lang === 'zh' ? '尚未配置 Apps / MCP' : 'Apps / MCP not configured',
      status: 'notConnected',
      view: 'sync',
    },
    {
      id: 'cursor',
      name: 'Cursor',
      description: lang === 'zh' ? '尚未发现 adapter' : 'No adapter detected',
      status: 'notConnected',
      view: 'sync',
    },
    {
      id: 'windsurf',
      name: 'Windsurf',
      description: lang === 'zh' ? '尚未发现 adapter' : 'No adapter detected',
      status: 'notConnected',
      view: 'sync',
    },
    {
      id: 'gemini',
      name: 'Gemini CLI',
      description: lang === 'zh' ? '尚未发现 adapter' : 'No adapter detected',
      status: 'notConnected',
      view: 'sync',
    },
    {
      id: 'browser',
      name: lang === 'zh' ? '浏览器扩展' : 'Browser Extension',
      description: lang === 'zh' ? '尚未安装导入器' : 'Importer not installed',
      view: 'sync',
      status: 'notConnected',
    },
    {
      id: 'api',
      name: 'REST API / SDK',
      description: lang === 'zh' ? '本地服务已启动' : 'Local service is running',
      status: 'localReady',
      view: 'projects',
    },
  ];
  els.connectionMethodGrid.innerHTML = '';
  methods.forEach(method => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `connection-method-card ${method.status}`;
    card.addEventListener('click', () => setView(method.view));

    const icon = document.createElement('span');
    icon.className = `connection-icon connection-${method.id}`;
    icon.textContent = method.name.slice(0, 2).toUpperCase();

    const copy = document.createElement('span');
    copy.className = 'connection-copy';
    copy.append(textNode('strong', method.name), textNode('small', method.description), textNode('em', connectionStatusLabel(method.status)));
    card.append(icon, copy);
    els.connectionMethodGrid.appendChild(card);
  });
}

function connectionStatusLabel(status) {
  if (status === 'connected') return t('connected');
  if (status === 'detected') return t('detected');
  if (status === 'localReady') return t('localReady');
  if (status === 'linked') return t('linkedApp');
  return t('notConnected');
}

function renderDashboardStats() {
  if (!state) return;
  const all = state.counts.hubSkills + state.counts.memoryFiles + state.counts.projects + state.counts.messages;
  if (els.dashboardAllCount) els.dashboardAllCount.textContent = all;
  if (els.dashboardProjectCount) els.dashboardProjectCount.textContent = state.counts.projects;
  if (els.dashboardConnectionCount) els.dashboardConnectionCount.textContent = dashboardConnectionCount();
}

function dashboardFileRows() {
  if (!state) return [];
  const hubSkillRows = (state.skills.hub || []).map(skill => ({
    name: skill.folder,
    type: 'folder',
    source: 'hub',
    sourceLabel: lang === 'zh' ? 'Hub Skill' : 'Hub Skill',
    count: 1,
    countLabel: 'Skill',
    updatedAt: skill.updatedAt,
    view: 'skills',
  }));
  return [
    {
      name: 'skills',
      type: 'folder',
      source: 'hub',
      sourceLabel: 'Hub',
      count: state.counts.hubSkills,
      updatedAt: latestSkillDate(state.skills.hub),
      view: 'skills',
    },
    ...hubSkillRows,
    {
      name: 'memory',
      type: 'folder',
      source: 'hub',
      sourceLabel: 'Hub',
      count: state.counts.memoryFiles,
      updatedAt: state.generatedAt,
      view: 'memory',
    },
    {
      name: 'projects',
      type: 'folder',
      source: 'hub',
      sourceLabel: 'Hub',
      count: state.counts.projects,
      updatedAt: state.generatedAt,
      view: 'projects',
    },
    {
      name: 'agent-routing.md',
      type: 'file',
      source: 'system',
      sourceLabel: t('sourceSystem'),
      count: 1,
      updatedAt: state.generatedAt,
      view: 'memory',
    },
    {
      name: 'claude-skills',
      type: 'folder',
      source: 'agent',
      sourceLabel: 'Claude',
      count: state.counts.claudeSkills,
      updatedAt: latestSkillDate(state.skills.claude),
      view: 'skills',
    },
    {
      name: 'codex-skills',
      type: 'folder',
      source: 'agent',
      sourceLabel: 'Codex',
      count: state.counts.codexSkills,
      updatedAt: latestSkillDate(state.skills.codex),
      view: 'skills',
    },
  ];
}

function renderDashboardFiles() {
  if (!els.dashboardFileList) return;
  const query = (els.dashboardSearch?.value || '').trim().toLowerCase();
  const typeFilter = els.dashboardTypeFilter?.value || 'all';
  const sourceFilter = els.dashboardSourceFilter?.value || 'all';
  const rows = dashboardFileRows().filter(row => {
    if (query && !row.name.toLowerCase().includes(query)) return false;
    if (typeFilter !== 'all' && row.type !== typeFilter) return false;
    if (sourceFilter !== 'all' && row.source !== sourceFilter) return false;
    return true;
  });
  els.dashboardFileList.innerHTML = '';
  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'quiet-copy';
    empty.textContent = t('noDashboardFiles');
    els.dashboardFileList.appendChild(empty);
    return;
  }
  rows.forEach(row => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'dashboard-file-row';
    item.addEventListener('click', () => setView(row.view));
    item.append(
      textNode('span', row.type === 'folder' ? '>' : '-'),
      textNode('strong', row.name),
      textNode('span', row.type === 'folder' ? t('folderType') : t('fileType')),
      textNode('span', row.sourceLabel),
      textNode('span', row.countLabel || `${row.count}`),
      textNode('span', formatDate(row.updatedAt)),
    );
    els.dashboardFileList.appendChild(item);
  });
}

function renderDashboardSummary() {
  if (!els.dashboardSummaryList || !state) return;
  const summary = [
    [t('connections'), dashboardConnectionCount()],
    [t('storage'), formatBytes(estimatedStorageBytes())],
    [t('lastSync'), formatDate(state.generatedAt)],
    [t('folders'), 6],
    [t('pending'), pendingSyncCount()],
  ];
  els.dashboardSummaryList.innerHTML = '';
  summary.forEach(([label, value]) => {
    const item = document.createElement('article');
    item.className = 'dashboard-summary-item';
    item.append(textNode('span', label), textNode('strong', String(value)));
    els.dashboardSummaryList.appendChild(item);
  });
}

function dashboardConnectionCount() {
  return 0;
}

function pendingSyncCount() {
  if (!state) return 0;
  return state.skills.matrix.filter(item => !item.hub || !item.claude || !item.codex).length;
}

function estimatedStorageBytes() {
  if (!state) return 0;
  const skills = [...state.skills.claude, ...state.skills.codex, ...state.skills.hub];
  return skills.reduce((total, skill) => total + (Number(skill.size) || 0), 0);
}

function latestSkillDate(skills) {
  const latest = (skills || []).reduce((max, skill) => {
    const time = new Date(skill.updatedAt || 0).getTime();
    return Number.isFinite(time) && time > max ? time : max;
  }, 0);
  return latest ? new Date(latest).toISOString() : state?.generatedAt;
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  if (value < 1024) return `${value} B`;
  const kib = value / 1024;
  if (kib < 1024) return `${kib.toFixed(kib >= 10 ? 0 : 1)} KiB`;
  const mib = kib / 1024;
  return `${mib.toFixed(mib >= 10 ? 0 : 1)} MiB`;
}

function renderCoverage() {
  const rows = state.skills.matrix;
  els.coverageMeta.textContent = `${rows.length} ${t('tracked')}`;
  els.coverageList.innerHTML = '';
  rows.slice(0, 14).forEach(item => {
    const row = document.createElement('article');
    row.className = 'coverage-row';
    row.append(textNode('strong', item.name), chip('Hub', item.hub), chip('Claude', item.claude), chip('Codex', item.codex));
    els.coverageList.appendChild(row);
  });
}

function renderSkills() {
  if (!state) return;
  const skills = state.skills[skillSource] || [];
  els.skillList.innerHTML = '';
  if (!skills.length) {
    const empty = document.createElement('p');
    empty.className = 'quiet-copy';
    empty.textContent = t('noSkills');
    els.skillList.appendChild(empty);
    return;
  }
  skills.forEach(skill => {
    const row = document.createElement('article');
    row.className = 'skill-row';
    const copy = document.createElement('div');
    copy.append(textNode('strong', skill.name), textNode('p', skillDescription(skill)));
    const meta = document.createElement('code');
    meta.textContent = skill.folder;
    row.append(copy, meta);
    els.skillList.appendChild(row);
  });
}

function renderPlan() {
  const directionText = syncMode === 'toHub' ? t('directionToHub') : t('directionFromHub');
  els.syncDirectionLabel.textContent = directionText;
  const candidates = plan?.candidates || [];
  const counts = countStatuses(candidates);
  els.planSummary.textContent = candidates.length
    ? t('planSummary').replace('{newCount}', counts.new).replace('{changedCount}', counts.changed).replace('{sameCount}', counts.same)
    : t('noPlanItems');
  renderPlanTable(candidates);
}

function renderAdapters() {
  if (!els.adapterGrid) return;
  const rows = adapters?.adapters || [];
  els.adapterGrid.innerHTML = '';
  els.adapterMeta.textContent = adapters ? `cursor ${adapters.latestCursor}` : '-';
  rows.forEach(adapter => {
    const card = document.createElement('article');
    card.className = `adapter-card ${adapter.mode === 'read_hub' ? 'connected' : 'needs-export'}`;
    const head = document.createElement('div');
    head.className = 'adapter-card-head';
    const title = document.createElement('div');
    title.append(textNode('strong', adapter.label), textNode('span', adapter.context.path));
    head.append(title, adapterStatus(adapter));

    const toggles = document.createElement('div');
    toggles.className = 'adapter-toggles';
    toggles.append(
      modePill(t('readHub'), adapter.mode === 'read_hub'),
      modePill(t('writeHub'), false),
      modePill(t('readOnlyMode'), adapter.writePolicy === 'read_only'),
    );

    const layers = document.createElement('div');
    layers.className = 'adapter-layers';
    Object.entries({
      profile: t('layerProfile'),
      globalMemory: t('layerGlobalMemory'),
      projectContext: t('layerProjectContext'),
      skills: t('layerSkills'),
      inbox: t('layerInbox'),
    }).forEach(([key, label]) => {
      layers.append(modePill(label, Boolean(adapter.readLayers[key])));
    });

    const skillLine = document.createElement('p');
    skillLine.className = 'adapter-skill-line';
    skillLine.textContent = t('skillsCoverage')
      .replace('{installed}', adapter.skills.installed)
      .replace('{total}', adapter.skills.totalHub);
    if (adapter.skills.missing) {
      skillLine.textContent += ` / missing ${adapter.skills.missing}`;
    }

    card.append(head, toggles, layers, skillLine);
    els.adapterGrid.appendChild(card);
  });
}

function adapterStatus(adapter) {
  const span = document.createElement('span');
  span.className = `adapter-status ${adapter.mode === 'read_hub' ? 'connected' : 'needs-export'}`;
  span.textContent = adapter.mode === 'read_hub' ? t('adapterConnected') : t('adapterNeedsExport');
  return span;
}

function modePill(label, active) {
  const span = document.createElement('span');
  span.className = `mode-pill${active ? ' on' : ''}`;
  span.textContent = label;
  return span;
}

function renderPlanTable(candidates) {
  els.syncTable.innerHTML = '';
  if (!candidates.length) {
    const empty = document.createElement('p');
    empty.className = 'quiet-copy';
    empty.textContent = t('noSyncPreview');
    els.syncTable.appendChild(empty);
    return;
  }
  const header = document.createElement('div');
  header.className = 'sync-row sync-header';
  ['', 'Skill', syncMode === 'toHub' ? 'Source' : 'Target', 'Status'].forEach(text => header.append(textNode('span', text)));
  els.syncTable.appendChild(header);
  candidates.forEach(candidate => {
    const row = document.createElement('label');
    row.className = `sync-row ${candidate.status}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = candidate.id;
    checkbox.disabled = candidate.status === 'same';
    checkbox.checked = candidate.status === 'new';
    const name = document.createElement('span');
    name.append(textNode('strong', candidate.name), textNode('small', `${candidate.folder} · ${skillDescription(candidate)}`));
    row.append(
      checkbox,
      name,
      textNode('span', syncMode === 'toHub' ? candidate.sourceLabel : candidate.targetLabel),
      statusBadge(candidate.status),
    );
    els.syncTable.appendChild(row);
  });
}

function selectAll() {
  els.syncTable.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(input => {
    input.checked = true;
  });
}

function clearSelection() {
  els.syncTable.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.checked = false;
  });
}

function skillDescription(skill) {
  if (lang === 'zh') return skill.descriptionZh || skill.description || skill.path || '';
  return skill.description || skill.descriptionZh || skill.path || '';
}

async function runSync() {
  const ids = [...els.syncTable.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);
  if (!ids.length) {
    els.syncResult.textContent = syncMode === 'toHub' ? t('importNone') : t('exportNone');
    return;
  }
  setStatus('importing');
  const endpoint = syncMode === 'toHub' ? '/api/import-skills' : '/api/export-skills';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ids }),
    });
    const payload = await response.json();
    const ok = payload.results?.filter(item => item.ok).length || 0;
    const failed = payload.results?.filter(item => !item.ok).length || 0;
    els.syncResult.textContent = `${syncMode === 'toHub' ? t('importDone') : t('exportDone')}: ${ok} ok, ${failed} failed`;
    await loadState();
    await loadAdapters();
    await loadPlan();
  } catch (error) {
    setStatus('error');
    els.syncResult.textContent = error.message;
  }
}

async function loadHubDocuments() {
  setStatus('scanning');
  try {
    const response = await fetch('/api/hub-documents');
    if (!response.ok) throw new Error('Hub document load failed');
    const payload = await response.json();
    hubDocuments = payload.documents || [];
    if (!hubDocuments.some(doc => doc.key === activeHubDocumentKey)) {
      activeHubDocumentKey = hubDocuments[0]?.key || 'profile';
    }
    renderHubDocuments();
    els.memoryResult.textContent = t('memoryLoaded');
    setStatus('ready');
  } catch (error) {
    setStatus('error');
    els.memoryResult.textContent = error.message;
  }
}

async function loadHubIndex() {
  setStatus('scanning');
  try {
    const [snapshotResponse, changesResponse] = await Promise.all([
      fetch('/api/hub-snapshot?path=/'),
      fetch('/api/hub-changes?since=0&path=/'),
    ]);
    if (!snapshotResponse.ok) throw new Error('Hub snapshot failed');
    if (!changesResponse.ok) throw new Error('Hub changes failed');
    hubSnapshot = await snapshotResponse.json();
    hubChanges = await changesResponse.json();
    renderHubIndex();
    setStatus('ready');
  } catch (error) {
    setStatus('error');
    if (els.hubTreeMeta) els.hubTreeMeta.textContent = error.message;
  }
}

function renderHubIndex() {
  if (!els.hubTreeList) return;
  const nodes = (hubSnapshot?.nodes || [])
    .filter(node => node.path !== '/' && !node.path.startsWith('/system/'))
    .slice(0, 28);
  els.hubTreeMeta.textContent = hubSnapshot
    ? `cursor ${hubSnapshot.cursor} / ${shortHash(hubSnapshot.rootChecksum)}`
    : '-';
  els.hubTreeList.innerHTML = '';
  if (!nodes.length) {
    const empty = document.createElement('p');
    empty.className = 'quiet-copy';
    empty.textContent = t('noHubNodes');
    els.hubTreeList.appendChild(empty);
  } else {
    nodes.forEach(node => {
      const row = document.createElement('article');
      row.className = `hub-node${node.isDirectory ? ' directory' : ''}`;
      const path = document.createElement('span');
      path.append(textNode('strong', node.path), textNode('small', `${node.kind} / ${shortHash(node.checksum)} / ${formatDate(node.updatedAt)}`));
      row.append(path, textNode('code', node.isDirectory ? `${node.size} items` : `${node.size} B`));
      els.hubTreeList.appendChild(row);
    });
  }

  const changes = (hubChanges?.changes || []).slice().reverse();
  els.hubChangesMeta.textContent = hubChanges ? `cursor ${hubChanges.latestCursor}` : '-';
  els.hubChangesList.innerHTML = '';
  if (!changes.length) {
    const empty = document.createElement('p');
    empty.className = 'quiet-copy';
    empty.textContent = t('noChanges');
    els.hubChangesList.appendChild(empty);
    return;
  }
  changes.slice(0, 14).forEach(change => {
    const row = document.createElement('article');
    row.className = 'change-row';
    row.append(
      textNode('strong', `#${change.cursor} ${change.action}`),
      textNode('span', change.path),
      textNode('small', `${change.source || 'agent-workstation'} / ${formatDate(change.createdAt)}`),
    );
    els.hubChangesList.appendChild(row);
  });
}

async function loadAihot() {
  if (!els.aihotList) return;
  setStatus('scanning');
  els.aihotMeta.textContent = t('aihotLoading');
  els.aihotList.innerHTML = `<p class="quiet-copy">${t('aihotLoading')}</p>`;
  try {
    const params = new URLSearchParams({
      mode: els.aihotMode?.value || 'selected',
      take: '24',
    });
    const category = els.aihotCategory?.value || '';
    const query = cleanInput(els.aihotSearch?.value || '');
    if (category) params.set('category', category);
    if (query.length >= 2) params.set('q', query);
    const [itemsResponse, dailyResponse] = await Promise.all([
      fetch(`/api/aihot/items?${params.toString()}`),
      fetch('/api/aihot/daily'),
    ]);
    if (!itemsResponse.ok) throw new Error('AI HOT items failed');
    if (!dailyResponse.ok) throw new Error('AI HOT daily failed');
    aihotItems = await itemsResponse.json();
    aihotDaily = await dailyResponse.json();
    renderAihot();
    setStatus('ready');
  } catch (error) {
    setStatus('error');
    els.aihotMeta.textContent = error.message;
    els.aihotList.innerHTML = '';
    const empty = document.createElement('p');
    empty.className = 'quiet-copy';
    empty.textContent = error.message;
    els.aihotList.appendChild(empty);
  }
}

function renderAihot() {
  if (!els.aihotList) return;
  const items = aihotItems?.items || [];
  els.aihotMeta.textContent = aihotItems ? t('aihotItemsCount').replace('{count}', items.length) : '-';
  els.aihotList.innerHTML = '';
  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'quiet-copy';
    empty.textContent = t('aihotEmpty');
    els.aihotList.appendChild(empty);
  } else {
    items.forEach(item => els.aihotList.appendChild(aihotItemCard(item)));
  }
  renderAihotDaily();
}

function renderAihotDaily() {
  if (!els.aihotDaily || !els.aihotBrief) return;
  els.aihotBrief.innerHTML = '';
  els.aihotDaily.innerHTML = '';
  if (!aihotDaily) return;
  const brief = document.createElement('article');
  brief.className = 'aihot-brief-card';
  brief.append(
    textNode('strong', t('aihotDailyDate').replace('{date}', aihotDaily.date || '-')),
    textNode('span', aihotDaily.lead?.leadParagraph || `${formatDate(aihotDaily.windowStart)} - ${formatDate(aihotDaily.windowEnd)}`),
  );
  els.aihotBrief.appendChild(brief);
  (aihotDaily.sections || []).forEach(section => {
    const row = document.createElement('article');
    row.className = 'aihot-daily-section';
    const items = section.items || [];
    row.append(textNode('strong', section.label || 'Section'), textNode('span', `${items.length}`));
    row.addEventListener('click', () => {
      const first = items[0]?.sourceUrl;
      if (first) window.open(first, '_blank', 'noreferrer');
    });
    els.aihotDaily.appendChild(row);
  });
}

function aihotItemCard(item) {
  const card = document.createElement('article');
  card.className = 'aihot-card';
  const meta = document.createElement('div');
  meta.className = 'aihot-card-meta';
  meta.append(textNode('span', categoryLabel(item.category)), textNode('span', formatDate(item.publishedAt)), textNode('span', item.source || 'AI HOT'));
  const title = document.createElement('a');
  title.href = item.url;
  title.target = '_blank';
  title.rel = 'noreferrer';
  title.textContent = item.title || item.title_en || 'Untitled';
  const summary = textNode('p', item.summary || '');
  const action = document.createElement('a');
  action.className = 'plain-action';
  action.href = item.url;
  action.target = '_blank';
  action.rel = 'noreferrer';
  action.textContent = t('aihotOpenSource');
  card.append(meta, title, summary, action);
  return card;
}

function categoryLabel(category) {
  const map = {
    'ai-models': t('aihotCategoryModels'),
    'ai-products': t('aihotCategoryProducts'),
    industry: t('aihotCategoryIndustry'),
    paper: t('aihotCategoryPaper'),
    tip: t('aihotCategoryTip'),
  };
  return map[category] || t('aihotCategoryAll');
}

function cleanInput(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function renderHubDocuments() {
  if (!els.memoryTabs) return;
  const active = hubDocuments.find(doc => doc.key === activeHubDocumentKey) || hubDocuments[0];
  els.memoryTabs.innerHTML = '';
  hubDocuments.forEach(doc => {
    const button = document.createElement('button');
    button.className = `memory-tab${doc.key === active?.key ? ' active' : ''}`;
    button.type = 'button';
    button.append(textNode('strong', documentTitle(doc)), textNode('span', documentDescription(doc)));
    button.addEventListener('click', () => {
      activeHubDocumentKey = doc.key;
      renderHubDocuments();
    });
    els.memoryTabs.appendChild(button);
  });
  if (!active) return;
  els.memoryTitle.textContent = documentTitle(active);
  els.memoryMeta.textContent = `${active.path} · ${formatDate(active.updatedAt)}`;
  els.memoryEditor.value = active.content || '';
  els.memoryEditor.readOnly = !active.editable;
  els.saveMemory.disabled = !active.editable;
  els.saveMemory.style.display = active.editable ? 'inline-flex' : 'none';
  const inboxMode = active.key === 'inbox';
  document.querySelector('.inbox-composer')?.classList.toggle('active', inboxMode);
  if (inboxMode) els.memoryResult.textContent = t('readOnlyDoc');
}

async function saveActiveHubDocument() {
  const active = hubDocuments.find(doc => doc.key === activeHubDocumentKey);
  if (!active || !active.editable) {
    els.memoryResult.textContent = t('readOnlyDoc');
    return;
  }
  setStatus('importing');
  try {
    const response = await fetch('/api/hub-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: active.key, content: els.memoryEditor.value }),
    });
    if (!response.ok) throw new Error('Save failed');
    els.memoryResult.textContent = t('memorySaved');
    await loadHubDocuments();
    await loadHubIndex();
  } catch (error) {
    setStatus('error');
    els.memoryResult.textContent = error.message;
  }
}

async function appendInboxMessage() {
  const text = els.inboxInput.value.trim();
  if (!text) return;
  setStatus('importing');
  try {
    const response = await fetch('/api/hub-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Append failed');
    els.inboxInput.value = '';
    activeHubDocumentKey = 'inbox';
    els.memoryResult.textContent = t('inboxAppended');
    await loadHubDocuments();
    await loadHubIndex();
  } catch (error) {
    setStatus('error');
    els.memoryResult.textContent = error.message;
  }
}

async function loadMemoryImportPreview() {
  setStatus('scanning');
  try {
    const response = await fetch('/api/memory-import-preview');
    if (!response.ok) throw new Error('Memory import scan failed');
    memoryImportPreview = await response.json();
    renderMemoryImportPreview();
    setStatus('ready');
  } catch (error) {
    setStatus('error');
    if (els.memoryImportResult) els.memoryImportResult.textContent = error.message;
  }
}

function renderMemoryImportPreview() {
  if (!els.memoryImportList) return;
  const candidates = memoryImportPreview?.candidates || [];
  els.memoryImportMeta.textContent = candidates.length ? `${candidates.length} candidates` : '-';
  els.memoryImportList.innerHTML = '';
  if (!candidates.length) {
    const empty = document.createElement('p');
    empty.className = 'quiet-copy';
    empty.textContent = memoryImportPreview ? t('noMemoryCandidates') : t('noSyncPreview');
    els.memoryImportList.appendChild(empty);
    return;
  }
  candidates.forEach(candidate => {
    const row = document.createElement('label');
    row.className = 'memory-candidate';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = candidate.id;
    checkbox.checked = candidate.confidence >= 0.7;
    const copy = document.createElement('span');
    copy.append(
      textNode('strong', candidate.summary),
      textNode('small', `${t('target')}: ${candidate.targetLabel} / ${t('source')}: ${candidate.sourceLabel}`),
      textNode('code', candidate.sourcePath),
    );
    row.append(checkbox, copy);
    els.memoryImportList.appendChild(row);
  });
}

async function importSelectedMemory() {
  const items = [...els.memoryImportList.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);
  if (!items.length) {
    els.memoryImportResult.textContent = t('memoryImportNone');
    return;
  }
  setStatus('importing');
  try {
    const response = await fetch('/api/import-memory-candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) throw new Error('Memory import failed');
    const payload = await response.json();
    const ok = payload.results?.filter(item => item.ok).reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const failed = payload.results?.filter(item => !item.ok).length || 0;
    els.memoryImportResult.textContent = `${t('memoryImportDone')}: ${ok} ok, ${failed} failed`;
    await loadHubDocuments();
    await loadHubIndex();
  } catch (error) {
    setStatus('error');
    els.memoryImportResult.textContent = error.message;
  }
}

async function loadContextPreview() {
  setStatus('scanning');
  try {
    const response = await fetch('/api/context-export-preview');
    if (!response.ok) throw new Error('Context preview failed');
    contextPreview = await response.json();
    renderContextPreview();
    setStatus('ready');
  } catch (error) {
    setStatus('error');
    els.contextResult.textContent = error.message;
  }
}

function renderContextPreview() {
  if (!els.contextTargets) return;
  const targets = contextPreview?.targets || [];
  els.contextTargets.innerHTML = '';
  targets.forEach(target => {
    const label = document.createElement('label');
    label.className = `context-target ${target.status}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = target.id;
    checkbox.checked = target.status !== 'same';
    label.append(
      checkbox,
      textNode('strong', target.label),
      textNode('span', `${statusText(target.status)} · ${target.path}`),
    );
    els.contextTargets.appendChild(label);
  });
  els.contextPreview.textContent = targets[0]?.preview || '';
}

async function exportContextToAgents() {
  const targets = [...els.contextTargets.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);
  if (!targets.length) {
    els.contextResult.textContent = t('contextExportNone');
    return;
  }
  setStatus('importing');
  try {
    const response = await fetch('/api/export-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targets }),
    });
    if (!response.ok) throw new Error('Context export failed');
    const payload = await response.json();
    const ok = payload.results?.filter(item => item.ok).length || 0;
    const failed = payload.results?.filter(item => !item.ok).length || 0;
    els.contextResult.textContent = `${t('contextExportDone')}: ${ok} ok, ${failed} failed`;
    await loadAdapters();
    await loadContextPreview();
    await loadHubIndex();
  } catch (error) {
    setStatus('error');
    els.contextResult.textContent = error.message;
  }
}

function statusText(status) {
  return t(`status${status[0].toUpperCase()}${status.slice(1)}`);
}

function documentTitle(doc) {
  return lang === 'zh' ? (doc.titleZh || doc.title) : (doc.title || doc.titleZh);
}

function documentDescription(doc) {
  return lang === 'zh' ? (doc.descriptionZh || doc.description) : (doc.description || doc.descriptionZh);
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US');
}

function shortHash(value) {
  return String(value || '').slice(0, 10) || '-';
}

function countStatuses(candidates) {
  return candidates.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { new: 0, changed: 0, same: 0 });
}

function statusBadge(status) {
  const span = document.createElement('span');
  span.className = `status-badge ${status}`;
  span.textContent = t(`status${status[0].toUpperCase()}${status.slice(1)}`);
  return span;
}

function chip(label, active) {
  const span = document.createElement('span');
  span.className = `check-chip${active ? ' on' : ''}`;
  span.textContent = active ? label : '-';
  return span;
}

function textNode(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

async function openPath(pathKey) {
  try {
    await fetch('/api/open-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathKey }),
    });
  } catch (error) {
    console.error(error);
  }
}

async function launchImageWorkbench() {
  setStatus('launching');
  try {
    await fetch('/api/launch-image-workbench', { method: 'POST' });
    setStatus('ready');
    window.open('http://127.0.0.1:4173', '_blank', 'noreferrer');
  } catch (error) {
    setStatus('error');
    console.error(error);
  }
}

function setStatus(key) {
  els.status.dataset.statusKey = key;
  els.status.textContent = t(key) || key;
}

function applyLanguage() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = lang === 'zh' ? 'Agent \u5de5\u4f5c\u7ad9' : 'Agent Workstation';
  els.languageToggle.textContent = lang === 'zh' ? 'EN' : '\u4e2d\u6587';
  document.querySelectorAll('[data-i18n]').forEach(node => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  const activeView = document.querySelector('.nav-item.active')?.dataset.view || 'overview';
  els.title.textContent = t(`view${activeView[0].toUpperCase()}${activeView.slice(1)}`);
  if (els.status.dataset.statusKey) els.status.textContent = t(els.status.dataset.statusKey);
}

function t(key) {
  return translations[lang]?.[key] || translations.zh[key] || key;
}
