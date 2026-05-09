# Agent Workstation Suite

Leslie 的 AI Agent 工作站套件：本地优先的 Agent 工作站，加一个独立的图像生成工作台。

## 项目结构

- `agent-workstation/`：主工作站，用来管理共享上下文、技能、记忆和应用入口。
- `image-workbench/`：独立的图像生成工作台，由主工作站打开，也可以单独运行。

## 本地运行

启动 Agent 工作站：

```powershell
cd agent-workstation
node server.mjs
```

打开：

```text
http://127.0.0.1:4789
```

构建 Agent 工作站桌面版：

```powershell
cd agent-workstation
.\desktop-build\build-agent-workstation.ps1
```

打包结果会生成到 `agent-workstation\release\AgentWorkstation-Setup.zip`。

启动图像生成工作台：

```powershell
cd image-workbench
node server.mjs
```

打开：

```text
http://127.0.0.1:4173
```

## 版本与同步

两个实际工作的项目仍然保留在原来的本地目录。这个套件仓库负责汇总源码、记录版本，并同步到 GitHub。

手动同步一次：

```powershell
.\scripts\sync-suite.ps1
```

同步并打一个明确版本：

```powershell
.\scripts\sync-suite.ps1 -Tag -Version v2026.05.09-1
```

工作时自动同步：

```powershell
.\scripts\watch-sync.ps1 -IntervalSeconds 60
```

每次同步都会生成一个 Git commit。重要节点建议使用 tag，例如 `v2026.05.09-agent-desktop`，以后可以按版本回退或下载。

## 注意

运行数据、生成图片、备份、打包产物、截图和本地 agent 配置目录不会进入 Git 仓库。仓库只保存源码、构建脚本和说明文档，保持轻量干净。
