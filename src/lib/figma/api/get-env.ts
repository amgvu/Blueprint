export function getEnv(name: string): string | undefined {
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env[name] !== undefined
  )
    return process.env[name];
  const im = import.meta as unknown as {
    env?: Record<string, string | undefined>;
  };
  if (im && im.env && im.env[name] !== undefined) return im.env[name];
  return undefined;
}
