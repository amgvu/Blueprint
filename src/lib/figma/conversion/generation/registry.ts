import { serializeDecls } from "./utils";

export class ClassRegistry {
  private counter = 0;
  private byDecl: Map<string, string> = new Map();
  private declByClass: Map<string, string> = new Map();

  register(decls: Record<string, string> | undefined): string | null {
    if (!decls || Object.keys(decls).length === 0) return null;
    const key = serializeDecls(decls);
    const existing = this.byDecl.get(key);
    if (existing) return existing;
    const name = `c${++this.counter}`;
    this.byDecl.set(key, name);
    this.declByClass.set(name, key);
    return name;
  }

  cssText(): string {
    const parts: string[] = [];
    for (const [name, declStr] of this.declByClass.entries()) {
      parts.push(`.${name}{${declStr}}`);
    }
    return parts.join("\n");
  }
}
