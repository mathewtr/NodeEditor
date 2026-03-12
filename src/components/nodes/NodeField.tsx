import { Handle, Position } from 'reactflow';
import { useEditableField } from '../../hooks/useEditableField';

interface NodeFieldProps {
  label: string;
  value: number | number[] | string;
  nodeId: string;
  fieldName: string;
  handleId?: string;
  onChange?: (id: string, field: string, value: number | number[] | string) => void;
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

  // Determine input type: text for strings and arrays, number for single numbers
  const inputType = typeof value === 'string' || Array.isArray(value) ? 'text' : 'number';

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
          type={inputType}
          value={field.displayValue}
          onChange={field.handleChange}
          onFocus={field.handleFocus}
          onBlur={field.handleBlur}
          onKeyDown={field.handleKeyDown}
          className="param-input"
          placeholder={placeholder ?? (typeof value === 'string' ? 'type a name...' : undefined)}
        />
      </div>
    </div>
  );
}
