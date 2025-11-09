import type {
  NormalizedIndex,
  NormalizedNode,
  NormalizedNodeType,
  NormalizedShallowNode,
} from "./types/normalized.types";

export function createIndex(root: NormalizedNode): NormalizedIndex {
  const nodes: Record<string, NormalizedShallowNode> = {};
  const parents: Record<string, string | null> = {};
  const children: Record<string, string[]> = {};
  const order: string[] = [];
  const path: Record<string, string[]> = {};
  const byType: Partial<Record<NormalizedNodeType, string[]>> = {};
  const depth: Record<string, number> = {};

  function visit(
    node: NormalizedNode,
    parentId: string | null,
    stack: string[]
  ) {
    const { children: kidsRaw, ...shallow } = node;
    nodes[node.id] = shallow;
    parents[node.id] = parentId;
    children[node.id] = [];
    const currentPath = [...stack, node.id];
    path[node.id] = currentPath;
    order.push(node.id);
    depth[node.id] = currentPath.length - 1;
    const list = byType[node.type] || [];
    list.push(node.id);
    byType[node.type] = list;
    const kids = kidsRaw || [];
    for (const k of kids) {
      children[node.id].push(k.id);
      visit(k, node.id, currentPath);
    }
  }

  visit(root, null, []);
  return {
    rootId: root.id,
    nodes,
    parents,
    children,
    order,
    path,
    byType,
    depth,
  };
}
