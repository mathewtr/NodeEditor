import { useCallback } from 'react';
import ReactFlow,  {
  type Node,
  type Edge,
  type Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useNodeDefinitions, getNodeDefinition } from './hooks/useNodeDefinitions';
import { NodeCatalog } from './components/NodeCatalog';
// import { ValueNode } from './components/nodes/ValueNode';

const nodeTypes = {
  // valueNode: ValueNode,
};

function App() {
  const { definitions, loading, error } = useNodeDefinitions();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback((nodeTypeId: string) => {
    if (!definitions) return;

    const definition = getNodeDefinition(definitions, nodeTypeId);
    if (!definition) return;

    const data: Record<string, unknown> = {
      label: definition.title,
    };
    
    definition.parameters.forEach(param => {
      data[param.name] = param.default;
    });

    if (definition.type === 'connector' && definition.appParameter) {
      data.appParameter = definition.appParameter;
    }

    const nodeTypeMap: Record<string, string> = {
       "value": "valueNode",
    };

    const nodeComponentType = nodeTypeMap[definition.id]

    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeComponentType,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data,
    };

    setNodes((nds) => [...nds, newNode]);
  }, [definitions, setNodes]);

  if (loading) {
    return <div>Loading node definitions...</div>;
  }

  if (error || !definitions) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>

      <NodeCatalog
        definitions={definitions}
        onAddNode={handleAddNode}
      />

      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Controls position="top-right" />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;