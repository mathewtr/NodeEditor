import React from "react";
import { Handle, Position } from "reactflow";


interface MandalObjectNodeData{
    label: string;
}
interface MandalObjectNodeProps{
    id: string;
    data: MandalObjectNodeData;
}

export function MandalaObjectNode({id, data}: MandalObjectNodeProps){
    return(
        <div style={{border: "2px solid black", padding: "20px"}}>
            <div>{data.label}</div>
            <div style={{position: "relative"}}>
            <div style={{position: "relative"}}>
                <Handle 
                type="target" 
                position={Position.Left}
                id="speed"
                />
                <span>speed</span>
            </div>
            <div style={{position: "relative"}}>
                <Handle 
                type="target" 
                position={Position.Left}
                id="complexity"
                />
                <span>complexity</span>
            </div>
            </div>
            
        </div>
    )
}