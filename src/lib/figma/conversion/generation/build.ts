/* eslint-disable no-useless-escape */
import type { NormalizedIndex } from "../../normalize/types/normalized.types";
import { mapFlexContainerCss, mapChildCss } from "../layout";
import { sansFonts } from "../layout/utils";
import type { ConversionOptions } from "../layout";
import { ClassRegistry } from "./registry";
import {
  serializeDecls,
  escapeHtml,
  pickTag,
  combineClasses,
  isRenderableHtmlCandidate,
} from "./utils";
import type { RenderNode } from "./types";

export function buildRenderTree(
  index: NormalizedIndex,
  id: string,
  registry: ClassRegistry,
  needsRelative: Set<string>,
  parentId: string | null = null,
  opts: ConversionOptions = {}
): RenderNode | null {
  const node = index.nodes[id];
  const tag = pickTag(node.type);
  const containerDecls = mapFlexContainerCss(index, id, opts);
  if (!parentId) {
    containerDecls["font-family"] = sansFonts;
  }
  if (needsRelative.has(id) && containerDecls.display !== "grid")
    containerDecls.position = "relative";
  const { classDecls, inlineDecls } = mapChildCss(index, id, parentId, opts);

  const classA = registry.register(containerDecls);
  const classB = registry.register(classDecls);
  const classNames = combineClasses(classA, classB);

  const textContentRaw =
    node.type === "text" ? node.text?.characters : undefined;
  const textContent =
    typeof textContentRaw === "string" && textContentRaw.trim().length > 0
      ? textContentRaw
      : undefined;

  const childIds = index.children[id] || [];
  const children = childIds
    .map((cid) =>
      buildRenderTree(index, cid, registry, needsRelative, id, opts)
    )
    .filter(Boolean) as RenderNode[];

  const isRenderable = isRenderableHtmlCandidate(
    textContent,
    children.length,
    classNames.length,
    inlineDecls
  );
  if (!isRenderable) return null;

  return { id, tag, classNames, inline: inlineDecls, textContent, children };
}

export function emitHtml(node: RenderNode, depth: number): string {
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
