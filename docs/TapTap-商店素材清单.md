# TapTap 商店物料、发布与数据记录

> 应用：**数字射击 2048**（App ID `959984`，开发者 `478892`）
> 版本：`V-20261004-2`（`audit_id 1032876`）
> 依据：[宣发物料指引（小游戏）](https://developer.taptap.cn/minigameapidoc/quick-start/guide/game-publish/material/) ·
> [游戏物料要求（商店）](https://developer.taptap.cn/store/release/publish/material/)
> 工具：`@taptap/cli`（`npm i -g @taptap/cli`）
> 更新时间：2026-10-04

---

## 一、当前状态：已提审（第二轮）

| 阶段 | 状态 |
|---|---|
| 素材上传 | ✅ 全部完成（10 图 + 2 视频） |
| 资料字段写入 | ✅ 全部完成（8 个字段） |
| 预检 | ✅ 阻塞项无 · `preaudit_passed: true` |
| 提审 | ✅ **`reviewing`**（`audit_id 1032876`） |

**待办：等待审核结果。**

### 审核历史

| 轮次 | 结果 | 原因 |
|---|---|---|
| 第 1 轮 | ❌ 审核失败 | `1. 游戏LOGO请使用透明背景图。`（**仅此一条**，其余素材均通过） |
| 第 2 轮 | 🕓 审核中 | 已换成真正透明底的 Logo（见第十节） |

> 审核失败（`status=2`）状态下版本**可编辑**，不必撤审，改完直接重新提审。
> 提审后预检仍会带一条 `AUDIT_REJECTED` 警告回显上次驳回原因——那是历史上下文，
> 不是新的校验失败；它要等版本过审才会消失。

后台地址：https://developer.taptap.cn/v3/478892/app/959984/store/update

查询审核状态：

```bash
taptap-cli app list-app-versions --dev-id 478892 --app-id 959984
```

---

## 二、重大修正：素材上传不再需要手动

**此前结论「必须手动上传」是错的** —— 那是 `@taptap/instant-games-open-mcp` 的
`upload_image` 在 native signer 模式下的缺陷（缺 `TAPTAP_MCP_CLIENT_SECRET`，属 RND 环境凭证）。

**`@taptap/cli` 走的是另一套接口，上传完全正常**，而且能力更全：

```bash
npm i -g @taptap/cli --registry=https://registry.npmjs.org/
taptap-cli auth login                 # 浏览器授权，凭据存本地
taptap-cli upload ./store/icon.png --app-id 959984 --dev-id 478892 --yes
```

注意两点：

* **文件路径必须在当前工作目录内**（绝对路径、`..`、越界软链都会被拒），
  所以要在项目根目录执行，用 `store/xxx.png` 这样的相对路径。
* **`--data @文件` 的数据文件也必须落在工作目录内**，不能放 `/tmp`。

---

## 三、已上传素材

| 字段 | 文件 | 规格 | assetId / videoId |
|---|---|---|---|
| `icon` | `icon.png` | 1024×1024 | 335302 |
| `banner_4` | `promo-1920x1080.png` | 1920×1080 | 335303 |
| `square_promo_image` ★必填 | `promo-1440x1440.png` | 1440×1440 | 335304 |
| `cover_vertical` ★必填 | `cover-600x900.png` | 600×900 | 335301 |
| `cover` | `cover-460x215.png` | 460×215 | 335305 |
| `screenshots` | `shot-1~4.png` | 1080×1920 ×4 | 335307 ~ 335310 |
| `logo` | `logo-1280x720.png` | 1280×720 **RGBA 透明底** | 335740（初版 335324 非透明，已弃用） |
| `logoless_banner` | `logoless-1920x1080.png` | 1920×1080 零文字 | 335325 |
| `gameplay_demo_video` | `gameplay.mp4` | 720×1280 竖版 28s | 5941136 |
| `trailer` | `trailer.mp4` | 1920×1080 横版 21.5s | 5941137 |

> **平台会自动收录**：上传后 `banner_4`、`square_promo_image`、`gameplay_demo_video`
> 被自动绑定到对应字段；`cover_vertical`、`logo`、`logoless_banner` 等需要显式写入。

---

## 四、修正过的字段

```
cover_vertical          空              → cover-600x900.png      （原本唯一的必填缺失）
screenshots             [1 张旧图]      → [4 张新图]
trailer                 空              → 5941137
promotion_text          空              → 方块射上棋盘，相同数字合二为一
promotion_material_type GAMEPLAY_DEMO   → TRAILER
logo                    icon.png(仅2048) → logo-1280x720.png     （预检要求含完整游戏名）
logoless_banner         promo(含文字)   → logoless-1920x1080.png （预检要求零文字）
```

**平台预检会查出 MCP 时代完全查不到的问题**，上面最后两项就是预检报出来的：

```
游戏Logo中显示的文字（仅有"2048"）与完整游戏名称"数字射击 2048"不一致
无Logo宣传图中不得出现任何游戏 Logo、标题或其他文字内容（画面中出现了"数字射击 2048"）
```

---

## 五、上一版素材为什么被拒（已修正）

规范明确：*"图片上无游戏名称或LOGO以外的文本内容"*、*"不得直接使用游戏截图或简单拼贴"*。

旧版宣传图**两条都犯了**：写了 "NUMBER MATCH" 和两句宣传语，右侧还嵌了一张实机截图。
另外**实机录屏编码格式不合格**（`mpeg4`，规范要求 **H.264/HEVC**）。

新版宣传图改为纯程序化主视觉，录屏已转 H.264。

---

## 六、审核期间草稿是只读的

`status = reviewing` 时**字段全锁**，`save-changes` 会返回：

```
请求参数无效（保存失败，游戏资料已提交或已过审，请刷新页面后重试）
```

要改资料必须先撤审（版本回到 `draft`）→ 修改 → 重新提审：

```bash
taptap-cli app withdraw-app-review --dev-id 478892 --app-id 959984 \
    --data @wd.json --idempotency-key <key> --yes
```

本次流程就是：**撤审 → 写 7 个字段 → 预检 → 重新提审**，一轮带上改名与全部素材。

---

## 七、文案

### 简介（已写入）

```
把方块射上棋盘，相同数字合二为一！

《数字射击 2048》是一款单指操作的数字合成游戏：按住左右拖动瞄准，松手把方块射入指定列，相同数字立刻合并翻倍。连锁合并还会触发连击，一次拿下大量分数。

上手零门槛，想冲到 2048 却要动点脑筋——堆到发射口就结束了！

· 单指操作，一局上手
· 连锁合并，连击加成
· 回退 / 锤子 / 交换，三种道具随时解围
· 5×8 棋盘，碎片时间就能来一局
```

### 开发者的话（已写入）

> 原先这段是写给审核看的合规说明（"不含任何第三方素材""已验证运行正常"），
> 偏技术、不像对玩家说话，已换成下面这版。
>
> 这类合规说明应放在**审核备注**里，而不是占用商店页的「开发者的话」。
> ⚠️ 但注意：`trialNote`（`update_app_info` 的参数）**既不在 CLI 暴露的字段中，
> `get_current_app_info` 也不返回**，当前值无法用工具复核，要改只能去开发者后台。

```
一个人做的数字小游戏，希望你玩得开心。

玩法很简单：拖着方块左右移动，松手射出去，相同的数字会合并翻倍。
但想冲到 2048 并不容易——棋盘只有 5 列，堆到发射口就结束了。

游戏里的美术和音效都是我用脚本生成的，没有用任何现成素材，
所以每一块方块的颜色、每一个音效的波形，都是从零画出来、合成出来的。

玩的时候如果觉得哪一步手感不对，或者有什么想法，欢迎在评论区告诉我。
```

### 首页推荐语（限 25 字，已写入）

```
方块射上棋盘，相同数字合二为一
```

---

## 八、素材如何复现

```bash
python tools/gen-store-assets.py        # 图标 / 宣传图 / 封面 / Logo / 无 Logo 图

# 四张实机截图（CDP 驱动真实游戏，1080x1920）
node tools/cdp.js --url=http://127.0.0.1:8123/dist/index.html \
     --steps=tools/steps/store-shots.json --out=_store --w=1080 --h=1920

# 实机录屏（CDP 屏幕录制 + ffmpeg 转 H.264）
node tools/record-video.js --url=http://127.0.0.1:8123/dist/index.html \
     --out=_video/frames --seconds=14 --w=720 --h=1280
ffmpeg -i <原始mp4> -c:v libx264 -crf 20 -pix_fmt yuv420p \
       -profile:v high -movflags +faststart store/gameplay.mp4

# 宣传片（Pillow 逐帧渲染 16:9 主视觉 + 实机片段）
TRAILER_SRC=store/gameplay.mp4 TRAILER_FRAMES=$PWD/_trailer/frames \
  python tools/gen-trailer.py
ffmpeg -framerate 30 -i _trailer/frames/f%05d.png \
       -c:v libx264 -crf 19 -pix_fmt yuv420p -profile:v high -movflags +faststart \
       store/trailer.mp4
```

> 规范里的坑：
> 1. **宣传图除游戏名外不能有任何文字**，也不能用游戏截图或拼贴。
> 2. **实机录屏必须是 H.264/HEVC**，OpenCV 默认的 `mp4v` 会被拒。
> 3. **宣传片仅横屏，且不得与实机录屏高度雷同**。
> 4. **Logo 必须含完整游戏名**，**无 Logo 宣传图必须零文字零 Logo**（平台预检会查）。

---

## 九、数据表现（口径与查询）

工具：`taptap-cli dashboard-stats`（**只读**，不写任何数据）。

### ⚠️ 先看口径：H5 小游戏不要看 `download`

| 游戏形态 | 该看的指标 |
|---|---|
| **H5 / 小游戏**（本作） | `mini_*` 系列 |
| APK 可下载游戏 | `download` / `pv` / `position` |
| 预约期游戏 | `reserve` |

`download` 是 **APK 安装包下载请求次数**，H5 游戏天然为空——后台找不到"下载量"是正常的，不是数据丢失。
同理，Windows / PC 目前**没有**稳定的专属下载或转化指标，不要拿 `download`、`mini_device`、`cloud_start` 去替代。

### 指标速查

| Tab | metric | 含义 |
|---|---|---|
| 商店 | `pv` | 商店详情页 PV |
| 商店 | `download` / `reserve` | 安装包下载请求量 / 上架前预约人数 |
| 商店 | `rank` | 排行榜位次（**数值越小越靠前**） |
| 商店 | `position` | 各展示位曝光/点击/转化（先查 `get-dashboard-position-options`） |
| 商店 | `advertisement` / `rep_effect` / `rep_revenue` | 投放 / REP 推荐位 / REP 收益 |
| 游戏 | `mini_device` | **小游戏活跃用户数 / 新增用户数** |
| 游戏 | `mini_ret` | 小游戏次留 / 3留 / 7留 |
| 游戏 | `mini_conversion` | 进入 → 留下来玩转化（含小游戏启动率） |
| 游戏 | `mini_duration` | 单次会话平均时长（秒） |
| 游戏 | `launcher_button` | 启动按钮分形态完成率（apk/tap_play/cloud_gaming/mini_app） |
| 评价 | `review` | 每日评价数 / 评分（**必须显式传 `review_type`**） |
| 社区 | `favorite` / `topic` / `friendship` | 收藏 / 新增帖子 / 关注 |

`review_type`：`1`=计分评价 `2`=封闭式测试 `3`=折叠 `4`=临时故障 `5`=非正式版 `6`=运营事故。
省略不会默认成 `1`，查评价时务必显式传值。

### 查询命令

```bash
# 不传日期 = 默认近 30 天
taptap-cli dashboard-stats get-dashboard-stats --app-id 959984 --dev-id 478892 \
  --data '{"metric":"mini_device"}'

# 指定范围（按游戏形态分别查，不要混口径）
taptap-cli dashboard-stats get-dashboard-stats --app-id 959984 --dev-id 478892 \
  --data '{"metric":"mini_ret","start_date":"2026-10-01","end_date":"2026-10-31"}'

# 评价必须带 review_type
taptap-cli dashboard-stats get-dashboard-stats --app-id 959984 --dev-id 478892 \
  --data '{"metric":"review","review_type":1,"start_date":"2026-10-01","end_date":"2026-10-31"}'
```

> `--data @文件` 的限制同上传：**文件必须落在当前工作目录内**。

返回结构：常规指标返回 `series`（按日）、`summary`、`highlights`、`columns`、`in_error`。
**`total` 是与单日 item 同形的汇总对象，不是数字**；合计优先读 `highlights` / `summary.values`。

### 2026-10-04 实测：全为 0

| 指标 | 结果 |
|---|---|
| `mini_device` | **0 / 0**（2026-06-01 ~ 10-04，126 天无一天非零） |
| `mini_ret` / `mini_conversion` / `mini_duration` | 空 |
| `pv` / `download` / `reserve` / `position` | 空 |
| `review` / `favorite` / `topic` | 空 |

接口正常（每项都返回了正确的列定义与 30 天序列），是**真的没有数据**。

原因是条因果链，不是两个独立问题：

```
素材审核未通过
  → 不进首页推荐 / 编辑推荐（仅可通过搜索、分享链接访问）
  → 没有自然流量
  → 没有玩家、没有数据、没有评价
```

**「有效评价较少」与「数据全为 0」同源。** 在素材过审、拿到分发之前，
任何数据指标的优化都无从谈起——分母是 0。

### 过审后重点观察

| 指标 | 说明 |
|---|---|
| `mini_device` 新增用户数 | 直接反映推荐位带来的量 |
| `mini_ret` 次留 | 玩法是否留得住人 |
| `mini_duration` | 本作单局短，这项最能说明节奏是否合适 |
| `mini_conversion` 启动率 | 进来的人有没有真的开始玩 |
| `review` | 攒够有效评价才可能恢复推广资格 |

---

## 十、踩坑记录：Logo 必须真的是透明底

### 第 1 轮为什么被驳回

驳回意见只有一条：

```
1. 游戏LOGO请使用透明背景图。
```

### 根因：生成脚本自己把 alpha 抹掉了

`gen-store-assets.py` 里原本的 `save()` 是：

```python
img.convert("RGB").save(p, optimize=True)   # ← 所有素材一律转 RGB
```

`Logo` 在内存里确实是 `RGBA` 且背景透明，但**写盘时被强制转成 `RGB`**，
alpha 通道被丢弃，透明区在文件里变成了**黑色**。肉眼看预览图是"黑底 + 白字"，
很容易误判成"设计成黑底的"，而不是"透明丢了"。

### 修复

`save()` 增加 `keep_alpha` 开关，只有需要透明的素材才保留 alpha：

```python
def save(img, name, limit_mb, keep_alpha=False):
    (img if keep_alpha else img.convert("RGB")).save(p, optimize=True)
    if keep_alpha:                      # 生成时就自检，避免再次产出错图
        lo, hi = img.getchannel("A").getextrema()
        tag = "  alpha OK" if lo < 255 else "  !! no transparent pixel"
```

```python
save(make_logo(), "logo-1280x720.png", 4, keep_alpha=True)
```

### 验证方法（重要：要验平台侧的图，不是本地文件）

本地生成对了不代表平台存对了。把 CDN 上实际存储的图抓回来验：

```bash
curl -o /tmp/l.png "https://img-tc.tapimg.com/market/images/<hash>.png"
python -c "from PIL import Image; im=Image.open('/tmp/l.png'); \
  print(im.mode, im.getchannel('A').getextrema())"
```

实测结果：`RGBA`，alpha 范围 `(0, 255)`，四角 `alpha=0`，全透明像素占 **87.4%** —— 平台侧确认透明。

### 顺带记住的两点

* **审核失败（`status=2`）状态下版本可编辑**，不必撤审。只有 `1 审核中 / 3 定时上线 / 4 已上线 / 5 已下架` 才全锁。
* 提审后预检会带一条 `AUDIT_REJECTED` 警告回显上次驳回原因。**它是历史上下文，不是新的校验失败**——
  判据是 `preaudit_passed` 与 `blockers`，不要只看 `warnings` 数量就以为还有问题。


