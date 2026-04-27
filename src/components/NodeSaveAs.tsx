import { useState } from 'react';
import type { MutableRefObject } from 'react';
import type { Node, Edge, ReactFlowInstance } from 'reactflow';
import '../styles/NodeExport.css';

interface SaveAsGraphProps {
  reactFlowInstance: ReactFlowInstance<Node, Edge>;
  fileHandleRef: MutableRefObject<FileSystemFileHandle | null>;
}

function getCleanGraph(reactFlowInstance: ReactFlowInstance) {
  const { nodes, edges } = reactFlowInstance.toObject();
  const cleanNodes = nodes.map((node) => ({
    ...node,
    data: Object.fromEntries(
      Object.entries(node.data).filter(([, v]) => typeof v !== 'function')
    ),
  }));
  return JSON.stringify({ nodes: cleanNodes, edges }, null, 2);
}

export function SaveAsGraphButton({ reactFlowInstance, fileHandleRef }: SaveAsGraphProps) {
  const [status, setStatus] = useState<'idle' | 'saved'>('idle');

  const handleSaveAs = async () => {
    const jsonString = getCleanGraph(reactFlowInstance);

    if (!('showSaveFilePicker' in window)) {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'NodeGraph_{Mode}.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileHandleRef.current?.name ?? 'NodeGraph_{Mode}.json',
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();

      // Point subsequent Save operations at the newly chosen file.
      fileHandleRef.current = handle;

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (e) {
      if ((e as DOMException).name === 'NotAllowedError') {
        fileHandleRef.current = null;
      }
    }
  };

  return (
    <button className="graph-action-button" onClick={handleSaveAs}>
      {status === 'saved' ? 'Saved!' : 'Save As'}
    </button>
  );
}
