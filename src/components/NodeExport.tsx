import type { Node, Edge, ReactFlowInstance } from 'reactflow';
import '../styles/NodeExport.css';

interface NodeExportProps {
  reactFlowInstance: ReactFlowInstance<Node, Edge>;
}

const ExportGraphButton = ({ reactFlowInstance }: NodeExportProps) => (
  <button className="graph-action-button" onClick={() => exportGraph(reactFlowInstance)}>
    Export
  </button>
);

function exportGraph(reactFlowInstance: ReactFlowInstance) {
  const { nodes, edges } = reactFlowInstance.toObject();

  // Strip non-serializable callbacks from node data
  const cleanNodes = nodes.map((node) => ({
    ...node,
    data: Object.fromEntries(
      Object.entries(node.data).filter(([, v]) => typeof v !== 'function')
    ),
  }));

  const jsonString = JSON.stringify({ nodes: cleanNodes, edges }, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'export.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export { ExportGraphButton };