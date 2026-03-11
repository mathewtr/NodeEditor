import { useCallback, useMemo, useState } from 'react';
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
import { ExportGraphButton } from './components/NodeExport';
import { ImportGraphButton } from './components/NodeImport';
import { SaveGraphButton } from './components/NodeSave';
import { GenericNode } from './components/nodes/GenericNode';
import { Inspector } from './components/Inspector';

function App() {
  const { definitions, loading, error } = useNodeDefinitions();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const reactFlowInstance = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeTypeId,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100
      },
      data,
    };

    setNodes((nds) => [...nds, newNode]);
  }, [definitions, setNodes, handleNodeDataChange]);

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

  if (loading) {
    return <div>Loading node definitions...</div>;
  }

  if (error || !definitions) {
    return <div>Error: {error}</div>;
  }

  return (
    <NodeDefinitionsContext.Provider value={definitions}>
      <div className="app-root">
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
            >
              <Controls position="top-right" />
              <Background />
            </ReactFlow>
          </div>
        </div>

        <Inspector
          selectedNode={selectedNode}
          onClose={closeInspector}
          onUpdateParameter={handleNodeDataChange}
        />

        <div className="floating-actions-container">
          <ImportGraphButton onImport={handleImportGraph} />
          <SaveGraphButton reactFlowInstance={reactFlowInstance} />
          <ExportGraphButton reactFlowInstance={reactFlowInstance} />
        </div>
      </div>
    </NodeDefinitionsContext.Provider>
  );
}

export default App;
