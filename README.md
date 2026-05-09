# Agent Workstation Suite

Local-first agent workstation plus a linked image generation workbench.

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
