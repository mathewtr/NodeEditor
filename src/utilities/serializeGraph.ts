import type { Edge, Node } from 'reactflow';

/**
 * Option B graph format: comment/group nodes are split into a sibling
 * `annotations` key so the `nodes`/`edges` arrays Unity reads stay pure
 * (Unity's JsonUtility silently ignores unknown top-level keys).
 */
type SerializedGraph = {
  nodes: Node[];
  edges: Edge[];
  annotations?: {
    comments: Node[];
    groups: Node[];
  };
};

const isAnnotation = (n: Node) => n.type === 'comment' || n.type === 'group';

const stripFunctions = (node: Node): Node => ({
  ...node,
  data: Object.fromEntries(
    Object.entries(node.data ?? {}).filter(([, v]) => typeof v !== 'function')
  ),
});

export function serializeGraph(nodes: Node[], edges: Edge[]): string {
  const clean = nodes.map(stripFunctions);
  const realNodes = clean.filter((n) => !isAnnotation(n));
  const comments = clean.filter((n) => n.type === 'comment');
  const groups = clean.filter((n) => n.type === 'group');

  const payload: SerializedGraph = { nodes: realNodes, edges };
  if (comments.length > 0 || groups.length > 0) {
    payload.annotations = { comments, groups };
  }
  return JSON.stringify(payload, null, 2);
}

export function deserializeGraph(
  text: string
): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const json = JSON.parse(text) as Partial<SerializedGraph>;
    if (!Array.isArray(json.nodes) || !Array.isArray(json.edges)) return null;

    const annotations = json.annotations;
    const merged: Node[] = [
      ...json.nodes,
      ...(annotations?.comments ?? []),
      ...(annotations?.groups ?? []),
    ];
    return { nodes: merged, edges: json.edges };
  } catch {
    return null;
  }
}
