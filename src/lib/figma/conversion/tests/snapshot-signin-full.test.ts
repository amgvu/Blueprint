/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect } from "vitest";
import { createIndex, generateFromIndex } from "../..";
import type {
  NormalizedNode,
  RGBA,
  BorderRadius,
} from "../../normalize/types/normalized.types";

function rgba(r: number, g: number, b: number, a = 1): RGBA {
  return { r: r / 255, g: g / 255, b: b / 255, a };
}

function frame(
  id: string,
  opts: {
    mode: "horizontal" | "vertical" | "none";
    width: number;
    height: number;
    abs?: { x: number; y: number } | null;
    background?: RGBA | null;
    radius?: BorderRadius | null;
    gap?: number;
    padding?: { top: number; right: number; bottom: number; left: number };
    align?: {
      main: "start" | "center" | "end" | "space-between";
      cross: "start" | "center" | "end" | "stretch";
    };
    wrap?: boolean;
    clips?: boolean;
  },
  children: NormalizedNode[] = []
): NormalizedNode {
  const abs = opts.abs
    ? { x: opts.abs.x, y: opts.abs.y, width: opts.width, height: opts.height }
    : undefined;
  return {
    id,
    name: id,
    type: "frame",
    children,
    layout: {
      mode: opts.mode,
      gap: opts.gap,
      padding: opts.padding,
      align: opts.align || { main: "start", cross: "start" },
      wrap: opts.wrap,
      clipsContent: opts.clips,
    },
    sizing: {
      width: "fixed",
      height: "fixed",
      widthPx: opts.width,
      heightPx: opts.height,
      position: abs ? "absolute" : "static",
    },
    absolute: abs,
    style: {
      background: opts.background ?? null,
      borderRadius: opts.radius ?? null,
    },
  } as NormalizedNode;
}

function rect(
  id: string,
  opts: {
    width: number;
    height: number;
    abs: { x: number; y: number };
    radius?: BorderRadius | null;
    background?: RGBA | null;
  }
): NormalizedNode {
  return {
    id,
    name: id,
    type: "rectangle",
    layout: { mode: "none", align: { main: "start", cross: "start" } },
    sizing: {
      width: "fixed",
      height: "fixed",
      widthPx: opts.width,
      heightPx: opts.height,
      position: "absolute",
    },
    absolute: {
      x: opts.abs.x,
      y: opts.abs.y,
      width: opts.width,
      height: opts.height,
    },
    style: {
      background: opts.background ?? null,
      borderRadius: opts.radius ?? null,
    },
  } as NormalizedNode;
}

function textAbs(
  id: string,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  align: "left" | "center" | "right" = "left"
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
    text: { characters: text, textAlign: align },
  } as NormalizedNode;
}

function canvas(
  id: string,
  children: NormalizedNode[],
  bg?: RGBA | null
): NormalizedNode {
  return {
    id,
    name: id,
    type: "canvas",
    children,
    layout: { mode: "none", align: { main: "start", cross: "start" } },
    sizing: { width: "hug", height: "hug", position: "static" },
    style: { background: bg ?? null },
  } as NormalizedNode;
}

describe("snapshot: full sign-in screen", () => {
  test("generates expected HTML and CSS", () => {
    const dark = rgba(30, 30, 30, 1);
    const white = rgba(250, 250, 250, 1);
    const gray = rgba(225, 224, 230, 1);

    const indicator = rect("homeIndicator", {
      width: 139,
      height: 5,
      abs: { x: 127, y: 839 },
      radius: 100,
      background: null,
    });
    const indicatorBar = frame(
      "indicatorBar",
      {
        mode: "none",
        width: 393,
        height: 21,
        abs: { x: 0, y: 831 },
        background: null,
        radius: null,
      },
      [indicator]
    );

    const title = textAbs("title", "Sign in", 32, 170, 154, 58, "left");

    const emailRow = frame(
      "emailRow",
      {
        mode: "horizontal",
        width: 329,
        height: 58,
        background: null,
        radius: { topLeft: 8, topRight: 8, bottomRight: 0, bottomLeft: 0 },
        gap: 10,
        padding: { top: 20, right: 16, bottom: 20, left: 16 },
        align: { main: "start", cross: "center" },
      },
      [
        {
          id: "emailText",
          name: "emailText",
          type: "text",
          layout: { mode: "none", align: { main: "start", cross: "start" } },
          sizing: { width: "hug", height: "hug", position: "static" },
          style: {},
          text: { characters: "andy@gmail.com", textAlign: "left" },
        } as NormalizedNode,
      ]
    );

    const passwordRow = frame(
      "passwordRow",
      {
        mode: "horizontal",
        width: 329,
        height: 59,
        background: null,
        radius: { topLeft: 0, topRight: 0, bottomRight: 8, bottomLeft: 8 },
        gap: 10,
        padding: { top: 20, right: 16, bottom: 20, left: 16 },
        align: { main: "start", cross: "center" },
      },
      [
        {
          id: "passwordText",
          name: "passwordText",
          type: "text",
          layout: { mode: "none", align: { main: "start", cross: "start" } },
          sizing: { width: "hug", height: "hug", position: "static" },
          style: {},
          text: { characters: "Password", textAlign: "left" },
        } as NormalizedNode,
      ]
    );

    const inputs = frame(
      "inputs",
      {
        mode: "vertical",
        width: 329,
        height: 117,
        abs: { x: 32, y: 252 },
        background: null,
        radius: null,
      },
      [emailRow, passwordRow]
    );

    const btnPrimary = frame(
      "btnPrimary",
      {
        mode: "column" as any,
        width: 361,
        height: 46,
        abs: { x: 16, y: 662 },
        background: null,
        radius: 62,
        gap: 8,
        align: { main: "center", cross: "center" },
        clips: true,
      },
      [
        {
          id: "btnPrimaryLabel",
          name: "btnPrimaryLabel",
          type: "text",
          layout: { mode: "none", align: { main: "start", cross: "start" } },
          sizing: { width: "hug", height: "hug", position: "static" },
          style: {},
          text: { characters: "Sign in", textAlign: "left" },
        } as NormalizedNode,
      ]
    );

    const btnSecondary = frame(
      "btnSecondary",
      {
        mode: "column" as any,
        width: 361,
        height: 46,
        abs: { x: 16, y: 720 },
        background: gray,
        radius: 62,
        gap: 8,
        align: { main: "center", cross: "center" },
        clips: true,
      },
      [
        {
          id: "btnSecondaryLabel",
          name: "btnSecondaryLabel",
          type: "text",
          layout: { mode: "none", align: { main: "start", cross: "start" } },
          sizing: { width: "hug", height: "hug", position: "static" },
          style: {},
          text: { characters: "Create account", textAlign: "left" },
        } as NormalizedNode,
      ]
    );

    const forgot = textAbs(
      "forgot",
      "Forgot password",
      16,
      778,
      361,
      37,
      "center"
    );

    const device = frame(
      "device",
      {
        mode: "none",
        width: 393,
        height: 852,
        abs: { x: 0, y: 0 },
        background: white,
        radius: 32,
      },
      [indicatorBar, title, inputs, btnPrimary, btnSecondary, forgot]
    );

    const centered = frame(
      "centered",
      { mode: "none", width: 393, height: 852, background: null, radius: null },
      [device]
    );

    const root = canvas("canvas", [centered], dark);

    const index = createIndex(root);
    const { html, css } = generateFromIndex(index);

    expect(html).toMatchSnapshot();
    expect(css).toMatchSnapshot();
  });
});
