import type { NodeDefinitionsFile, NodeDefinition } from '../types/nodeDefinitions';

interface NodeCatalogProps {
  definitions: NodeDefinitionsFile;
  onAddNode: (nodeType: string) => void;
}

export function NodeCatalog({ definitions, onAddNode }: NodeCatalogProps) {
  return (
    <div>
      <h3>Node Library</h3>
      <p>Click to add nodes</p>
      
      {definitions.nodeTypes.map(node => (
        <NodeCard
          key={node.id}
          node={node}
          onAdd={() => onAddNode(node.id)}
        />
      ))}
    </div>
  );
}

interface NodeCardProps {
  node: NodeDefinition;
  onAdd: () => void;
}

function NodeCard({ node, onAdd }: NodeCardProps) {
  return (
    <div onClick={onAdd}>
      <strong>{node.title}</strong>
      <p>{node.type}</p>
      {node.appParameter && <p>→ {node.appParameter}</p>}
      
      <div>
        {node.inputs.length > 0 && <span>[{node.inputs.length} inputs] </span>}
        {node.outputs.length > 0 && <span>[{node.outputs.length} outputs] </span>}
        {node.parameters.length > 0 && <span>[{node.parameters.length} params]</span>}
      </div>
      <hr />
    </div>
  );
  }