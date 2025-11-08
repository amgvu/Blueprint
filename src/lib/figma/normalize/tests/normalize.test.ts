import { describe, test, expect } from "vitest";
import { fetchFigmaFileFromEnv } from "../../api";
import { normalizeFile } from "..";

describe("normalize (integration)", () => {
  const envApiKey = process.env.VITE_FIGMA_API_KEY;
  const envFileUrl = process.env.VITE_FIGMA_FILE_URL;
  const itEnv = envApiKey && envFileUrl ? test : test.skip;

  itEnv(
    "fetches real file and normalizes",
    async () => {
      const origApi = process.env.VITE_FIGMA_API_KEY;
      const origUrl = process.env.VITE_FIGMA_FILE_URL;
      process.env.VITE_FIGMA_API_KEY = envApiKey as string;
      process.env.VITE_FIGMA_FILE_URL = envFileUrl as string;
      const file = await fetchFigmaFileFromEnv();
      process.env.VITE_FIGMA_API_KEY = origApi;
      process.env.VITE_FIGMA_FILE_URL = origUrl;

      const norm = normalizeFile(file);
      console.log(JSON.stringify(norm, null, 2));
      expect(norm.type).toBe("root");
      expect(Array.isArray(norm.children)).toBe(true);
      const canvas = norm.children?.[0];
      expect(canvas?.type).toBe("canvas");
      const hasDescendants =
        !!canvas && !!canvas.children && canvas.children.length >= 0;
      expect(hasDescendants).toBe(true);
    },
    30000
  );
});
