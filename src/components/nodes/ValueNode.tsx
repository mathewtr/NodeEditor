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
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    const handleBlur = () => {
        const parsed = parseFloat(localValue);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'value', parsed);  
            setLocalValue(parsed.toString());    
        } else {
            setLocalValue(data.value.toString());
        }
    };

    return (
        <div style={{border: "2px solid white", padding: "10px"}}>
            <div>{data.label}</div>
            <input
                type="number"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{background: "white", width:"10px", height: "10px"}}
            />
        </div>
    )
}