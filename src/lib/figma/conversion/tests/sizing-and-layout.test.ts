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

  test("Absolute centered text stays centered with block-level tag", () => {
    const t = textNode("t-forgot", "Forgot password");
    (t as any).sizing.position = "absolute";
    (t as any).absolute = { x: 16, y: 778, width: 361, height: 37 };

    const root = frame("root", "vertical", [t]);
    (root as any).absolute = { x: 0, y: 0, width: 393, height: 852 };

    const index = createIndex(root);
    const { html, css } = generateFromIndex(index);
    expect(html.includes("Forgot password")).toBe(true);
    expect(html.includes("position:absolute;")).toBe(true);
    expect(html.includes("left:16px;")).toBe(true);
    expect(html.includes("width:361px;")).toBe(true);
    expect(css.includes("text-align:center;")).toBe(true);
  });

  test("Absolute child with right/bottom constraints uses right/bottom offsets", () => {
    const child = rect(
      "absRB",
      { width: "fixed", height: "fixed", widthPx: 50, heightPx: 30 },
      "absolute",
      { x: 343, y: 812, width: 50, height: 30 }
    );
    (child as any).sizing.constraints = {
      horizontal: "right",
      vertical: "bottom",
    };
    const root = frame("root", "vertical", [child]);
    (root as any).absolute = { x: 0, y: 0, width: 393, height: 852 };
    const index = createIndex(root);
    const { html } = generateFromIndex(index);
    expect(html.includes("right:0px;")).toBe(true);
    expect(html.includes("bottom:10px;")).toBe(true);
    expect(html.includes("left:")).toBe(false);
    expect(html.includes("top:")).toBe(false);
  });

  test("Absolute child with left_right and top_bottom stretch omits width/height and sets both offsets", () => {
    const child = rect(
      "absStretch",
      { width: "fixed", height: "fixed", widthPx: 100, heightPx: 50 },
      "absolute",
      { x: 20, y: 30, width: 100, height: 50 }
    );
    (child as any).sizing.constraints = {
      horizontal: "left_right",
      vertical: "top_bottom",
    };
    const root = frame("root", "vertical", [child]);
    (root as any).absolute = { x: 0, y: 0, width: 400, height: 300 };
    const index = createIndex(root);
    const { html } = generateFromIndex(index);
    expect(html.includes("left:20px;")).toBe(true);
    expect(html.includes("right:280px;")).toBe(true);
    expect(html.includes("top:30px;")).toBe(true);
    expect(html.includes("bottom:220px;")).toBe(true);
    expect(html.includes("width:")).toBe(false);
    expect(html.includes("height:")).toBe(false);
  });

  test("Text typography mapping applied (size/weight/line-height + default sans)", () => {
    const t = textNode("t-typo", "Hello");
    (t as any).text.fontSize = 16;
    (t as any).text.fontWeight = 700;
    (t as any).text.fontFamily = "Inter";
    (t as any).text.lineHeightPx = 20;
    const root = frame("root", "vertical", [t]);
    const index = createIndex(root);
    const { css } = generateFromIndex(index);
    expect(css.includes("font-size:16px;"));
    expect(css.includes("font-weight:700;"));
    expect(css.includes("font-family:system-ui") || css.includes("font-family:-apple-system"));
    expect(css.includes("line-height:20px;"));
  });
});
