import type { NodeDefinitionsFile, NodeDefinition } from '../types/nodeDefinitions';
import '../styles/NodeCatalog.css';

interface NodeCatalogProps {
  definitions: NodeDefinitionsFile;
  onAddNode: (nodeType: string) => void;
}

export function NodeCatalog({ definitions, onAddNode }: NodeCatalogProps) {
  return (
    <div className="nodecatalog-container">
      <h3 className="nodecatalog-title">Node Library</h3>
      <p className="nodecatalog-subtitle">Click a node type to add it to the graph.</p>

      <div className="nodecatalog-list">
        {definitions.nodeTypes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            onAdd={() => onAddNode(node.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface NodeCardProps {
  node: NodeDefinition;
  onAdd: () => void;
}

function NodeCard({ node, onAdd }: NodeCardProps) {
  return (
    <button
      type="button"
      className="nodecard"
      onClick={onAdd}
    >
      <div className="nodecard-header">
        <span className="nodecard-title">{node.title}</span>
        <span className={`nodecard-type nodecard-type-${node.type}`}>
          {node.type}
        </span>
      </div>

      {node.appParameter && (
        <div className="nodecard-parameter">
          ↳ <span>{node.appParameter}</span>
        </div>
      )}

      <div className="nodecard-meta">
        {node.inputs.length > 0 && <span>{node.inputs.length} inputs</span>}
        {node.outputs.length > 0 && <span>{node.outputs.length} outputs</span>}
        {node.parameters.length > 0 && (
          <span>{node.parameters.length} params</span>
        )}
      </div>
    </button>
  );
}