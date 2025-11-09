/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect } from "vitest";
import { createIndex, generateFromIndex } from "../..";
import type { NormalizedNode } from "../../normalize/types/normalized.types";

function frame(
  id: string,
  mode: "horizontal" | "vertical" | "none",
  children: NormalizedNode[] = []
): NormalizedNode {
  return {
    id,
    name: id,
    type: "frame",
    children,
    layout: {
      mode,
      align: { main: "start", cross: "start" },
    },
    sizing: {
      width: "fixed",
      height: "fixed",
      widthPx: 500,
      heightPx: 500,
      position: "static",
    },
    style: {},
  };
}

function rect(
  id: string,
  sizing: {
    width: "hug" | "fill" | "fixed";
    height: "hug" | "fill" | "fixed";
    widthPx?: number;
    heightPx?: number;
    grow?: number;
    alignSelf?: "start" | "center" | "end" | "stretch";
  },
  position: "static" | "absolute" = "static",
  absolute?: { x: number; y: number; width: number; height: number }
): NormalizedNode {
  return {
    id,
    name: id,
    type: "rectangle",
    layout: { mode: "none", align: { main: "start", cross: "start" } },
    sizing: {
      width: sizing.width,
      height: sizing.height,
      widthPx: sizing.widthPx,
      heightPx: sizing.heightPx,
      grow: sizing.grow,
      alignSelf: sizing.alignSelf,
      position,
    },
    absolute,
    style: {},
  } as NormalizedNode;
}

function textNode(id: string, characters: string): NormalizedNode {
  return {
    id,
    name: id,
    type: "text",
    layout: { mode: "none", align: { main: "start", cross: "start" } },
    sizing: { width: "hug", height: "hug", position: "static" },
    style: {},
    text: { characters, textAlign: "left" },
  } as NormalizedNode;
}

describe("sizing semantics", () => {
  test("HUG does not force px width/height", () => {
    const child = rect("a", {
      width: "hug",
      height: "hug",
      widthPx: 120,
      heightPx: 40,
    });
    const root = frame("root", "vertical", [child]);
    const index = createIndex(root);
    const { css } = generateFromIndex(index);
    expect(css.includes("width:120px;")).toBe(false);
    expect(css.includes("height:40px;")).toBe(false);
  });

  test("Horizontal: width=fill uses flex grow; sibling fixed width keeps px", () => {
    const a = rect("fill", { width: "fill", height: "hug", grow: 1 });
    const b = rect("fixed", { width: "fixed", height: "hug", widthPx: 100 });
    const root = frame("root", "horizontal", [a, b]);
    const index = createIndex(root);
    const { css } = generateFromIndex(index);
    expect(css.includes("flex:1 1 0;")).toBe(true);
    expect(css.includes("width:100px;")).toBe(true);
  });

  test("Vertical: width=fill uses align-self:stretch (cross-axis)", () => {
    const a = rect("fillW", { width: "fill", height: "hug" });
    const root = frame("root", "vertical", [a]);
    const index = createIndex(root);
    const { css } = generateFromIndex(index);
    expect(css.includes("align-self:stretch;")).toBe(true);
  });
});

describe("text and absolute", () => {
  test("Text nodes reset default margins", () => {
    const t = textNode("t1", "Hello");
    const root = frame("root", "vertical", [t]);
    const index = createIndex(root);
    const { css } = generateFromIndex(index);
    expect(css.includes("margin:0;")).toBe(true);
  });

  test("Absolute child emits inline offsets and sizes", () => {
    const child = rect(
      "abs",
      { width: "fixed", height: "fixed", widthPx: 50, heightPx: 30 },
      "absolute",
      { x: 20, y: 10, width: 50, height: 30 }
    );
    const root = frame("root", "vertical", [child]);
    (root as any).absolute = { x: 0, y: 0, width: 300, height: 200 };
    const index = createIndex(root);
    const { html } = generateFromIndex(index);
    expect(html.includes("position:absolute;")).toBe(true);
    expect(html.includes("left:")).toBe(true);
    expect(html.includes("top:")).toBe(true);
    expect(html.includes("width:")).toBe(true);
    expect(html.includes("height:")).toBe(true);
  });
});
