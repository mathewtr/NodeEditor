import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { Node, Edge } from 'reactflow';
import { deserializeGraph } from '../utilities/serializeGraph';
import '../styles/NodeExport.css';

interface NodeOpenProps {
  onOpen: (nodes: Node[], edges: Edge[]) => void;
  fileHandleRef: MutableRefObject<FileSystemFileHandle | null>;
}

const parseGraph = deserializeGraph;

export function OpenGraphButton({ onOpen, fileHandleRef }: NodeOpenProps) {
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const handleClick = async () => {
    // Preferred path: File System Access API — gives us a writable handle
    // so a subsequent Save overwrites the opened file in place.
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            },
          ],
          multiple: false,
        });
        const file = await handle.getFile();
        const text = await file.text();
        const parsed = parseGraph(text);
        if (!parsed) {
          alert('Failed to parse file. Please select a valid JSON graph export.');
          return;
        }
        fileHandleRef.current = handle;
        onOpen(parsed.nodes, parsed.edges);
      } catch {
        // User cancelled the picker — do nothing
      }
      return;
    }

    // Fallback for browsers without the File System Access API
    fallbackInputRef.current?.click();
  };

  const handleFallbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const parsed = parseGraph(event.target?.result as string);
      if (!parsed) {
        alert('Failed to parse file. Please select a valid JSON graph export.');
        return;
      }
      // No writable handle available in the fallback path — Save will
      // prompt for a location the first time it is used.
      fileHandleRef.current = null;
      onOpen(parsed.nodes, parsed.edges);
    };
    reader.readAsText(file);

    e.target.value = '';
  };

  return (
    <>
      <input
        ref={fallbackInputRef}
        type="file"
        accept=".json"
        onChange={handleFallbackChange}
        style={{ display: 'none' }}
      />
      <button className="graph-action-button" onClick={handleClick}>
        Open
      </button>
    </>
  );
}
