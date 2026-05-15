import { useEffect, useRef, useState } from 'react';
import type { NodeProps } from 'reactflow';

interface CommentData {
  text?: string;
  onChange?: (id: string, field: string, value: string | number | number[]) => void;
  highlightClass?: string;
}

export function CommentNode({ id, data }: NodeProps<CommentData>) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(data.text ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setLocal(data.text ?? '');
  }, [data.text, editing]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (local !== (data.text ?? '')) data.onChange?.(id, 'text', local);
  };

  return (
    <div
      className={`comment-node ${data.highlightClass ?? ''}`}
      onDoubleClick={() => setEditing(true)}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          className="comment-textarea nodrag"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setLocal(data.text ?? '');
              setEditing(false);
            }
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commit();
          }}
          placeholder="Type a comment..."
        />
      ) : (
        <div className="comment-text">
          {data.text ? data.text : <span className="comment-placeholder">Double-click to edit</span>}
        </div>
      )}
    </div>
  );
}
