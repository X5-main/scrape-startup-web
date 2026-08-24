import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod/v4";

let cachedToken = null;
let cachedTokenExpiresAt = 0;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Last-Event-ID, mcp-protocol-version, mcp-session-id",
  "Access-Control-Expose-Headers": "mcp-protocol-version, mcp-session-id",
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return withCors(healthResponse(request, env));
    }

    if (url.pathname !== "/mcp") {
      return withCors(jsonResponse({ ok: false, error: "Not found. Use /health or /mcp." }, 404));
    }

    const authError = authorizeRequest(request, env);
    if (authError) return withCors(authError);

    const transport = new WebStandardStreamableHTTPServerTransport();
    const server = createServer(env);
    await server.connect(transport);

    try {
      return withCors(await transport.handleRequest(request));
    } finally {
      await server.close();
    }
  },
};

function createServer(env) {
  const server = new McpServer({
    name: "Beds24 read-only connector",
    version: "0.1.0",
  });

  server.registerTool(
    "beds24_check_access",
    {
      title: "Check Beds24 API access",
      description: "Checks the Beds24 token and reads the first property page. Use this before operational questions.",
      annotations: { readOnlyHint: true },
    },
    async () => {
      const [details, properties] = await Promise.all([
        beds24Get(env, "/authentication/details", {}),
        beds24Get(env, "/properties", { includeAllRooms: true, page: 1 }),
      ]);
      return textResult({
        tokenDetails: details.body,
        propertiesSample: properties.body,
        rateLimit: mergeRateLimit(details.rateLimit, properties.rateLimit),
      });
    },
  );

  server.registerTool(
    "beds24_get_properties",
    {
      title: "Get Beds24 properties",
      description: "Read properties and room names from Beds24. Use includeAllRooms to expose rooms attached to each property.",
      inputSchema: {
        id: z.array(z.number().int().positive()).optional().describe("Optional Beds24 property IDs."),
        includeAllRooms: z.boolean().default(true).describe("Include all room records on each property."),
        includeUnitDetails: z.boolean().default(false).describe("Include unit details. Leave false unless needed."),
        page: z.number().int().min(1).max(20).default(1),
      },
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      const response = await beds24Get(env, "/properties", {
        id: input.id,
        includeAllRooms: input.includeAllRooms ?? true,
        includeUnitDetails: input.includeUnitDetails ?? false,
        page: input.page ?? 1,
      });
      return textResult({ data: response.body, rateLimit: response.rateLimit });
    },
  );

  server.registerTool(
    "beds24_get_bookings",
    {
      title: "Get Beds24 bookings",
      description: "Read bookings by status, filter, date, property, room, or search string. Guest names/details require the bookings-personal scope.",
      inputSchema: {
        filter: z.enum(["arrivals", "departures", "new", "current"]).optional(),
        propertyId: z.array(z.number().int().positive()).optional(),
        roomId: z.array(z.number().int().positive()).optional(),
        id: z.array(z.number().int().positive()).optional().describe("Specific Beds24 booking IDs."),
        arrival: z.string().regex(DATE_RE).optional(),
        arrivalFrom: z.string().regex(DATE_RE).optional(),
        arrivalTo: z.string().regex(DATE_RE).optional(),
        departure: z.string().regex(DATE_RE).optional(),
        departureFrom: z.string().regex(DATE_RE).optional(),
        departureTo: z.string().regex(DATE_RE).optional(),
        bookingTimeFrom: z.string().regex(DATE_TIME_RE).optional(),
        modifiedFrom: z.string().regex(DATE_TIME_RE).optional(),
        searchString: z.string().max(120).optional(),
        includeGuests: z.boolean().default(false).describe("Requires read:bookings-personal."),
        includeInfoItems: z.boolean().default(false),
        status: z.array(z.enum(["confirmed", "request", "new", "cancelled", "black", "inquiry"])).optional(),
        page: z.number().int().min(1).max(20).default(1),
      },
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      const response = await beds24Get(env, "/bookings", {
        filter: input.filter,
        propertyId: input.propertyId,
        roomId: input.roomId,
        id: input.id,
        arrival: input.arrival,
        arrivalFrom: input.arrivalFrom,
        arrivalTo: input.arrivalTo,
        departure: input.departure,
        departureFrom: input.departureFrom,
        departureTo: input.departureTo,
        bookingTimeFrom: input.bookingTimeFrom,
        modifiedFrom: input.modifiedFrom,
        searchString: input.searchString,
        includeGuests: input.includeGuests ?? false,
        includeInfoItems: input.includeInfoItems ?? false,
        status: input.status,
        page: input.page ?? 1,
      });
      return textResult({ data: response.body, rateLimit: response.rateLimit });
    },
  );

  server.registerTool(
    "beds24_get_calendar",
    {
      title: "Get Beds24 calendar availability",
      description: "Read room calendar values for a date range. By default this returns availability counts only.",
      inputSchema: {
        startDate: z.string().regex(DATE_RE),
        endDate: z.string().regex(DATE_RE),
        propertyId: z.array(z.number().int().positive()).optional(),
        roomId: z.array(z.number().int().positive()).optional(),
        includeNumAvail: z.boolean().default(true),
        includeMinStay: z.boolean().default(false),
        includeMaxStay: z.boolean().default(false),
        includePrices: z.boolean().default(false),
        page: z.number().int().min(1).max(20).default(1),
      },
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      const response = await beds24Get(env, "/inventory/rooms/calendar", {
        startDate: input.startDate,
        endDate: input.endDate,
        propertyId: input.propertyId,
        roomId: input.roomId,
        includeNumAvail: input.includeNumAvail ?? true,
        includeMinStay: input.includeMinStay ?? false,
        includeMaxStay: input.includeMaxStay ?? false,
        includePrices: input.includePrices ?? false,
        page: input.page ?? 1,
      });
      return textResult({ data: response.body, rateLimit: response.rateLimit });
    },
  );

  return server;
}

