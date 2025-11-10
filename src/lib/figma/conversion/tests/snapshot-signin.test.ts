/* eslint-disable no-useless-escape */
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
      widthPx: 393,
      heightPx: 200,
      position: "static",
    },
    absolute: { x: 0, y: 0, width: 393, height: 200 },
    style: {},
  };
}

function textAbs(
  id: string,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number
): NormalizedNode {
  return {
    id,
    name: id,
    type: "text",
    layout: { mode: "none", align: { main: "start", cross: "start" } },
    sizing: {
      width: "fixed",
      height: "fixed",
      widthPx: w,
      heightPx: h,
      position: "absolute",
    },
    absolute: { x, y, width: w, height: h },
    style: {},
    text: { characters: text, textAlign: "center" },
  } as NormalizedNode;
}

describe("snapshot: minimal sign-in element", () => {
  test("centered absolute text snapshot", () => {
    const t = textAbs("t1", "Forgot password", 16, 100, 361, 37);
    const root = frame("root", "vertical", [t]);
    const index = createIndex(root);
    const { html, css } = generateFromIndex(index);

    expect(html).toMatchInlineSnapshot(`
      "<div class=\"c1 c2\">\n  <p class=\"c3\" style=\"height:37px;left:16px;position:absolute;top:100px;width:361px;\">Forgot password</p>\n</div>"
    `);
    expect(css).toMatchInlineSnapshot(`
      ".c1{align-items:flex-start;display:flex;flex-direction:column;font-family:system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;justify-content:flex-start;position:relative;}\r\n      .c2{height:200px;width:393px;}\r\n      .c3{margin:0 auto;text-align:center;width:361px;}"
    `);
  });
});

