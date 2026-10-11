# TapTap 发布说明（H5 小游戏路径）

> 记录把本项目发布到 TapTap 的**实际过程**与踩到的坑。
> 实测时间：2026-10-04，工具 `@taptap/tds-mcp-server@0.1.6`。

---

## 一、先搞清楚：TapTap 有两条完全不同的发布路径

| | **TapTap Maker** | **TapTap TDS（H5 小游戏）** ← 本项目走这条 |
|---|---|---|
| 游戏格式 | Lua + UrhoX 引擎（NanoVG / Box2D） | **网页**：一个含 `index.html` 的目录 |
| 包 | `@taptap/maker` | `@taptap/tds-mcp-server` |
| 适用 | 用他们引擎做的新游戏 | **现成的 H5 / Canvas 游戏** |

判断依据（均来自工具自身描述，非推测）：

* Maker 的 `maker_build_current_directory` 参数是 `entry="main.lua"`、`scriptsPath="scripts"`、
  `entry_client/entry_server`（多人 C/S 的 Lua 入口）；其 dev-kit 里
  `templates/scaffold-2d.lua` 开头写着"2D 游戏开发脚手架 … UI 系统: urhox-libs/UI (Yoga Flexbox + NanoVG)"。
* TDS 的 `tap_web_game_info_gatherer` 写着 **"The directory needs to contain an index.html file."**

**结论**：纯 JS + Canvas 的游戏应走 TDS 路径，不需要移植到 Lua。

---

## 二、TDS 的 8 个工具

| 工具 | 作用 |
|---|---|
| `tap_get_all_app` | 列出账号下的开发者与应用（也用于探测登录态） |
| `tap_create_developer` / `tap_create_app` / `tap_edit_app` | 开发者与应用信息维护 |
| `tap_web_game_info_gatherer` | **上传第 1 步**：扫描游戏目录、生成待确认信息 |
| `tap_web_game_uploader` | **上传第 2 步**：真正上传 |
| `tap_get_app_status` | 查询审核状态 |
| `tap_logout` | 清除授权 |

### 关键参数

* `tap_web_game_info_gatherer` / `tap_web_game_uploader`
  * `path`（必填）：**游戏目录绝对路径，且该目录必须含 `index.html`**
  * `genre`（必填）：`puzzle` / `casual` / `arcade` / `rpg` / … 或中文（益智、休闲、街机…）
  * `developerId` / `appId` / `appName`：可选，用于指定已有应用
* `tap_edit_app`
  * `screenOrientation`：**数字**，`1` = 竖屏，`2` = 横屏（不是字符串）

---

## 三、实际执行流程

### 1. 授权（二维码，必须用户本人操作）

首次调用任意工具会返回：

```
请使用当前设备打开二维码链接：https://tap.cn/xxxx
然后打开 TapTap App 扫描二维码进行授权
```

授权一次后**跨进程持久化**（后续新起进程免扫码）。验证方式：再调一次 `tap_get_all_app`。

### 2. 采集信息（只扫描，不上传）

```
tap_web_game_info_gatherer { path: "G:\\游戏2\\dist", genre: "puzzle", developerId, appId }
```

返回待确认信息。工具描述里明确写着 **"禁止帮助用户自动选择和自动确认，请用户手动确认"**，
所以这一步必须把结果给用户看过、拿到明确同意后才能继续。

### 3. 上传

```
tap_web_game_uploader { path, genre, developerId, appId, appName }
```

成功返回：

```
游戏2048 Shooter: Number Match(959984) 发布成功，用户可以打开 TapTap 应用，在个人页查看游戏，
应用处于审核中状态，审核通过后，所有用户都可以体验
由于您当前的游戏使用了快速上架流程，上线后将会以【益智游戏合集】的关卡形式进行分发
```

---

## 四、踩到的坑

### 1. 第一次上传报 `400`，缺 `screenOrientation`

```
Error: 创建压缩文件失败：请求失败：400 Bad Request -
游戏 appName: 最后一天的游戏1 (appId: 959984) 发布成功。
本次发布还需要额外信息(screenOrientation), 取上下文中最后一次用户提及游戏在手机游玩时的方向…
```

**`tap_edit_app` 必须先设好 `screenOrientation`（竖屏传数字 `1`），再上传。**
补设之后重试即成功。

### 2. 应用是自动创建的，名字是默认值

账号原本没有任何应用，`tap_web_game_info_gatherer` 会自动建一个
「最后一天的游戏1」。需要先 `tap_edit_app` 改名。

### 3. `tap_get_all_app` 的名称是**缓存**的，不可信

改完名后：

* `tap_get_all_app` 仍显示旧名「最后一天的游戏1」
* 但 `tap_web_game_info_gatherer` 和 `tap_web_game_uploader` 的返回都显示新名
* 应用「2048 Shooter: Number Match」→ 后来再次改名为 **「数字射击 2048」**，
  改名只进 **草稿/审核版本**，线上版本仍是旧名，需等审核通过才生效。

**以 gatherer / uploader 的返回为准**，别被列表接口误导。

### 4. 改应用信息会触发重新审核

`tap_edit_app` 之后 `tap_get_app_status` 从「未发布」变成「**审核中**」。

---

## 五、上传内容必须干净

TDS 是**整目录上传**。本项目仓库里包含 `reference/`（原游戏逆向产物）、
`docs/`、`tests/`、`tools/`，直接上传 `G:\游戏2` 会把它们一起发出去。

因此用 `build.js` 先产出只含运行所需文件的 `dist/`：

```bash
node build.js     # -> dist/  32 个文件 / 417 KB
```

`build.js` 只打包 `index.html` + `src/` + `assets/`，并带产物校验
（缺文件会以非零码退出），同时打印"未打包"清单便于核对。

上传时 `path` 指向 `G:\游戏2\dist`，而不是项目根目录。

---

## 六、后续更新

改完代码后重复即可：

```bash
node build.js
# 然后调用 tap_web_game_uploader { path: "G:\\游戏2\\dist", genre: "puzzle",
#                                 developerId: 478892, appId: 959984 }
```

`tap_web_game_info_gatherer` 只在需要重新确认信息时才需要再跑。

> **注意**：首次上传后，平台会在游戏目录写入 `dist/.taptap/app.json`，
> 内容形如 `{"developerId":478892,"appId":959984,"appName":"2048 Shooter: Number Match"}`。
> `node build.js` 会清空 `dist/` 从而删掉它；由于上传接口本来就要求显式传
> `developerId` / `appId`，重新上传不受影响，平台会再次写回。

---

## 七、备注：本机没有 MCP 客户端时怎么调用

本会话的 agent（DeepSeek Harness）不是 MCP 客户端，无法直接加载这些工具。
但 MCP 是 stdio 上的 JSON-RPC，所以可以直接起服务进程对话：

```js
const child = spawn(process.execPath, [makerOrTdsServerJs], { stdio: ['pipe','pipe','pipe'] });
// 1) initialize
// 2) notifications/initialized
// 3) tools/call { name, arguments }
```

`tools/` 下没有保留这套脚手架（属于一次性诊断代码），但流程如上，
服务入口为 `node_modules/@taptap/tds-mcp-server/dist/index.js`。
