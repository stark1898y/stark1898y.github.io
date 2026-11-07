import { test } from "node:test";
import assert from "node:assert/strict";
import handler from "../api/site-stats.js";

function response() {
  return {
    headers: {}, statusCode: 200, payload: undefined,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.payload = value; return this; }
  };
}

async function scopedEnv(values, callback) {
  const old = Object.fromEntries(Object.keys(values).map(k => [k, process.env[k]]));
  try {
    for (const [k, v] of Object.entries(values)) {
      if (v === null) delete process.env[k];
      else process.env[k] = v;
    }
    await callback();
  } finally {
    for (const [k, v] of Object.entries(old)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test("missing credentials never exposes fake statistics", async () => {
  await scopedEnv({ VERCEL_STATS_TOKEN: null, VERCEL_STATS_PROJECT_ID: null }, async () => {
    const res = response();
    await handler({ method: "GET" }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.payload.error, "statistics_not_configured");
  });
});

test("only GET is allowed", async () => {
  const res = response();
  await handler({ method: "POST" }, res);
  assert.equal(res.statusCode, 405);
});

test("returns authenticated cached totals, not the token", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url.origin, "https://api.vercel.com");
      assert.equal(url.pathname, "/v1/query/web-analytics/visits/count");
      assert.equal(url.searchParams.get("projectId"), "prj_test");
      assert.equal(url.searchParams.get("teamId"), "team_test");
      assert.equal(options.headers.Authorization, "Bearer dummy_token");
      const start = url.searchParams.get("since");
      const end = url.searchParams.get("until");
      assert.match(start, /^\d{4}-\d{2}-\d{2}T/);
      assert.match(end, /^\d{4}-\d{2}-\d{2}T/);
      assert.equal(Date.parse(end) - Date.parse(start), 30 * 86400000);
      return { ok: true, json: async () => ({ data: { visitors: 29, pageviews: 71 } }) };
    };
    await scopedEnv({
      VERCEL_STATS_TOKEN: "dummy_token",
      VERCEL_STATS_PROJECT_ID: "prj_test",
      VERCEL_STATS_TEAM_ID: "team_test",
    }, async () => {
      const res = response();
      await handler({ method: "GET" }, res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.payload, { visitors: 29, pageviews: 71, periodDays: 30 });
      assert.match(res.headers["Cache-Control"], /s-maxage=3600/);
      assert.ok(!JSON.stringify(res.payload).includes("dummy_token"));
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("upstream errors and schema changes must not show zero", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ data: {} }) });
    await scopedEnv({ VERCEL_STATS_TOKEN: "dummy_token", VERCEL_STATS_PROJECT_ID: "prj_test" }, async () => {
      const res = response();
      await handler({ method: "GET" }, res);
      assert.equal(res.statusCode, 502);
      assert.equal(res.payload.error, "statistics_unavailable");
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
