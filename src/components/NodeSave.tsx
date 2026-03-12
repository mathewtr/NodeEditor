import { useRef, useState } from 'react';
import type { Node, Edge, ReactFlowInstance } from 'reactflow';
import '../styles/NodeExport.css';

interface SaveGraphProps {
  reactFlowInstance: ReactFlowInstance<Node, Edge>;
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

export function SaveGraphButton({ reactFlowInstance }: SaveGraphProps) {
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const [status, setStatus] = useState<'idle' | 'saved'>('idle');

  const handleSave = async () => {
    const jsonString = getCleanGraph(reactFlowInstance);

    // Check if the File System Access API is available
    if (!('showSaveFilePicker' in window)) {
      // Fallback: regular download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mode.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    try {
      // First save: open file picker. Subsequent saves: reuse handle.
      if (!fileHandleRef.current) {
        fileHandleRef.current = await window.showSaveFilePicker({
          suggestedName: 'mode.json',
          types: [
            {
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
      }

      const handle = fileHandleRef.current;
      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (e) {
      // User cancelled the file picker, or permission was revoked
      if ((e as DOMException).name === 'NotAllowedError') {
        // Permission lost — reset handle so next save opens picker again
        fileHandleRef.current = null;
      }
      // AbortError = user cancelled, just do nothing
    }
  };

  return (
    <button className="graph-action-button save-button" onClick={handleSave}>
      {status === 'saved' ? 'Saved!' : 'Save'}
    </button>
  );
}
