import React from "react";
import { Handle, Position } from "reactflow";

interface ValueNodeData {
    label: "string";
    value: number;
    onChange?:(id: string, field: string, value: number) => void;
}

interface ValueNodeProps {
    id: string;
    data: ValueNodeData;
}

export function ValueNode({id, data}: ValueNodeProps){
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        
        const newValue = parseFloat(e.target.value) || 0;
        if (data.onChange){
            data.onChange (id, 'value', newValue);
        }
    };
    return (
        <div style={{border: "2px solid white", padding: "10px"}}>
            <div>{data.label}</div>
            <input
                type="number"
                value={data.value}
                onChange={handleChange}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{background: "white", width:"10px", height: "10px"}}
            />
        </div>
    )
}