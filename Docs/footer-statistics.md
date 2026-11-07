# 页脚：建站天数与 Vercel 访问统计

> **状态：** 页脚与只读 API 已在重构分支实现；**尚未配置 Vercel 生产环境 Token，也未验证真实统计响应**。主站 `main` 仍是旧版 VitePress。

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
   | `VERCEL_STATS_PROJECT_ID` | 当前项目的 Vercel Project ID（`prj_...`）或项目名 |
   | `VERCEL_STATS_TEAM_ID` | 团队 ID（`team_...`），团队项目需要 |

   **不要把 Token 发到聊天、提交到 GitHub、放在前端代码或 Preview 环境。**

3. 保存配置后重新部署 **Production**。当统计开始收集数据时，访问 `https://www.stark1898y.cc/api/site-stats`，应返回类似下列格式（数值仅为示例）：

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
- [ ] 用户将环境变量配置在 Production 并重新部署 `main`。
- [ ] 用真实的 API 响应验证字段格式、数据口径和页脚值。

## 不选择不蒜子等第三方计数器

第三方计数器简单，但其可用性、统计口径、数据保留和对访客的网络请求由第三方控制。现有站点已经使用 Vercel，因此优先用其平台原生 Analytics，避免两套数据来源。

参考：

- <https://vercel.com/docs/analytics/quickstart>
- <https://vercel.com/changelog/web-analytics-api>
- <https://vercel.com/docs/project-configuration/vercel-json>
