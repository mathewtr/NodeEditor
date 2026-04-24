import { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  type Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
  type NodeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/App.css';
import { useNodeDefinitions, getNodeDefinition } from './hooks/useNodeDefinitions';
import { NodeDefinitionsContext } from './contexts/NodeDefinitionsContext';
import { NodeCatalog } from './components/NodeCatalog';
import { ImportGraphButton } from './components/NodeImport';
import { NewGraphButton } from './components/NodeNew';
import { SaveGraphButton } from './components/NodeSave';
import { SaveAsGraphButton } from './components/NodeSaveAs';
import { GenericNode } from './components/nodes/GenericNode';
import { Inspector } from './components/Inspector';

function App() {
  const { definitions, loading, error } = useNodeDefinitions();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const reactFlowInstance = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  // Shared file handle for Save — lifted here so "New" can reset it,
  // matching the Word "New → Save prompts again" behavior.
  const saveFileHandleRef = useRef<FileSystemFileHandle | null>(null);

  // Build nodeTypes map dynamically from definitions — every type uses GenericNode
  const nodeTypes = useMemo(() => {
    if (!definitions) return {};
    const types: Record<string, typeof GenericNode> = {};
    for (const def of definitions.nodeTypes) {
      types[def.id] = GenericNode;
    }
    return types;
  }, [definitions]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const closeInspector = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    setSelectedNode((prev) =>
      prev && deleted.some((n) => n.id === prev.id) ? null : prev
    );
  }, []);

  const handleNodeDataChange = useCallback((
    nodeId: string,
    field: string,
    value: number | number[] | string
  ) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value
            }
          };
        }
        return node;
      })
    );

    setSelectedNode((prev) => {
      if (prev?.id === nodeId) {
        return {
          ...prev,
          data: { ...prev.data, [field]: value }
        };
      }
      return prev;
    });
  }, [setNodes]);

  const handleAddNode = useCallback((nodeTypeId: string) => {
    if (!definitions) return;

    const definition = getNodeDefinition(definitions, nodeTypeId);
    if (!definition) return;

    const data: Record<string, unknown> = {
      label: definition.title,
      onChange: handleNodeDataChange,
    };

    definition.parameters.forEach(param => {
      data[param.name] = param.default;
    });

    const nodeId = `node-${Date.now()}`;
    data.highlightClass = 'node-just-added';

    const newNode: Node = {
      id: nodeId,
      type: nodeTypeId,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100
      },
      data,
    };

    setNodes((nds) => [...nds, newNode]);

    // Auto-pan viewport to center on the newly created node
    setTimeout(() => {
      reactFlowInstance.setCenter(
        newNode.position.x + 75,
        newNode.position.y + 50,
        { zoom: reactFlowInstance.getZoom(), duration: 300 }
      );
    }, 50);

    // Fade out the highlight after a short delay
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, highlightClass: 'node-just-added-fade' } }
            : n
        )
      );
    }, 600);

    // Remove the class entirely after the fade completes
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, highlightClass: undefined } }
            : n
        )
      );
    }, 2100);
  }, [definitions, setNodes, handleNodeDataChange, reactFlowInstance]);

  const handleImportGraph = useCallback((
    importedNodes: Node[],
    importedEdges: Edge[]
  ) => {
    const nodesWithCallbacks = importedNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onChange: handleNodeDataChange,
      }
    }));

    setNodes(nodesWithCallbacks);
    setEdges(importedEdges);
    setSelectedNode(null);
  }, [setNodes, setEdges, handleNodeDataChange]);

  const handleNewGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    // Forget the previously-picked save location so the next Save opens the
    // file picker again (fresh canvas = fresh file).
    saveFileHandleRef.current = null;
  }, [setNodes, setEdges]);

  if (loading) {
    return <div>Loading node definitions...</div>;
  }

  if (error || !definitions) {
    return <div>Error: {error}</div>;
  }

  return (
    <NodeDefinitionsContext.Provider value={definitions}>
      <div className="app-root">
        {/* Top Navbar */}
        <nav className="top-navbar">
          <span className="navbar-title">FloatNodes</span>
          <div className="navbar-actions">
            <NewGraphButton hasContent={nodes.length > 0 || edges.length > 0} onNew={handleNewGraph} />
            <ImportGraphButton onImport={handleImportGraph} />
            <SaveGraphButton reactFlowInstance={reactFlowInstance} fileHandleRef={saveFileHandleRef} />
            <SaveAsGraphButton reactFlowInstance={reactFlowInstance} fileHandleRef={saveFileHandleRef} />
          </div>
        </nav>

        {/* Main Content */}
        <div className="editor-body">
          <div className="editor-sidebar">
            <div className="editor-sidebar-title">Node Catalog</div>
            <NodeCatalog definitions={definitions} onAddNode={handleAddNode} />
          </div>

          <div className="editor-canvas">
            <div className="editor-canvas-inner">
              <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onNodesDelete={onNodesDelete}
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
