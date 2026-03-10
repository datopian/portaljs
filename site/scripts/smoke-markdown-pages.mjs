import { MarkdownDB } from "mddb";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 15000);
const includeDrafts = process.env.SMOKE_INCLUDE_DRAFTS === "1";
const parsedMaxFailures = Number(process.env.SMOKE_MAX_FAILURES || 0);
const maxFailuresToShow =
  Number.isFinite(parsedMaxFailures) && parsedMaxFailures > 0
    ? parsedMaxFailures
    : Infinity;

const errorMarkers = [
  "Application error: a client-side exception has occurred",
  "Internal Server Error",
  "500 - Internal Server Error",
  "500 |",
];

function normalizePath(urlPath) {
  if (!urlPath || urlPath === "/") return "/";
  return urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
}

async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function loadMarkdownRoutes() {
  const db = new MarkdownDB({
    client: "sqlite3",
    connection: { filename: "markdown.db" },
  });
  const mddb = await db.init();
  const files = await mddb.getFiles({ extensions: ["md", "mdx"] });

  const paths = files
    .filter((file) => includeDrafts || file.metadata?.isDraft !== true)
    .map((file) => normalizePath(file.url_path))
    .filter(Boolean);

  return Array.from(new Set(paths)).sort();
}

async function main() {
  try {
    await fetchWithTimeout(new URL("/", baseUrl).toString(), timeoutMs);
  } catch (error) {
    console.error(
      `Cannot reach ${baseUrl}. Start Next.js first (example: npm run dev).`
    );
    process.exit(1);
  }

  const routes = await loadMarkdownRoutes();
  if (routes.length === 0) {
    console.error("No markdown routes found. Did you run `npm run mddb`?");
    process.exit(1);
  }

  const failures = [];
  for (const route of routes) {
    const url = new URL(route, baseUrl).toString();
    try {
      const res = await fetchWithTimeout(url, timeoutMs);
      const body = await res.text();
      const marker = errorMarkers.find((m) => body.includes(m));

      if (!res.ok || marker) {
        failures.push({
          route,
          status: res.status,
          reason: marker ? `error marker: "${marker}"` : "non-2xx status",
        });
      } else {
        process.stdout.write(`OK   ${route}\n`);
      }
    } catch (error) {
      failures.push({
        route,
        status: "ERR",
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (failures.length > 0) {
    console.error(
      `\nMarkdown smoke test failed: ${failures.length}/${routes.length} routes failed\n`
    );
    failures.slice(0, maxFailuresToShow).forEach((failure) => {
      console.error(
        `FAIL ${failure.route} [${failure.status}] ${failure.reason}`
      );
    });
    if (failures.length > maxFailuresToShow) {
      console.error(
        `... and ${failures.length - maxFailuresToShow} more failures`
      );
    }
    process.exit(1);
  }

  console.log(`\nMarkdown smoke test passed: ${routes.length} routes are loading`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
