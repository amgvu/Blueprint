/* eslint-disable no-useless-escape */
import type { NormalizedIndex } from "../normalize/types/normalized.types";
import {
  mapFlexContainerCss,
  mapChildCss,
  computeParentsNeedingRelative,
} from "./layout";

type RenderNode = {
  id: string;
  tag: string;
  classNames: string[];
  inline: Record<string, string>;
  textContent?: string;
  children: RenderNode[];
};

class ClassRegistry {
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

export function generateFromIndex(index: NormalizedIndex): {
  html: string;
  css: string;
} {
  const registry = new ClassRegistry();
  const needsRelative = computeParentsNeedingRelative(index);
  const root = buildRenderTree(index, index.rootId, registry, needsRelative);
  const html = emitHtml(root, 0);
  const css = registry.cssText();
  return { html, css };
}

function buildRenderTree(
  index: NormalizedIndex,
  id: string,
  registry: ClassRegistry,
  needsRelative: Set<string>,
  parentId: string | null = null
): RenderNode {
  const node = index.nodes[id];
  const tag = pickTag(node.type);
  const containerDecls = mapFlexContainerCss(index, id);
  if (needsRelative.has(id) && containerDecls.display !== "grid")
    containerDecls.position = "relative";
  const { classDecls, inlineDecls } = mapChildCss(index, id, parentId);

  const classA = registry.register(containerDecls);
  const classB = registry.register(classDecls);
  const classC = registry.register(inlineDecls);
  const classNames = [classA, classB, classC].filter(Boolean) as string[];

  const textContent = node.type === "text" ? node.text?.characters : undefined;

  const childIds = index.children[id] || [];
  const children = childIds.map((cid) =>
    buildRenderTree(index, cid, registry, needsRelative, id)
  );
  return { id, tag, classNames, inline: {}, textContent, children };
}

function pickTag(type: string): string {
  if (type === "text") return "p";
  return "div";
}

function emitHtml(node: RenderNode, depth: number): string {
  const pad = "  ".repeat(depth);
  const cls = node.classNames.length
    ? ` class=\"${node.classNames.join(" ")}\"`
    : "";
  const styleStr = Object.keys(node.inline).length
    ? ` style=\"${serializeDecls(node.inline)}\"`
    : "";
  if (node.children.length === 0 && !node.textContent) {
    return `${pad}<${node.tag}${cls}${styleStr}></${node.tag}>`;
  }
  const inner = node.textContent
    ? escapeHtml(node.textContent)
    : node.children.map((c) => "\n" + emitHtml(c, depth + 1)).join("") +
      "\n" +
      pad;
  return `${pad}<${node.tag}${cls}${styleStr}>${inner}</${node.tag}>`;
}

function serializeDecls(decls: Record<string, string>): string {
  const keys = Object.keys(decls).sort();
  return keys.map((k) => `${k}:${decls[k]};`).join("");
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
