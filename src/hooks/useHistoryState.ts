import { useCallback, useRef, useState } from 'react';
import type { Edge, Node } from 'reactflow';

type Snapshot = { nodes: Node[]; edges: Edge[] };

const MAX_HISTORY = 100;

/**
 * Undo/redo for a (nodes, edges) pair. Callers explicitly call `pushHistory`
 * before any committable mutation; transient changes (live drag, selection)
 * skip the snapshot.
 */
export function useHistoryState(initialNodes: Node[] = [], initialEdges: Edge[] = []) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);
  // Refs mirror state so pushHistory captures the latest snapshot without re-binding.
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const pushHistory = useCallback(() => {
    past.current.push({ nodes: nodesRef.current, edges: edgesRef.current });
    if (past.current.length > MAX_HISTORY) past.current.shift();
    future.current = [];
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return false;
    const prev = past.current.pop()!;
    future.current.push({ nodes: nodesRef.current, edges: edgesRef.current });
    setNodes(prev.nodes);
    setEdges(prev.edges);
    return true;
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return false;
    const next = future.current.pop()!;
    past.current.push({ nodes: nodesRef.current, edges: edgesRef.current });
    setNodes(next.nodes);
    setEdges(next.edges);
    return true;
  }, []);

  const resetHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    past.current = [];
    future.current = [];
    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  return { nodes, edges, setNodes, setEdges, pushHistory, undo, redo, resetHistory };
}
