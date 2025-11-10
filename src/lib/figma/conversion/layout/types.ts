export type CssDecls = Record<string, string>;

export type ConversionOptions = {
  canvasCentering?: boolean;
  preserveFractionalPixels?: boolean;
  centeredTextMode?: "auto" | "constraints";
  forceAbsoluteUnderNone?: boolean;
  cssFormat?: "compact" | "pretty";
  htmlFormat?: "fragment" | "document";
  cssHref?: string;
  htmlTitle?: string;
};
