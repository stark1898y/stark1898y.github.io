/**
 * Public read-only 30-day totals from Vercel Web Analytics.
 * Set VERCEL_STATS_TOKEN, VERCEL_STATS_PROJECT_ID and VERCEL_STATS_TEAM_ID
 * only as Vercel Production environment variables.
 */
const DAY = 86400000;

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const token = process.env.VERCEL_STATS_TOKEN;
  const projectId = process.env.VERCEL_STATS_PROJECT_ID;
  const teamId = process.env.VERCEL_STATS_TEAM_ID;
  if (!token || !projectId) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ error: "statistics_not_configured" });
  }

  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/count");
  const until = Date.now();
  url.searchParams.set("projectId", projectId);
  if (teamId) url.searchParams.set("teamId", teamId);
  url.searchParams.set("since", String(until - 30 * DAY));
  url.searchParams.set("until", String(until));
  // visits/count defaults to Production environment.
  try {
    const upstream = await fetch(url, {
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      signal: AbortSignal.timeout(6500),
    });
    if (!upstream.ok) throw new Error("Analytics API unavailable");
    const result = await upstream.json();
    const data = result && result.data;
    const visitors = data && data.visitors;
    const pageviews = data && (data.pageviews ?? data.pageViews);
    // Fail closed if the Vercel response schema changes.
    if (!Number.isSafeInteger(visitors) || visitors < 0 ||
        !Number.isSafeInteger(pageviews) || pageviews < 0) {
      throw new Error("Unexpected Analytics response");
    }
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
    return res.status(200).json({ visitors, pageviews, periodDays: 30 });
  } catch (_) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "statistics_unavailable" });
  }
};
