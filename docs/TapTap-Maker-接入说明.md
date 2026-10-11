# TapTap Maker 接入说明

> 记录本次 Maker 环境搭建的**实际结果**与**待你执行的步骤**。
> 涉及外部工具版本：`@taptap/maker` **0.0.36**（2026-10-04 实测）。

---

## 一、已完成：MCP 安装（第 1 步）

执行命令（你给的原样命令即可，新版会自动探测客户端，`--ide` 已非必需）：

```bash
npx -y @taptap/maker install --ide codex,cursor,claude
```

实际写入位置：

| 客户端 | 配置文件 | 内容 |
|---|---|---|
| Codex | `~/.codex/config.toml` | `[mcp_servers."taptap-maker"]` |
| Cursor | `~/.cursor/mcp.json`（新建） | `mcpServers.taptap-maker` |
| Claude | `~/.claude.json`（新建） | `mcpServers.taptap-maker` |

三者都指向同一个本地运行时（**不依赖 npx 常驻**）：

```
C:\Program Files\nodejs\node.exe
C:\Users\liu58\.taptap-maker\mcp-runtime\0.0.36\dist\maker.js
```

验证结果：

```bash
npx -y @taptap/maker mcp verify --mode self
# ✓ Maker MCP launcher connectivity verified
#   launcher_kind: self_runtime
#   stage: tools_list        ← 服务已启动并能列出工具
```

> 原有的 `node_repl` MCP 与 `projects.*` 配置未被改动；CLI 自己也留了
> `~/.codex/config.toml.taptap-maker.bak.latest`。

**注意**：本会话的 agent（DeepSeek Harness）使用 Cordis 插件体系、**不是 MCP 客户端**，
因此无法承载这个 MCP。能用 Maker MCP 的是 **Codex / Cursor / Claude Code**。

---

## 二、待你执行：在 MCP 客户端里初始化（第 2 步）

请在 **Codex / Cursor / Claude Code** 中打开 `G:\游戏2`，然后让其中的 agent 执行：

```bash
npx -y @taptap/maker init
```

### 为什么必须你来做

实测 `init` 在临时空白目录里的输出：

```
{"step":"init_start","status":"ok","target_dir":"..."}
{"step":"doctor","status":"ok","message":"Git is available","data":{"version":"git version 2.52.0.windows.1"}}
{"step":"python","status":"ok","message":"Python environment is ready","data":{"status":"ready","version":"3.11.9"}}
…然后阻塞（等待交互 / 登录）
```

两个卡点都由你处理：

1. **未登录**。`doctor` 报 `auth: { pat: false, tap_auth: false }`。
   `init` 需要拉取你账号下的 Maker 应用列表让你选，必须先登录。
   可选：`npx -y @taptap/maker login`（浏览器授权），或 `npx -y @taptap/maker pat set`（令牌）。
2. **交互式选择**。它会列出你的 Maker 应用，让你选一个已有应用或 `0/new` 新建。
   这是 CLI 的交互提示，不是纯命令行参数能替代的。
   （若明确要新建：`npx -y @taptap/maker init --create --name 你的项目名`）

### init 会往 `G:\游戏2` 里加什么

会下载约 **29.7 MB** 的 AI dev kit，新增这四个名字：

```
CLAUDE.md     examples/     templates/     urhox-libs/
```

已确认这四个名字在当前项目里**都不存在**，不会覆盖任何已有文件。

### 关于「目录非空」

官方指引写的是"选择一个空白的本地目录"，而 `G:\游戏2` 里是 2048 复刻项目（121 个文件 / 3.7 MB）。
如果 `init` 中途要 `git clone` 一个 Maker 应用仓库，**git 会拒绝在非空目录里 clone**，
届时它会报错退出（不会破坏现有文件）。

如果真遇到这个报错，两条路：

- **推荐**：改成在空白目录初始化，例如
  `npx -y @taptap/maker init --target-dir G:\taptap-maker`，
  然后再把本项目的 `src/`、`assets/` 搬进去（或反过来）；
- 或者先把本项目移走（已为你备份，见下），初始化完再移回来。

---

## 三、初始化完成后如何验证

```bash
npx -y @taptap/maker doctor --json
```

关注 `dev_kit` 字段应从

```json
"dev_kit": { "targetDir": "G:\\游戏2", "ready": false,
             "missingEntries": ["CLAUDE.md","examples","templates","urhox-libs"] }
```

变为 `"ready": true`（`missingEntries` 为空）。同时 `project.source` 不再是 `none`。

---

## 四、可选：补齐 Lua 诊断环境

`doctor` 报告 `lua_lsp` 缺失（`maker-lua-lsp` 未安装），且系统 Python 3.11.9
低于推荐的 3.12。如需补齐：

```bash
npx -y @taptap/maker python setup      # 准备 Python 3.12 环境
npx -y @taptap/maker lua-lsp setup     # 安装 maker-lua-lsp
```

> 顺带说明：你给的指令里 `--ide codex,cursor,claude` 这个参数其实来自
> **另一条命令** `maker-lua-lsp install --ide codex,cursor,claude`（见 `doctor` 输出）。
> 主命令 `taptap-maker install` 现在不需要它。

---

## 五、本项目的安全网

初始化动作会往 `G:\游戏2` 写入新文件，动手前已打包备份：

```
G:\游戏2_backup_20261004-1945.zip     (2.6 MB)
```

确认 Maker 流程跑通、项目无恙后可以自行删除。

---

## 六、常用命令速查

```bash
npx -y @taptap/maker doctor [--target-dir DIR] [--json]   # 环境诊断
npx -y @taptap/maker apps [--json]                        # 列出你的 Maker 应用
npx -y @taptap/maker build --target-dir DIR [--json]      # 构建
npx -y @taptap/maker preview start --target-dir DIR       # 本地预览
npx -y @taptap/maker qrcode --target-dir DIR              # 生成真机二维码
npx -y @taptap/maker console open --target-dir DIR        # 打开控制台
npx -y @taptap/maker mcp verify --mode self               # 验证 MCP 安装
```

以上均为 `@taptap/maker` 0.0.36 的 `--help` 实际输出，不是推测。
