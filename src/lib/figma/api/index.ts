import type { FigmaFile } from "../types/figma.types";
import { getEnv } from "./get-env";
import { extractFileKeyFromUrl } from "./extract-key";

export async function fetchFigmaFileFromEnv(
  fetchImpl?: typeof fetch
): Promise<FigmaFile> {
  const apiKey = getEnv("VITE_FIGMA_API_KEY");
  const fileUrl = getEnv("VITE_FIGMA_FILE_URL");
  if (!apiKey || !fileUrl)
    throw new Error("Missing env VITE_FIGMA_API_KEY or VITE_FIGMA_FILE_URL");
  const key = extractFileKeyFromUrl(fileUrl);
  const res = await (fetchImpl || fetch)(
    `https://api.figma.com/v1/files/${key}`,
    {
      headers: { "X-Figma-Token": apiKey },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma API error ${res.status}: ${body}`);
  }
  const data = (await res.json()) as FigmaFile;
  return data;
}
