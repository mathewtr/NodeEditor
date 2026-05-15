import { useEffect, useRef, useState } from 'react';
import type { NodeProps } from 'reactflow';

interface GroupData {
  label?: string;
  width?: number;
  height?: number;
  onChange?: (id: string, field: string, value: string | number | number[]) => void;
  highlightClass?: string;
}

export function GroupNode({ id, data }: NodeProps<GroupData>) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(data.label ?? 'Group');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setLocal(data.label ?? 'Group');
  }, [data.label, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (local !== (data.label ?? 'Group')) data.onChange?.(id, 'label', local);
  };

  const width = data.width ?? 320;
  const height = data.height ?? 220;

  return (
    <div
      className={`group-node ${data.highlightClass ?? ''}`}
      style={{ width, height }}
    >
      <div className="group-header" onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <input
            ref={inputRef}
            className="group-label-input nodrag"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setLocal(data.label ?? 'Group');
                setEditing(false);
              }
            }}
          />
        ) : (
          <span className="group-label">{data.label ?? 'Group'}</span>
        )}
      </div>
    </div>
  );
}
