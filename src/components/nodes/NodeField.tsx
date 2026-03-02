import { Handle, Position } from 'reactflow';
import { useEditableField } from '../../hooks/useEditableField';

interface NodeFieldProps {
  label: string;
  value: number | number[];
  nodeId: string;
  fieldName: string;
  handleId?: string;
  onChange?: (id: string, field: string, value: number | number[]) => void;
  placeholder?: string;
}

export function NodeField({
  label,
  value,
  nodeId,
  fieldName,
  handleId,
  onChange,
  placeholder,
}: NodeFieldProps) {
  const field = useEditableField(value, (v) => onChange?.(nodeId, fieldName, v));

  return (
    <div className="node-field">
      <label className="node-field-label">{label}</label>
      <div className="node-field-input-wrapper">
        {handleId && (
          <Handle
            type="target"
            position={Position.Left}
            id={handleId}
            className="node-handle"
          />
        )}
        <input
          type={Array.isArray(value) ? 'text' : 'number'}
          value={field.displayValue}
          onChange={field.handleChange}
          onFocus={field.handleFocus}
          onBlur={field.handleBlur}
          onKeyDown={field.handleKeyDown}
          className="param-input"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
