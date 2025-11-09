import { describe, test, expect } from "vitest";
import {
  fetchFigmaFileFromEnv,
  normalizeFile,
  createIndex,
  generateFromIndex,
} from "../..";

describe("generate (integration)", () => {
  const envApiKey = process.env.VITE_FIGMA_API_KEY;
  const envFileUrl = process.env.VITE_FIGMA_FILE_URL;
  const itEnv = envApiKey && envFileUrl ? test : test.skip;

  itEnv(
    "fetches, normalizes, flattens, and generates HTML/CSS",
    async () => {
      const origApi = process.env.VITE_FIGMA_API_KEY;
      const origUrl = process.env.VITE_FIGMA_FILE_URL;
      process.env.VITE_FIGMA_API_KEY = envApiKey as string;
      process.env.VITE_FIGMA_FILE_URL = envFileUrl as string;

      const file = await fetchFigmaFileFromEnv();
      const norm = normalizeFile(file);
      const index = createIndex(norm);
      const { html, css } = generateFromIndex(index);

      process.env.VITE_FIGMA_API_KEY = origApi;
      process.env.VITE_FIGMA_FILE_URL = origUrl;

      console.log("HTML:\n" + html);
      console.log("CSS:\n" + css);

      expect(typeof html).toBe("string");
      expect(typeof css).toBe("string");
      expect(html.length).toBeGreaterThan(0);
      expect(html.includes("<")).toBe(true);
    },
    30000
  );
});
