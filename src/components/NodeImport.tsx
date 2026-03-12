import { useRef } from 'react';
import type { Node, Edge } from 'reactflow';
import '../styles/NodeExport.css';

interface NodeImportProps {
  onImport: (nodes: Node[], edges: Edge[]) => void;
}

export function ImportGraphButton({ onImport }: NodeImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        if (!Array.isArray(json.nodes) || !Array.isArray(json.edges)) {
          alert('Invalid graph file: expected "nodes" and "edges" arrays.');
          return;
        }

        onImport(json.nodes, json.edges);
      } catch {
        alert('Failed to parse file. Please select a valid JSON graph export.');
      }
    };
    reader.readAsText(file);

    // Reset so the same file can be re-imported
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button className="graph-action-button" onClick={handleClick}>
        Import
      </button>
    </>
  );
}
