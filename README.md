# Agent 工作站

本地优先的 AI Agent 工作站，用来统一管理 Claude Code、Codex 和后续工具共享的上下文、记忆、技能与项目入口。

这个项目是主工作站。图像生成工作台保持为独立的同级项目，由工作站负责打开和管理入口：

```text
D:\leslie\60_claude项目库\图像生成工作台
```

## 本地启动

```powershell
node server.mjs
```

打开：

```text
http://127.0.0.1:4789
```

## 桌面版

生成可分享的 Windows 桌面程序：

```powershell
.\desktop-build\build-agent-workstation.ps1
```

输出位置：

- `dist\AgentWorkstation\AgentWorkstation.exe`
- `release\AgentWorkstation-Setup.zip`

分享给别人时，优先发送 `release\AgentWorkstation-Setup.zip`。对方解压后双击 `AgentWorkstation.exe` 即可启动。

## 管理内容

- Hub root: `%USERPROFILE%\.agent-workstation`
- Claude skills: `%USERPROFILE%\.claude\skills`
- Codex skills: `%USERPROFILE%\.codex\skills`
- Linked app: `D:\leslie\60_claude项目库\图像生成工作台`

工作站不会把图像生成工作台合并进自己内部；它只把图像生成工作台作为独立本地应用启动，这样两个项目可以分别维护，也可以一起打包到套件仓库。
