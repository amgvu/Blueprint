import { describe, test, expect, vi } from "vitest";
import { fetchFigmaFileFromEnv } from "../api";

function headerValue(
  init: RequestInit | undefined,
  name: string
): string | undefined {
  if (init?.headers instanceof Headers)
    return init.headers.get(name) || undefined;
  if (Array.isArray(init?.headers)) {
    const found = (init.headers as [string, string][]).find(
      ([k]) => k.toLowerCase() === name.toLowerCase()
    );
    return found ? found[1] : undefined;
  }
  if (init?.headers && typeof init.headers === "object") {
    const rec = init.headers as Record<string, string>;
    const key = Object.keys(rec).find(
      (k) => k.toLowerCase() === name.toLowerCase()
    );
    return key ? rec[key] : undefined;
  }
  return undefined;
}

describe("figma lib", () => {
  const envApiKey = process.env.VITE_FIGMA_API_KEY;
  const envFileUrl = process.env.VITE_FIGMA_FILE_URL;
  const itEnv = envApiKey && envFileUrl ? test : test.skip;

  itEnv("extracts key from env URL", () => {
    const m = (envFileUrl as string).match(
      /https?:\/\/www\.figma\.com\/(file|design)\/([a-zA-Z0-9]+)\//
    );
    expect(m && m[2]).toMatch(/^[a-zA-Z0-9]+$/);
  });

  itEnv("sends token header and correct URL", async () => {
    const apiKey = envApiKey as string;
    const fileUrl = envFileUrl as string;
    const key = (
      fileUrl.match(
        /https?:\/\/www\.figma\.com\/(file|design)\/([a-zA-Z0-9]+)\//
      ) as RegExpMatchArray
    )[2];
    let lastUrl: string | URL | Request | undefined;
    let lastInit: RequestInit | undefined;
    const mockFetch: typeof fetch = vi.fn(
      async (url: string | URL | Request, init?: RequestInit) => {
        lastUrl = url;
        lastInit = init;
        return new Response(
          JSON.stringify({
            document: {
              id: "0:1",
              name: "Doc",
              type: "DOCUMENT",
              children: [],
            },
          }),
          {
            status: 200,
          }
        );
      }
    ) as unknown as typeof fetch;
    const origApi = process.env.VITE_FIGMA_API_KEY;
    const origUrl = process.env.VITE_FIGMA_FILE_URL;
    process.env.VITE_FIGMA_API_KEY = apiKey;
    process.env.VITE_FIGMA_FILE_URL = fileUrl;
    const data = await fetchFigmaFileFromEnv(mockFetch);
    process.env.VITE_FIGMA_API_KEY = origApi;
    process.env.VITE_FIGMA_FILE_URL = origUrl;
    expect("document" in data).toBe(true);
    expect(String(lastUrl!)).toContain(`/v1/files/${key}`);
    const xfig = headerValue(lastInit, "X-Figma-Token");
    const auth = headerValue(lastInit, "Authorization");
    const ok = xfig === apiKey || auth === `Bearer ${apiKey}`;
    expect(ok).toBe(true);
  });

  itEnv(
    "fetches real file JSON from Figma",
    async () => {
      const origApi = process.env.VITE_FIGMA_API_KEY;
      const origUrl = process.env.VITE_FIGMA_FILE_URL;
      process.env.VITE_FIGMA_API_KEY = envApiKey as string;
      process.env.VITE_FIGMA_FILE_URL = envFileUrl as string;
      const data = await fetchFigmaFileFromEnv();
      process.env.VITE_FIGMA_API_KEY = origApi;
      process.env.VITE_FIGMA_FILE_URL = origUrl;
      console.log(JSON.stringify(data, null, 2));
      expect(data).toBeDefined();
      expect("document" in data).toBe(true);
    },
    30000
  );
});
