# Agent Workstation

Local-first control surface for sharing agent context across Claude Code, Codex, and future tools.

This repository is the parent workstation. The linked image generation workbench lives in a separate sibling repository:

```text
D:\leslie\60_claude项目库\图像生成工作台
```

## Run

```powershell
node server.mjs
```

Open:

```text
http://127.0.0.1:4789
```

## What It Manages

- Hub root: `%USERPROFILE%\.agent-workstation`
- Claude skills: `%USERPROFILE%\.claude\skills`
- Codex skills: `%USERPROFILE%\.codex\skills`
- Linked app: `D:\leslie\60_claude项目库\图像生成工作台`

This project does not modify the image generation workbench. It only launches it as a separate local app.