async function beds24Get(env, path, params) {
  const token = await getBeds24Token(env);
  const base = env.BEDS24_API_BASE || "https://beds24.com/api/v2";
  const url = new URL(`${base}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      token,
    },
  });
  const body = await response.json().catch(() => ({ success: false, error: "Beds24 returned non-JSON response." }));
  const rateLimit = rateLimitFromHeaders(response.headers);

  if (!response.ok || body?.success === false) {
    throw new Error(`Beds24 ${path} failed: ${body?.error || response.statusText || response.status}`);
  }

  return { body, rateLimit };
}

async function getBeds24Token(env) {
  if (env.BEDS24_TOKEN) return env.BEDS24_TOKEN;
  if (!env.BEDS24_REFRESH_TOKEN) {
    throw new Error("Set BEDS24_TOKEN for a long-life read-only token, or BEDS24_REFRESH_TOKEN for a refresh-token setup.");
  }

  const now = Date.now();
  if (cachedToken && cachedTokenExpiresAt > now + 60_000) return cachedToken;

  const base = env.BEDS24_API_BASE || "https://beds24.com/api/v2";
  const response = await fetch(`${base}/authentication/token`, {
    headers: {
      accept: "application/json",
      refreshToken: env.BEDS24_REFRESH_TOKEN,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.token) {
    throw new Error(`Could not refresh Beds24 token: ${body.error || response.statusText || response.status}`);
  }

  cachedToken = body.token;
  cachedTokenExpiresAt = now + Math.max(1, Number(body.expiresIn || 3600) - 120) * 1000;
  return cachedToken;
}

function authorizeRequest(request, env) {
  if (!env.CONNECTOR_BEARER_TOKEN) return null;
  const expected = `Bearer ${env.CONNECTOR_BEARER_TOKEN}`;
  if (request.headers.get("Authorization") === expected) return null;
  return jsonResponse({ ok: false, error: "Unauthorized. Configure ChatGPT with the Worker bearer token." }, 401, {
    "WWW-Authenticate": 'Bearer realm="Beds24 MCP Worker"',
  });
}

function healthResponse(request, env) {
  const url = new URL(request.url);
  const mcpUrl = `${url.origin}/mcp`;
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Beds24 MCP Worker health</title>
<style>body{font-family:ui-sans-serif,system-ui,sans-serif;margin:40px;line-height:1.5;max-width:760px}code{background:#f3f3f3;padding:2px 5px;border-radius:4px}.ok{color:#0a7f35}.warn{color:#8a5a00}</style></head>
<body>
<h1>Beds24 MCP Worker</h1>
<p class="ok">Worker is running.</p>
<p>Use this MCP server URL in ChatGPT:</p>
<p><code>${escapeHtml(mcpUrl)}</code></p>
<ul>
<li>Beds24 credential configured: <strong>${env.BEDS24_TOKEN || env.BEDS24_REFRESH_TOKEN ? "yes" : "no"}</strong></li>
<li>Connector bearer token configured: <strong>${env.CONNECTOR_BEARER_TOKEN ? "yes" : "no"}</strong></li>
</ul>
<p class="warn">This page does not test Beds24 access because it intentionally avoids exposing booking data in a browser.</p>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function textResult(value) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function rateLimitFromHeaders(headers) {
  return {
    fiveMinuteLimit: headers.get("x-fivemincreditlimit") || headers.get("x-five-min-limit"),
    remaining: headers.get("x-fivemincreditlimit-remaining") || headers.get("x-five-min-limit-remaining"),
    resetsInSeconds: headers.get("x-fivemincreditlimit-resetsin") || headers.get("x-five-min-limit-resets-in"),
    requestCost: headers.get("x-requestcost") || headers.get("x-request-cost"),
  };
}

function mergeRateLimit(...limits) {
  return limits.find((limit) => limit?.remaining || limit?.requestCost) || limits[0] || {};
}

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}
