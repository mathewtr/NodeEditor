// src/nodes/BackgroundTextureNode.tsx
import { useState } from "react";
import { Handle, Position } from "reactflow";

interface BackgroundTextureNodeData {
    label: string;
    complexity: number;
    index: number;
    color: number[];
    onChange?: (id: string, field: string, value: number | number[]) => void;
}

interface BackgroundTextureNodeProps {
    id: string;
    data: BackgroundTextureNodeData;
}

export function BackgroundTextureNode({ id, data }: BackgroundTextureNodeProps) {
    const [localComplexity, setLocalComplexity] = useState(data.complexity.toString());
    const [localIndex, setLocalIndex] = useState(data.index.toString());
    const [localColor, setLocalColor] = useState(data.color.join(', '));

    const handleComplexityChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setLocalComplexity(e.target.value);
    }
    const handleIndexChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setLocalIndex(e.target.value);
    }
    const handleColorChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setLocalColor(e.target.value);
    }

    const handleComplexityBlur = () => {
        const parsed = parseFloat(localComplexity);
        if(!isNaN(parsed)) {
            data.onChange?.(id, "complexity", parsed);
            setLocalComplexity(parsed.toString());
        } else {
            setLocalComplexity(data.complexity.toString());
        }
    }

    const handleIndexBlur = () => {
        const parsed = parseInt(localIndex);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'index', parsed);
            setLocalIndex(parsed.toString());
        } else {
            setLocalIndex(data.index.toString());
        }
    };

    const handleColorBlur = () => {
        // Parse comma-separated values: "1, 1, 1, 1" -> [1, 1, 1, 1]
        const values = localColor.split(',').map(v => parseFloat(v.trim()));
        
        // Check if we have exactly 4 valid numbers
        if (values.length === 4 && values.every(v => !isNaN(v))) {
            data.onChange?.(id, 'color', values);
            setLocalColor(values.join(', '));
        } else {
            // Invalid format, revert to original
            setLocalColor(data.color.join(', '));
        }
    };

    return (
        <div style={{ border: "2px solid white", padding: "10px" }}>
            <div>{data.label}</div>

            <div style={{ marginTop: "5px" }}>
                <label style={{ fontSize: "12px" }}>complexity:</label>
                <div style={{ position: "relative" }}>
                    <Handle 
                        type="target" 
                        position={Position.Left}
                        id="complexity"
                        style={{ background: "white", width: "10px", height: "10px", left: "-15px" }}
                    />
                    <input
                        type="number"
                        value={localComplexity}
                        onChange={handleComplexityChange}
                        onBlur={handleComplexityBlur}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            <div style={{ marginTop: "5px" }}>
                <label style={{ fontSize: "12px" }}>index:</label>
                <div style={{ position: "relative" }}>
                    <Handle 
                        type="target" 
                        position={Position.Left}
                        id="index"
                        style={{ background: "white", width: "10px", height: "10px", left: "-15px" }}
                    />
                    <input
                        type="number"
                        value={localIndex}
                        onChange={handleIndexChange}
                        onBlur={handleIndexBlur}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            <div style={{ marginTop: "5px" }}>
                <label style={{ fontSize: "12px" }}>color (r, g, b, a):</label>
                <div style={{ position: "relative" }}>
                    <Handle 
                        type="target" 
                        position={Position.Left}
                        id="color"
                        style={{ background: "white", width: "10px", height: "10px", left: "-15px" }}
                    />
                    <input
                        type="text"
                        value={localColor}
                        onChange={handleColorChange}
                        onBlur={handleColorBlur}
                        placeholder=".5, 1, .5, 1"
                        style={{ width: "100%" }}
                    />
                </div>
            </div>
        </div>
    );
}