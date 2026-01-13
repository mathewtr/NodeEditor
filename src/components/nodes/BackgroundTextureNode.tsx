// src/nodes/BackgroundTextureNode.tsx
import { Handle, Position } from "reactflow";

interface BackgroundTextureNodeData {
    label: string;
}

interface BackgroundTextureNodeProps {
    id: string;
    data: BackgroundTextureNodeData;
}

export function BackgroundTextureNode({ data }: BackgroundTextureNodeProps) {
    return (
        <div style={{ border: "2px solid white", padding: "20px" }}>
            <div>{data.label}</div>
            <div style={{ position: "relative" }}>
                <div style={{ position: "relative" }}>
                    <Handle 
                        type="target" 
                        position={Position.Left}
                        id="complexity"
                        style={{ background: "white", width: "10px", height: "10px" }}
                    />
                    <span style={{ marginLeft: "20px" }}>complexity</span>
                </div>
                <div style={{ position: "relative" }}>
                    <Handle 
                        type="target" 
                        position={Position.Left}
                        id="index"
                        style={{ background: "white", width: "10px", height: "10px" }}
                    />
                    <span style={{ marginLeft: "20px" }}>index</span>
                </div>
                <div style={{ position: "relative" }}>
                    <Handle 
                        type="target" 
                        position={Position.Left}
                        id="color"
                        style={{ background: "white", width: "10px", height: "10px" }}
                    />
                    <span style={{ marginLeft: "20px" }}>color</span>
                </div>
            </div>
        </div>
    );
}