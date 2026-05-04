import { Handle, Position } from 'reactflow';
import { useEditableField } from '../../hooks/useEditableField';

interface NodeFieldProps {
  label: string;
  value: number | number[] | string;
  nodeId: string;
  fieldName: string;
  paramType?: 'float' | 'int' | 'vector4' | 'string' | 'color';
  handleId?: string;
  onChange?: (id: string, field: string, value: number | number[] | string) => void;
  placeholder?: string;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function rgbaToHex(rgba: number[]): string {
  const toHex = (v: number) =>
    Math.round(clamp01(v) * 255).toString(16).padStart(2, '0');
  return `#${toHex(rgba[0] ?? 0)}${toHex(rgba[1] ?? 0)}${toHex(rgba[2] ?? 0)}`;
}

function hexToRgba(hex: string, alpha: number): number[] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, alpha];
}

export function NodeField({
  label,
  value,
  nodeId,
  fieldName,
  paramType,
  handleId,
  onChange,
  placeholder,
}: NodeFieldProps) {
  const field = useEditableField(value, (v) => onChange?.(nodeId, fieldName, v));

  const isColor = paramType === 'color' && Array.isArray(value);

  // Determine input type for non-color fields
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
        {isColor ? (
          <input
            type="color"
            value={rgbaToHex(value as number[])}
            onChange={(e) => {
              const alpha = (value as number[])[3] ?? 1;
              onChange?.(nodeId, fieldName, hexToRgba(e.target.value, alpha));
            }}
            className="param-input color-swatch"
          />
        ) : (
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
        )}
      </div>
    </div>
  );
}
