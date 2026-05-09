# 图像生成工作台

一个本地可用的图像生成网站。直接打开 `index.html` 时会使用本地 canvas 生成器；用 Node 启动 `server.mjs` 后，会通过本地代理调用你在页面中填写的 API Key、模型名称和请求地址。

## 桌面版

桌面程序位于：

```text
dist/ImageWorkbench/ImageWorkbench.exe
```

双击 EXE 会打开独立程序窗口，并自动启动本地服务，不需要手动打开浏览器。

本地数据会保存在 EXE 同目录：

- `data/`：接口配置、WebView2 本地数据、生成运行记录
- `outputs/`：可落盘的生成图片输出
- `runtime/node.exe`：随程序携带的 Node 运行时

## 运行

```powershell
node server.mjs
```

打开 `http://localhost:4173`。

## 页面配置

- `API Key`：可直接在页面输入，也可用环境变量 `OPENAI_API_KEY`
- `模型名称`：默认 `gpt-image-2`，可手动改成任何兼容模型名
- `请求地址`：默认 `https://api.openai.com/v1/images/generations`，可改成兼容的图片生成接口
- 模型不再分成“选择”和“名称”两处配置，页面只保留 `模型名称`，默认 `gpt-image-2`

上传、缩略图、框选、多选右键菜单、预览、编辑、删除、重新生成、重命名、复制、剪切、叠放、ZIP 导出和批量下载都在前端本地完成。
