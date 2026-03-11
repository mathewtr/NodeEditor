import { useState } from "react";
import type { Node } from "reactflow";
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
    onUpdate: (nodeId: string, paramName: string, value: number | number[] | string) => void;
}

// Component for individual parameter input
function ParameterInput({ name, value, nodeId, onUpdate }: ParameterInputProps) {
    const [localValue, setLocalValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);

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
    // Don't render if no node selected
    if (!selectedNode) return null;

    // Get all editable parameters
    const getEditableParameters = () => {
        if (!selectedNode.data) return [];

        return Object.entries(selectedNode.data).filter(([key]) =>
            key !== 'label' &&
            key !== 'onChange'
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
