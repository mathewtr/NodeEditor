// import React from "react";
import { Handle, Position } from "reactflow";

interface ConnectorNodeData {
    label: string;
    appParameter: string;
}

interface ConnectorNodeProps{
    id: string;
    data: ConnectorNodeData;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ConnectorNode({id, data}: ConnectorNodeProps){
    return(
        <div style={{border: "2px solid black", padding: "20px"}}>
            <div style={{textAlign: "center" }}>{data.label}</div>
            <div style={{border: "2px solid grey", padding: "10px"}}>{data.appParameter}</div>
            <Handle
            type="source"
            position={Position.Right}/>
        </div>
    )
}