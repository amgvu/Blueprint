export function extractFileKeyFromUrl(input: string): string {
  const match = input.match(
    /https?:\/\/www\.figma\.com\/(file|design)\/([a-zA-Z0-9]+)\//
  );
  if (match && match[2]) return match[2];
  if (/^[a-zA-Z0-9]+$/.test(input)) return input;
  throw new Error("Could not extract Figma file key");
}
