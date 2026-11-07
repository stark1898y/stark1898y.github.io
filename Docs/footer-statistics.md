# 页脚：建站天数与 Vercel 访问统计

> **状态：** 页脚与只读 API 已在重构分支实现；**尚未配置 Vercel 生产环境 Token，也未验证真实统计响应**。主站 `main` 仍是旧版 VitePress。

> **Vercel 项目授权已验证（2026-11-07）**：当前项目是 `stark1898y-github-io`（ID `prj_NHpAS595h6gZlU60aBGAEynp57fj`），团队 `stark1898ys-projects`（ID `team_84cDWsO47xX44itlhxVFiD1H`），Vercel 已验证 `www.stark1898y.cc`。截至 2026-11-07，**已确认三个 `VERCEL_STATS_*` 环境变量全部保存成功且仅应用于 Production**：`VERCEL_STATS_TOKEN` 为敏感类型，Project ID 和 Team ID 已保存；检查时未解密 Token。从 Vercel Web Analytics 官方 `visits/count` 接口查询 2026-10-08 至 2026-11-07 区间，返回 `visitors: 0`、`pageviews: 0`。这只能证明该区间没有已采集的事件，**不能单独证明 Analytics 功能已经启用，也不代表网站真实访问人数为零**。

## 显示形式

```text
© 2022–present Stark1898y · 建站至今 N 天 · 近30天访客 U 人 · 浏览 P 次 · Zensical · Vercel
```

- 「建站至今」从 GitHub 仓库创建时间 `2022-01-12T05:49:47Z` 计算，**不代表服务器持续在线时间**。
- U / P 分别来自 Vercel Web Analytics 最近 30 天的访客数和页面浏览量，**不是自 2022 年以来累计的人数**。
- 只有真实 API 返回两个有效非负整数时才显示 U / P；未配置、网络错误、权限错误或数据格式变化时，隐藏这部分，不显示假数字。
- 目前生产正式域名为 `www.stark1898y.cc`，本地和 Preview 不调用统计接口，也不主动发送追踪事件。
- 部分独立 HTML 工具也会加载 `/javascripts/analytics.js`，统一追踪正式站点的页面浏览。

## 代码结构

| 文件 | 用途 |
| --- | --- |
| `zensical.toml` | 页脚 HTML 和 JS/CSS 注册 |
| `content/javascripts/footer.js` | 计算建站天数，读取汇总数据并显示 |
| `content/javascripts/analytics.js` | 仅正式域名加载 Vercel 官方追踪脚本 |
| `api/site-stats.js` | 只读 Vercel Function，服务器端向 Vercel API 获取汇总 |
| `tests/site-stats.test.mjs` | 模拟测试权限、缓存、数据有效性及失败降级 |
| `scripts/zensical/restore_tools.py` | 让三项独立 HTML 工具也启用生产统计脚本 |

## 需要在 Vercel 后台操作

1. 打开项目 `stark1898y-github-io` → **Analytics** → **Enable**。如已经启用，无需重复操作。
2. 到 **Settings → Environment Variables**，新增下列变量，**只选择 Production**：

   | 环境变量 | 值 |
   | --- | --- |
   | `VERCEL_STATS_TOKEN` | 用户自行创建的最小权限 Vercel API Token，仅存在 Vercel |
   | `VERCEL_STATS_PROJECT_ID` | `prj_NHpAS595h6gZlU60aBGAEynp57fj`（已核实） |
   | `VERCEL_STATS_TEAM_ID` | `team_84cDWsO47xX44itlhxVFiD1H`（已核实） |

   **不要把 Token 发到聊天、提交到 GitHub、放在前端代码或 Preview 环境。** 项目 ID、团队 ID 不属于 API 凭据；可以按上述核实值填写。

3. 环境变量已保存。**待 PR #1 审核合并后，由 Vercel 部署新生产版本**（不要提前将旧 VitePress 重部署作为验收）。当统计开始收集数据时，访问 `https://www.stark1898y.cc/api/site-stats`，应返回类似下列格式（数值仅为示例）：

```json
{"visitors": 29, "pageviews": 71, "periodDays": 30}
```

- 配置缺失：返回 HTTP 503 `statistics_not_configured`。
- 上游错误或返回格式意外：返回 HTTP 502 `statistics_unavailable`。
- 正常请求：返回 HTTP 200，CDN 缓存 1 小时，减少 Vercel Analytics API 调用。
- 页面只取汇总整数，**不会获取或公开 Token、访客 IP/UA、独立访问记录**。
- Vercel Analytics 的访客数识别采用平台规则，且跨天可能重新计数，并不等同真实自然人数。

## 验收门槛

- [x] 实现静态追踪入口、只读接口、前端显示和失败隐藏。
- [x] 测试接口缺失凭据、禁止 POST、正常汇总、错误数据降级。
- [ ] 最新 GitHub Actions 全链路构建通过。
- [ ] Vercel Preview 包含 Function 且部署 Ready（Preview 没有生产环境统计 Token）。
- [ ] Vercel Analytics 后台实际启用及正式站流量开始采集。
- [x] 已确认三个环境变量仅在 Production 配置成功（尚未验证 Token 对 Analytics REST API 的实际权限）。
- [ ] 在正式合并 PR、部署 Zensical 后验证生产 Function 使用新环境变量并返回有效统计数据。
- [ ] 用真实的 API 响应验证字段格式、数据口径和页脚值。

## 不选择不蒜子等第三方计数器

第三方计数器简单，但其可用性、统计口径、数据保留和对访客的网络请求由第三方控制。现有站点已经使用 Vercel，因此优先用其平台原生 Analytics，避免两套数据来源。

参考：

- <https://vercel.com/docs/analytics/quickstart>
- <https://vercel.com/changelog/web-analytics-api>
- <https://vercel.com/docs/project-configuration/vercel-json>
