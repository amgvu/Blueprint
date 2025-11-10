export type RenderNode = {
  id: string;
  tag: string;
  classNames: string[];
  inline: Record<string, string>;
  textContent?: string;
  children: RenderNode[];
};
