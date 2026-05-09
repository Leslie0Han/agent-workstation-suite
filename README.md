# Agent Workstation Suite

Leslie 的 AI Agent 工作站套件：本地优先的 Agent 工作站，加一个独立的图像生成工作台。

## Projects

- `agent-workstation/` - parent control surface for shared agent context, skills, memory, and linked apps.
- `image-workbench/` - standalone image generation workbench launched by the parent workstation.

## Run

Agent Workstation:

```powershell
cd agent-workstation
node server.mjs
```

Open:

```text
http://127.0.0.1:4789
```

Desktop package:

```powershell
cd agent-workstation
.\desktop-build\build-agent-workstation.ps1
```

The packaged app is written to `agent-workstation\release\AgentWorkstation-Setup.zip`.

Image Workbench:

```powershell
cd image-workbench
node server.mjs
```

Open:

```text
http://127.0.0.1:4173
```

## Notes

Runtime data, generated images, backups, packaged builds, screenshots, and local agent folders are intentionally ignored by Git.

## Sync To GitHub

The two live projects remain in their original local folders. Use the sync scripts to copy tracked source files into this suite repository, commit a snapshot, and push it to GitHub.

One snapshot:

```powershell
.\scripts\sync-suite.ps1
```

One named version:

```powershell
.\scripts\sync-suite.ps1 -Tag -Version v2026.05.09-1
```

Auto-sync while working:

```powershell
.\scripts\watch-sync.ps1 -IntervalSeconds 60
```

Every sync creates a Git commit. Tags are for important versions you may want to find later.
