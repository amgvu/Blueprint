/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect } from "vitest";
import { fetchFigmaFileFromEnv } from "../../api";
import { normalizeFile } from "..";
import { createIndex } from "../flatten";

describe("flatten (integration)", () => {
  const envApiKey = process.env.VITE_FIGMA_API_KEY;
  const envFileUrl = process.env.VITE_FIGMA_FILE_URL;
  const itEnv = envApiKey && envFileUrl ? test : test.skip;

  itEnv(
    "fetches real file, normalizes, and flattens",
    async () => {
      const origApi = process.env.VITE_FIGMA_API_KEY;
      const origUrl = process.env.VITE_FIGMA_FILE_URL;
      process.env.VITE_FIGMA_API_KEY = envApiKey as string;
      process.env.VITE_FIGMA_FILE_URL = envFileUrl as string;

      const file = await fetchFigmaFileFromEnv();
      const norm = normalizeFile(file);
      const idx = createIndex(norm);

      process.env.VITE_FIGMA_API_KEY = origApi;
      process.env.VITE_FIGMA_FILE_URL = origUrl;

      console.log(JSON.stringify(idx, null, 2));

      expect(idx.rootId).toBe(norm.id);
      expect(Array.isArray(idx.order)).toBe(true);
      expect(idx.order.length).toBeGreaterThan(0);
      expect(idx.parents[idx.rootId]).toBeNull();
      const hasShallowNodes = Object.values(idx.nodes).every(
        (n: any) => !("children" in n)
      );
      expect(hasShallowNodes).toBe(true);
      expect(typeof idx.depth[idx.rootId]).toBe("number");
      expect(idx.depth[idx.rootId]).toBe(0);
    },
    30000
  );
});
