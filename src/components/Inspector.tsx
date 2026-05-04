import { useState } from "react";
import type { Node } from "reactflow";
import { useNodeDefinitionsContext } from "../contexts/NodeDefinitionsContext";
import "../styles/Inspector.css";

interface InspectorProps {
    selectedNode: Node | null;
    onClose: () => void;
    onUpdateParameter: (nodeId: string, paramName: string, value: number | number[] | string) => void;
}

interface ParameterInputProps {
    name: string;
    value: number | number[] | string;
    nodeId: string;
    paramType?: 'float' | 'int' | 'vector4' | 'string' | 'color';
    onUpdate: (nodeId: string, paramName: string, value: number | number[] | string) => void;
}

// Color helpers — kept in sync with NodeField.tsx so the swatch UI behaves identically
// in both places (node body and inspector panel).
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

// Component for individual parameter input
function ParameterInput({ name, value, nodeId, paramType, onUpdate }: ParameterInputProps) {
    const [localValue, setLocalValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const isColor = paramType === 'color' && Array.isArray(value);

    // Color params get a native color swatch — the array is too long to read as text
    // and the swatch is the same control the node body uses, so editing is consistent.
    if (isColor) {
        return (
            <div className="param-input-row">
                <label className="param-label">{name}</label>
                <input
                    type="color"
                    value={rgbaToHex(value as number[])}
                    onChange={(e) => {
                        const alpha = (value as number[])[3] ?? 1;
                        onUpdate(nodeId, name, hexToRgba(e.target.value, alpha));
                    }}
                    className="param-input color-swatch"
                />
            </div>
        );
    }

    // Show the prop value when not editing, local value when editing
    const displayValue = isEditing
        ? localValue
        : (Array.isArray(value) ? value.join(', ') : value.toString());

    const handleFocus = () => {
        setIsEditing(true);
        setLocalValue(Array.isArray(value) ? value.join(', ') : value.toString());
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (typeof value === 'string') {
            // String parameters: commit raw text
            onUpdate(nodeId, name, localValue);
        } else if (Array.isArray(value)) {
            // Parse vector (e.g., "0.5, 1, 0.5, 1")
            const parsed = localValue.split(',').map(v => parseFloat(v.trim()));
            if (parsed.length === value.length && parsed.every(v => !isNaN(v))) {
                onUpdate(nodeId, name, parsed);
            } else {
                // Invalid - do nothing, displayValue will revert to prop value
            }
        } else {
            // Parse single number
            const parsed = parseFloat(localValue);
            if (!isNaN(parsed)) {
                onUpdate(nodeId, name, parsed);
            }
            // Invalid - do nothing, displayValue will revert to prop value
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    // Determine input type
    const inputType = typeof value === 'string' || Array.isArray(value) ? 'text' : 'text';
    const placeholder = typeof value === 'string'
        ? 'type a name...'
        : Array.isArray(value)
            ? "e.g., 1, 1, 1, 1"
            : "number";

    return (
        <div className="param-input-row">
            <label className="param-label">{name}</label>
            <input
                type={inputType}
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="param-input"
                placeholder={placeholder}
            />
        </div>
    );
}

export function Inspector({ selectedNode, onClose, onUpdateParameter }: InspectorProps) {
    const definitions = useNodeDefinitionsContext();

    // Don't render if no node selected
    if (!selectedNode) return null;

    // Look up the node's definition so we can pass each parameter's declared type
    // (e.g. "color") down to ParameterInput. Without this, the inspector falls
    // back to a plain text field for every parameter.
    const nodeDefinition = definitions?.nodeTypes.find((n) => n.id === selectedNode.type);

    const getParamType = (paramName: string) =>
        nodeDefinition?.parameters.find((p) => p.name === paramName)?.type;

    // Get all editable parameters
    const getEditableParameters = () => {
        if (!selectedNode.data) return [];

        return Object.entries(selectedNode.data).filter(([key, val]) =>
            key !== 'label' &&
            key !== 'onChange' &&
            key !== 'highlightClass' &&
            val !== undefined
        );
    };

    const editableParams = getEditableParameters();

    return (
        <div className="inspector-panel">
            <div className="inspector-header">
                <h3>Inspector</h3>
                <button
                    onClick={onClose}
                    className="inspector-close-button"
                    aria-label="Close inspector"
                >
                    ×
                </button>
            </div>

            <div className="inspector-content">
                {/* Node Identity Section */}
                <div className="inspector-section">
                    <div className="node-identity">
                        <h2 className="node-title">{selectedNode.data?.label || 'Untitled Node'}</h2>
                        <p className="node-type">{selectedNode.type}</p>
                        <p className="node-id">{selectedNode.id}</p>
                    </div>
                </div>

                {/* Editable Parameters Section */}
                {editableParams.length > 0 && (
                    <div className="inspector-section">
                        <label>Parameters</label>
                        <div className="inspector-params">
                            {editableParams.map(([key, value]) => (
                                <ParameterInput
                                    key={key}
                                    name={key}
                                    value={value as number | number[] | string}
                                    nodeId={selectedNode.id}
                                    paramType={getParamType(key)}
                                    onUpdate={onUpdateParameter}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* No Parameters Message */}
                {editableParams.length === 0 && (
                    <div className="inspector-section">
                        <p className="no-params-message">This node has no editable parameters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
