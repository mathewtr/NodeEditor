import { useState, useRef, useEffect } from 'react';
import type { Node, Edge, ReactFlowInstance } from 'reactflow';
import '../styles/NodeExport.css';

interface NodeExportProps {
  reactFlowInstance: ReactFlowInstance<Node, Edge>;
}

const ExportGraphButton = ({ reactFlowInstance }: NodeExportProps) => {
  const [showInput, setShowInput] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showInput]);

  const handleExportClick = () => {
    setFileName('focus');
    setShowInput(true);
  };

  const handleConfirm = () => {
    const name = fileName.trim();
    if (!name) return;

    // Add .json if user didn't type it
    const finalName = name.endsWith('.json') ? name : `${name}.json`;
    exportGraph(reactFlowInstance, finalName);
    setShowInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      setShowInput(false);
    }
  };

  if (showInput) {
    return (
      <div className="export-filename-container">
        <input
          ref={inputRef}
          type="text"
          className="export-filename-input"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. focus, relax, sleep"
        />
        <span className="export-filename-suffix">.json</span>
        <button className="graph-action-button export-confirm-button" onClick={handleConfirm}>
          Download
        </button>
        <button className="graph-action-button export-cancel-button" onClick={() => setShowInput(false)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button className="graph-action-button" onClick={handleExportClick}>
      Export
    </button>
  );
};

function exportGraph(reactFlowInstance: ReactFlowInstance, fileName: string) {
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
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export { ExportGraphButton };
