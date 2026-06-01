import type { WebSearchResult } from "@/lib/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

export async function searchWeb(query: string, limit = 5): Promise<WebSearchResult[]> {
  if (process.env.SEARCH_API_KEY) {
    return searchWithConfiguredProvider(query, limit);
  }

  return searchDuckDuckGoLite(query, limit);
}

async function searchWithConfiguredProvider(query: string, limit: number): Promise<WebSearchResult[]> {
  const endpoint = process.env.SEARCH_API_ENDPOINT;
  if (!endpoint) {
    return searchDuckDuckGoLite(query, limit);
  }

  const url = new URL(endpoint);
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(limit));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SEARCH_API_KEY}`,
      "User-Agent": USER_AGENT
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return searchDuckDuckGoLite(query, limit);
  }

  const data = (await response.json()) as {
    results?: Array<{ title?: string; url?: string; snippet?: string; content?: string }>;
    webPages?: { value?: Array<{ name?: string; url?: string; snippet?: string }> };
  };

  const raw: SearchApiItem[] = data.results ?? data.webPages?.value ?? [];
  return raw
    .map((item) => ({
      title: getSearchTitle(item),
      url: item.url ?? "",
      snippet: getSearchSnippet(item)
    }))
    .filter((item) => item.url && item.snippet)
    .slice(0, limit);
}

type SearchApiItem = {
  title?: string;
  name?: string;
  url?: string;
  snippet?: string;
  content?: string;
};

function getSearchTitle(item: SearchApiItem) {
  return item.title ?? item.name ?? "搜索结果";
}

function getSearchSnippet(item: SearchApiItem) {
  return item.snippet ?? item.content ?? "";
}

async function searchDuckDuckGoLite(query: string, limit: number): Promise<WebSearchResult[]> {
  const url = new URL("https://lite.duckduckgo.com/lite/");
  url.searchParams.set("q", query);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    return parseDuckDuckGoLite(html).slice(0, limit);
  } catch {
    return [];
  }
}

function parseDuckDuckGoLite(html: string): WebSearchResult[] {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  const results: WebSearchResult[] = [];

  for (const row of rows) {
    const linkMatch = row.match(/<a[^>]+class="result-link"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) {
      continue;
    }

    const snippetMatch = row.match(/<td[^>]+class="result-snippet"[^>]*>([\s\S]*?)<\/td>/i);
    const url = decodeHtml(stripDuckDuckGoRedirect(linkMatch[1]));
    const title = decodeHtml(stripTags(linkMatch[2]));
    const snippet = decodeHtml(stripTags(snippetMatch?.[1] ?? ""));

    if (url && title) {
      results.push({ title, url, snippet });
    }
  }

  return results;
}

function stripDuckDuckGoRedirect(value: string) {
  if (!value.startsWith("//duckduckgo.com/l/?")) {
    return value;
  }

  const url = new URL(`https:${value}`);
  return url.searchParams.get("uddg") ?? value;
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, " ")
    .trim();
}
