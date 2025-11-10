import type { NormalizedIndex } from "../../normalize/types/normalized.types";
import type { ConversionOptions } from "./types";

export function computeParentsNeedingRelative(
  index: NormalizedIndex,
  opts: ConversionOptions = {}
): Set<string> {
  const set = new Set<string>();
  for (const id of index.order) {
    const node = index.nodes[id];
    if (node.sizing.position === "absolute") {
      const parent = index.parents[id];
      if (parent) set.add(parent);
    }
    if (node.layout?.mode === "none") {
      const childIds = index.children[id] || [];
      const hasAbsChild = childIds.some((cid) => {
        const c = index.nodes[cid];
        if (!c) return false;
        if (c.sizing.position === "absolute") return true;
        if ((opts.forceAbsoluteUnderNone ?? true) && !!c.absolute) return true;
        return false;
      });
      if (hasAbsChild) set.add(id);
    }
  }
  return set;
}
