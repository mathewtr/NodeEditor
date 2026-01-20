import React, { useState } from "react";
import { Handle, Position } from "reactflow";

interface ValueNodeData {
    label: string;
    value: number;
    onChange?:(id: string, field: string, value: number) => void;
}

interface ValueNodeProps {
    id: string;
    data: ValueNodeData;
}

export function ValueNode({id, data}: ValueNodeProps){
    const [localValue, setLocalValue] = useState(data.value.toString());
    const [isEditing, setIsEditing] = useState(false);
    
    // When not editing, always show current data.value
    const displayValue = isEditing ? localValue : data.value.toString();
    
    const handleFocus = () => {
        setIsEditing(true);
        setLocalValue(data.value.toString());
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        const parsed = parseFloat(localValue);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'value', parsed);  
            setLocalValue(parsed.toString());    
        } else {
            setLocalValue(data.value.toString());
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    return (
        <div style={{border: "2px solid white", padding: "10px"}}>
            <div>{data.label}</div>
            <input
                type="number"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{background: "white", width:"10px", height: "10px"}}
            />
        </div>
    )
}