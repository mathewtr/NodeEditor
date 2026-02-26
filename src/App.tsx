import { useCallback, useState } from 'react';
import ReactFlow,  {
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
import { NodeCatalog } from './components/NodeCatalog';
import ExportGraphButton from './components/NodeExport';
import ImportGraphButton from './components/NodeImport';
import {
  ValueNode,
  ConnectorNode,
  MandalaObjectNode,
  SineWaveNode,
  BackgroundTextureNode,
  CombineNode,
  MultiplyNode
} from './components/nodes';
import { Inspector } from './components/Inspector';

const nodeTypes = {
  value: ValueNode,
  complexity: ConnectorNode,
  speed: ConnectorNode,
  bg_selector: ConnectorNode,
  mandala_object: MandalaObjectNode,
  sine_wave: SineWaveNode,
  background_texture: BackgroundTextureNode,
  combine: CombineNode,
  multiply: MultiplyNode
};

function App() {
  const { definitions, loading, error } = useNodeDefinitions();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const reactFlowInstance = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
  },[]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const closeInspector = useCallback(() => {
    setSelectedNode(null);
  },[]);

  // HANDLER: Update node parameter from inspector
  const handleParameterUpdate = useCallback((
    nodeId: string,
    paramName: string,
    value: number | number[]
  ) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [paramName]: value
            }
          };
        }
        return node;
      })
    );

    // Update selectedNode to reflect changes immediately in inspector
    setSelectedNode((prev) => {
      if (prev?.id === nodeId) {
        return {
          ...prev,
          data: {
            ...prev.data,
            [paramName]: value
          }
        };
      }
      return prev;
    });
  }, [setNodes]);

  const handleNodeDataChange = useCallback((
    nodeId: string,
    field: string,
    value: number | number[] ) => {
      setNodes((nodes) =>
         nodes.map((node) => {
        if(node.id === nodeId){
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
      setSelectedNode((prev) => {
        if (prev?.id === nodeId) {
          return {
            ...prev,
            data: { ...prev.data, [field]: value }
          };
        }
        return prev;
      });
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
        onUpdateParameter={handleParameterUpdate}
      />

			<div className="floating-export-button-container">
				<ExportGraphButton
					reactFlowInstance={reactFlowInstance}
				/>
				<ImportGraphButton
					reactFlowInstance={reactFlowInstance}
				/>
			</div>
    </div>
  );
}

export default App;