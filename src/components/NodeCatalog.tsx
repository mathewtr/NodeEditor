import { useMemo } from 'react';
import type { NodeDefinitionsFile, NodeDefinition } from '../types/nodeDefinitions';
import '../styles/NodeCatalog.css';

interface NodeCatalogProps {
  definitions: NodeDefinitionsFile;
  onAddNode: (nodeType: string) => void;
}

// Display order for category sections. Anything not listed falls to the end.
// Designers learn this ordering — keep it stable so the catalog feels predictable.
const CATEGORY_ORDER = ['parameter', 'input', 'output', 'generator', 'processing', 'utility'];

// Section labels (uppercase plurals for visual rhythm with the existing pill labels)
const CATEGORY_LABELS: Record<string, string> = {
  parameter: 'Parameters',
  input: 'Inputs',
  output: 'Outputs',
  generator: 'Generators',
  processing: 'Processing',
  utility: 'Utility',
};

interface Group {
  type: string;
  label: string;
  nodes: NodeDefinition[];
}

function groupByType(nodes: NodeDefinition[]): Group[] {
  // Bucket by type, then sort each bucket alphabetically by title.
  const buckets = new Map<string, NodeDefinition[]>();
  for (const node of nodes) {
    if (!buckets.has(node.type)) buckets.set(node.type, []);
    buckets.get(node.type)!.push(node);
  }

  // Sort categories by the explicit CATEGORY_ORDER, then any unknown types at the end.
  const orderedTypes = [
    ...CATEGORY_ORDER.filter((t) => buckets.has(t)),
    ...[...buckets.keys()].filter((t) => !CATEGORY_ORDER.includes(t)).sort(),
  ];

  return orderedTypes.map((type) => ({
    type,
    label: CATEGORY_LABELS[type] ?? type,
    nodes: buckets.get(type)!.slice().sort((a, b) => a.title.localeCompare(b.title)),
  }));
}

export function NodeCatalog({ definitions, onAddNode }: NodeCatalogProps) {
  const groups = useMemo(() => groupByType(definitions.nodeTypes), [definitions]);

  return (
    <div className="nodecatalog-container">
      <h3 className="nodecatalog-title">Node Library</h3>
      <p className="nodecatalog-subtitle">Click a node type to add it to the graph.</p>

      <div className="nodecatalog-list">
        {groups.map((group) => (
          <div key={group.type} className="nodecatalog-group">
            <div className="nodecatalog-group-header">{group.label}</div>
            {group.nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                onAdd={() => onAddNode(node.id)}
              />
            ))}
          </div>
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
