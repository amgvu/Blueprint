import { serializeDecls } from "./utils";

export class ClassRegistry {
  private counter = 0;
  private byDecl: Map<string, string> = new Map();
  private declByClass: Map<string, Record<string, string>> = new Map();

  register(decls: Record<string, string> | undefined): string | null {
    if (!decls || Object.keys(decls).length === 0) return null;
    const key = serializeDecls(decls);
    const existing = this.byDecl.get(key);
    if (existing) return existing;
    const name = `c${++this.counter}`;
    this.byDecl.set(key, name);
    this.declByClass.set(name, decls);
    return name;
  }

  cssText(format: "compact" | "pretty" = "compact"): string {
    const parts: string[] = [];
    for (const [name, decls] of this.declByClass.entries()) {
      if (format === "pretty") {
        const keys = Object.keys(decls).sort();
        const body = keys.map((k) => `  ${k}: ${decls[k]};`).join("\n");
        parts.push(`.${name} {\n${body}\n}`);
      } else {
        parts.push(`.${name}{${serializeDecls(decls)}}`);
      }
    }
    return format === "pretty" ? parts.join("\n\n") : parts.join("\n");
  }
}
