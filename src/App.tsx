import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  type NodeProps,
  type NodeDragHandler,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Controls,
  Background,
  SelectionMode,
  useReactFlow,
  type NodeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/App.css';
import { useNodeDefinitions, getNodeDefinition } from './hooks/useNodeDefinitions';
import { NodeDefinitionsContext } from './contexts/NodeDefinitionsContext';
import { NodeCatalog } from './components/NodeCatalog';
import { NewGraphButton } from './components/NodeNew';
import { OpenGraphButton } from './components/NodeOpen';
import { SaveGraphButton } from './components/NodeSave';
import { SaveAsGraphButton } from './components/NodeSaveAs';
import { GenericNode } from './components/nodes/GenericNode';
import { CommentNode } from './components/nodes/CommentNode';
import { GroupNode } from './components/nodes/GroupNode';
import { Inspector } from './components/Inspector';
import { useHistoryState } from './hooks/useHistoryState';

type Clipboard = { nodes: Node[]; edges: Edge[] } | null;

function App() {
  const { definitions, loading, error } = useNodeDefinitions();
  const { nodes, edges, setNodes, setEdges, pushHistory, undo, redo, resetHistory } = useHistoryState();
  const reactFlowInstance = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const saveFileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const clipboardRef = useRef<Clipboard>(null);
  // Track latest mouse position over the canvas (for paste-at-cursor).
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Build nodeTypes map dynamically from definitions; comment & group are built-in.
  const nodeTypes = useMemo(() => {
    const types: Record<string, React.ComponentType<NodeProps>> = {
      comment: CommentNode,
      group: GroupNode,
    };
    if (definitions) {
      for (const def of definitions.nodeTypes) {
        types[def.id] = GenericNode;
      }
    }
    return types;
  }, [definitions]);

  // ── Mutation handlers ──────────────────────────────────────────────
  const handleNodeDataChange = useCallback((
    nodeId: string,
    field: string,
    value: number | number[] | string
  ) => {
    pushHistory();
    setNodes((curr) =>
      curr.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, [field]: value } } : node
      )
    );
    setSelectedNode((prev) =>
      prev?.id === nodeId ? { ...prev, data: { ...prev.data, [field]: value } } : prev
    );
  }, [pushHistory, setNodes]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Snapshot before destructive changes only.
    if (changes.some((c) => c.type === 'remove')) pushHistory();
    setNodes((curr) => applyNodeChanges(changes, curr));
  }, [pushHistory, setNodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (changes.some((c) => c.type === 'remove')) pushHistory();
    setEdges((curr) => applyEdgeChanges(changes, curr));
  }, [pushHistory, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    pushHistory();
    setEdges((eds) => {
      const filtered = eds.filter(
        (e) => !(e.target === params.target && e.targetHandle === params.targetHandle)
      );
      return addEdge(params, filtered);
    });
  }, [pushHistory, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);
  const closeInspector = useCallback(() => setSelectedNode(null), []);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    setSelectedNode((prev) =>
      prev && deleted.some((n) => n.id === prev.id) ? null : prev
    );
  }, []);

  // ── Add node (spawns at viewport center) ───────────────────────────
  const viewportCenter = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 200, y: 200 };
    return reactFlowInstance.screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }, [reactFlowInstance]);

  const flashNode = useCallback((nodeId: string) => {
    setTimeout(() => {
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, highlightClass: 'node-just-added-fade' } } : n
      ));
    }, 600);
    setTimeout(() => {
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, highlightClass: undefined } } : n
      ));
    }, 2100);
  }, [setNodes]);

  const handleAddNode = useCallback((nodeTypeId: string) => {
    if (!definitions) return;
    const definition = getNodeDefinition(definitions, nodeTypeId);
    if (!definition) return;

    const data: Record<string, unknown> = {
      label: definition.title,
      onChange: handleNodeDataChange,
      highlightClass: 'node-just-added',
    };
    definition.parameters.forEach((param) => {
      data[param.name] = param.default;
    });

    // Center the node on the viewport center (offset by approx half its size).
    const center = viewportCenter();
    const nodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: nodeTypeId,
      position: { x: center.x - 100, y: center.y - 40 },
      data,
    };

    pushHistory();
    setNodes((nds) => [...nds, newNode]);
    flashNode(nodeId);
  }, [definitions, handleNodeDataChange, viewportCenter, pushHistory, setNodes, flashNode]);

  const handleAddComment = useCallback(() => {
    const center = viewportCenter();
    const nodeId = `comment-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: 'comment',
      position: { x: center.x - 100, y: center.y - 40 },
      data: {
        text: '',
        onChange: handleNodeDataChange,
        highlightClass: 'node-just-added',
      },
    };
    pushHistory();
    setNodes((nds) => [...nds, newNode]);
    flashNode(nodeId);
  }, [viewportCenter, handleNodeDataChange, pushHistory, setNodes, flashNode]);

  // ── Group / Ungroup (frame-style: no reparenting) ─────────────────
  // A "group" is a translucent rectangle that lives BEHIND other nodes.
  // Children aren't reparented; dragging the group moves whatever currently
  // sits inside its world-space bounds (computed at drag start).
  const groupSelected = useCallback(() => {
    const selected = nodes.filter((n) => n.selected && n.type !== 'group');
    if (selected.length < 2) return;

    const PAD = 40;
    const HEADER = 36;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of selected) {
      const w = (n.width ?? 200);
      const h = (n.height ?? 80);
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + w);
      maxY = Math.max(maxY, n.position.y + h);
    }
    const groupId = `group-${Date.now()}`;
    const groupX = minX - PAD;
    const groupY = minY - PAD - HEADER;
    const groupW = (maxX - minX) + PAD * 2;
    const groupH = (maxY - minY) + PAD * 2 + HEADER;

    const groupNode: Node = {
      id: groupId,
      type: 'group',
      position: { x: groupX, y: groupY },
      data: {
        label: 'Group',
        width: groupW,
        height: groupH,
        onChange: handleNodeDataChange,
      },
      style: { width: groupW, height: groupH },
      // Render behind real nodes so wires stay clickable.
      zIndex: -1,
      selectable: true,
      draggable: true,
    };

    pushHistory();
    // Prepend the group so it renders first (lowest in z-order).
    setNodes((curr) => [groupNode, ...curr.map((n) => ({ ...n, selected: false }))]);
  }, [nodes, handleNodeDataChange, pushHistory, setNodes]);

  const ungroupSelected = useCallback(() => {
    const selectedGroupIds = new Set(
      nodes.filter((n) => n.selected && n.type === 'group').map((g) => g.id)
    );
    if (selectedGroupIds.size === 0) return;
    pushHistory();
    setNodes((curr) => curr.filter((n) => !selectedGroupIds.has(n.id)));
  }, [nodes, pushHistory, setNodes]);

  // When a group node starts dragging, capture the IDs of every other node
  // currently inside its bounds. Those nodes get translated by the same delta
  // on each drag tick, then forgotten on drag stop.
  const groupDragContextRef = useRef<{
    groupId: string;
    startGroupPos: { x: number; y: number };
    children: { id: string; startPos: { x: number; y: number } }[];
  } | null>(null);

  const handleNodeDragStart: NodeDragHandler = useCallback((_e, node) => {
    pushHistory();
    if (node.type !== 'group') {
      groupDragContextRef.current = null;
      return;
    }
    const gx = node.position.x;
    const gy = node.position.y;
    const gw = ((node.data as { width?: number })?.width) ?? (node.style?.width as number) ?? 320;
    const gh = ((node.data as { height?: number })?.height) ?? (node.style?.height as number) ?? 220;
    const inside = nodes.filter((n) => {
      if (n.id === node.id) return false;
      if (n.type === 'group') return false;
      const nx = n.position.x;
      const ny = n.position.y;
      const nw = n.width ?? 200;
      const nh = n.height ?? 80;
      // Treat a node as "inside" if its center is within the group bounds.
      const cx = nx + nw / 2;
      const cy = ny + nh / 2;
      return cx >= gx && cx <= gx + gw && cy >= gy && cy <= gy + gh;
    });
    groupDragContextRef.current = {
      groupId: node.id,
      startGroupPos: { x: gx, y: gy },
      children: inside.map((n) => ({ id: n.id, startPos: { x: n.position.x, y: n.position.y } })),
    };
  }, [nodes, pushHistory]);

  const handleNodeDrag: NodeDragHandler = useCallback((_e, node) => {
    const ctx = groupDragContextRef.current;
    if (!ctx || ctx.groupId !== node.id) return;
    const dx = node.position.x - ctx.startGroupPos.x;
    const dy = node.position.y - ctx.startGroupPos.y;
    const childMap = new Map(ctx.children.map((c) => [c.id, c.startPos]));
    setNodes((curr) =>
      curr.map((n) => {
        const start = childMap.get(n.id);
        if (!start) return n;
        return { ...n, position: { x: start.x + dx, y: start.y + dy } };
      })
    );
  }, [setNodes]);

  const handleNodeDragStop: NodeDragHandler = useCallback(() => {
    groupDragContextRef.current = null;
  }, []);

  // ── Copy / Paste ───────────────────────────────────────────────────
  const copySelection = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdges = edges.filter(
      (e) => selectedIds.has(e.source) && selectedIds.has(e.target)
    );
    // Deep-clone but strip non-serializable bits (onChange) — re-added at paste.
    clipboardRef.current = {
      nodes: selectedNodes.map((n) => {
        const cleanData = { ...(n.data as Record<string, unknown>) };
        delete cleanData.onChange;
        delete cleanData.highlightClass;
        return { ...n, data: cleanData, selected: false } as Node;
      }),
      edges: selectedEdges.map((e) => ({ ...e, selected: false })),
    };
  }, [nodes, edges]);

  const pasteClipboard = useCallback(() => {
    const clip = clipboardRef.current;
    if (!clip || clip.nodes.length === 0) return;

    // Determine paste anchor: cursor position if known, else viewport center
    // (with a small offset so pasted nodes don't sit exactly on top of the originals).
    let anchor: { x: number; y: number };
    const rect = canvasRef.current?.getBoundingClientRect();
    if (mousePosRef.current && rect) {
      anchor = reactFlowInstance.screenToFlowPosition({
        x: mousePosRef.current.x,
        y: mousePosRef.current.y,
      });
    } else {
      const c = viewportCenter();
      anchor = { x: c.x + 40, y: c.y + 40 };
    }

    // Compute the top-left of the copied selection so we can offset to anchor.
    let minX = Infinity, minY = Infinity;
    for (const n of clip.nodes) {
      if (!n.parentNode) {
        minX = Math.min(minX, n.position.x);
        minY = Math.min(minY, n.position.y);
      }
    }
    if (!isFinite(minX)) { minX = 0; minY = 0; }

    const idMap = new Map<string, string>();
    const stamp = Date.now();
    clip.nodes.forEach((n, i) => idMap.set(n.id, `paste-${stamp}-${i}`));

    const newNodes: Node[] = clip.nodes.map((n) => {
      const newId = idMap.get(n.id)!;
      const newParent = n.parentNode ? idMap.get(n.parentNode) : undefined;
      const basePos = newParent
        ? n.position // child positions are parent-relative, keep them
        : { x: anchor.x + (n.position.x - minX), y: anchor.y + (n.position.y - minY) };
      return {
        ...n,
        id: newId,
        parentNode: newParent,
        position: basePos,
        selected: true,
        data: { ...n.data, onChange: handleNodeDataChange },
      };
    });

    const newEdges: Edge[] = clip.edges.map((e, i) => ({
      ...e,
      id: `paste-edge-${stamp}-${i}`,
      source: idMap.get(e.source) ?? e.source,
      target: idMap.get(e.target) ?? e.target,
      selected: true,
    }));

    pushHistory();
    setNodes((curr) => [...curr.map((n) => ({ ...n, selected: false })), ...newNodes]);
    setEdges((curr) => [...curr.map((e) => ({ ...e, selected: false })), ...newEdges]);
  }, [reactFlowInstance, viewportCenter, handleNodeDataChange, pushHistory, setNodes, setEdges]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Skip when typing in an input/textarea (let the field handle it).
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); redo(); return; }
      if (key === 'c') { e.preventDefault(); copySelection(); return; }
      if (key === 'v') { e.preventDefault(); pasteClipboard(); return; }
      if (key === 'g' && !e.shiftKey) { e.preventDefault(); groupSelected(); return; }
      if (key === 'g' && e.shiftKey) { e.preventDefault(); ungroupSelected(); return; }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo, copySelection, pasteClipboard, groupSelected, ungroupSelected]);

  // Track mouse so paste can drop at the cursor.
  const onPaneMouseMove = useCallback((e: React.MouseEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // ── Open / New ─────────────────────────────────────────────────────
  const handleOpenGraph = useCallback((
    openedNodes: Node[],
    openedEdges: Edge[]
  ) => {
    const nodesWithCallbacks = openedNodes.map((node) => ({
      ...node,
      data: { ...node.data, onChange: handleNodeDataChange },
    }));
    resetHistory(nodesWithCallbacks, openedEdges);
    setSelectedNode(null);
  }, [resetHistory, handleNodeDataChange]);

  const handleNewGraph = useCallback(() => {
    resetHistory([], []);
    setSelectedNode(null);
    saveFileHandleRef.current = null;
  }, [resetHistory]);

  if (loading) {
    return <div>Loading node definitions...</div>;
  }

  if (error || !definitions) {
    return <div>Error: {error}</div>;
  }

  return (
    <NodeDefinitionsContext.Provider value={definitions}>
      <div className="app-root">
        {/* Top Navbar — File ops left · Edit center · Insert right */}
        <nav className="top-navbar">
          <div className="navbar-section navbar-section-left">
            <span className="navbar-title">FloatNodes</span>
            <span className="navbar-divider" />
            <NewGraphButton hasContent={nodes.length > 0 || edges.length > 0} onNew={handleNewGraph} />
            <OpenGraphButton onOpen={handleOpenGraph} fileHandleRef={saveFileHandleRef} />
            <SaveGraphButton reactFlowInstance={reactFlowInstance} fileHandleRef={saveFileHandleRef} />
            <SaveAsGraphButton reactFlowInstance={reactFlowInstance} fileHandleRef={saveFileHandleRef} />
          </div>

          <div className="navbar-section navbar-section-center">
            <button
              className="graph-action-button icon-button"
              onClick={undo}
              title="Undo (Ctrl/Cmd+Z)"
              aria-label="Undo"
            >↶</button>
            <button
              className="graph-action-button icon-button"
              onClick={redo}
              title="Redo (Ctrl/Cmd+Shift+Z)"
              aria-label="Redo"
            >↷</button>
          </div>

          <div className="navbar-section navbar-section-right">
            <button
              className="graph-action-button"
              onClick={handleAddComment}
              title="Add comment (sticky note)"
            >
              + Comment
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="editor-body">
          <div className="editor-sidebar">
            <div className="editor-sidebar-title">Node Catalog</div>
            <NodeCatalog definitions={definitions} onAddNode={handleAddNode} />
            <div className="shortcut-hint">
              <div className="shortcut-hint-title">Shortcuts</div>
              <div>Drag pane: box-select (touch = include)</div>
              <div>Space + drag: pan canvas</div>
              <div>Two-finger scroll: pan</div>
              <div>Ctrl/Cmd+C / V: copy / paste</div>
              <div>Ctrl/Cmd+Z: undo</div>
              <div>Ctrl/Cmd+Shift+Z: redo</div>
              <div>Ctrl/Cmd+G: group selection</div>
              <div>Ctrl/Cmd+Shift+G: ungroup</div>
            </div>
          </div>

          <div className="editor-canvas" ref={canvasRef}>
            <div className="editor-canvas-inner" onMouseMove={onPaneMouseMove}>
              <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onNodeDragStart={handleNodeDragStart}
                onNodeDrag={handleNodeDrag}
                onNodeDragStop={handleNodeDragStop}
                onPaneClick={onPaneClick}
                onNodesDelete={onNodesDelete}
                selectionOnDrag
                selectionMode={SelectionMode.Partial}
                panOnDrag={[1, 2]}
                panActivationKeyCode="Space"
                panOnScroll
                zoomOnScroll={false}
                zoomOnPinch
                deleteKeyCode={['Backspace', 'Delete']}
                multiSelectionKeyCode={['Meta', 'Control', 'Shift']}
              >
                <Controls position="top-right" />
                <Background />
              </ReactFlow>
            </div>
          </div>
        </div>

        <Inspector
          selectedNode={selectedNode}
          onClose={closeInspector}
          onUpdateParameter={handleNodeDataChange}
        />
      </div>
    </NodeDefinitionsContext.Provider>
  );
}

export default App;
