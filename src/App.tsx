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
	useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

import { useNodeDefinitions, getNodeDefinition } from './hooks/useNodeDefinitions';
import { NodeCatalog } from './components/NodeCatalog';
import { ValueNode } from './components/nodes/ValueNode';
import ExportGraphButton from './components/NodeExport';
import { ConnectorNode } from './components/nodes/ConnectorNode';
import { MandalaObjectNode } from './components/nodes/MandalaObjectNode';

const nodeTypes = {
  value: ValueNode,
  complexity: ConnectorNode,
  bg_selector: ConnectorNode,
  mandala_object: MandalaObjectNode
};

function App() {
  const { definitions, loading, error } = useNodeDefinitions();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const reactFlowInstance = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeDataChange = useCallback((
    nodeId: string,
    field: string,
    value: number ) => {
      setNodes((nodes) =>
         nodes.map((node) => {
        if(node.id == nodeId){
          return{
            ...node,
            data:{
              ...node.data,
              [field]: value
            }
          }
        }
        return node;
      }));
    },[setNodes]);

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

    if (definition.type === 'connector' && definition.appParameter) {
      data.appParameter = definition.appParameter;
    }
    
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

  if (loading) {
    return <div>Loading node definitions...</div>;
  }

  if (error || !definitions) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="app-root">
      {/* Left sidebar: node catalog */}
      <div className="editor-sidebar">
        <div className="editor-sidebar-title">Node Catalog</div>
        <NodeCatalog definitions={definitions} onAddNode={handleAddNode} />
      </div>

      {/* Center: React Flow canvas */}
      <div className="editor-canvas">
        <div className="editor-canvas-inner">
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

			<ExportGraphButton 
				reactFlowInstance={reactFlowInstance.toObject()}
			/>

      <div style={{ width: "250px"}}>
      	{/* Right: inspector placeholder */}
				<div className="editor-inspector">
					<div className="editor-sidebar-title">Inspector</div>
					<p className="inspector-placeholder">
						Select a node to view and edit its parameters here.
					</p>
				</div>
			</div>
    </div>
  );
}

export default App;