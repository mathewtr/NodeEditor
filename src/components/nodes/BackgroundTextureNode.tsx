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
    const [isEditingComplexity, setIsEditingComplexity] = useState(false);
    const [isEditingIndex, setIsEditingIndex] = useState(false);
    const [isEditingColor, setIsEditingColor] = useState(false);

    // Display values: use local when editing, data when not
    const displayComplexity = isEditingComplexity ? localComplexity : data.complexity.toString();
    const displayIndex = isEditingIndex ? localIndex : data.index.toString();
    const displayColor = isEditingColor ? localColor : data.color.join(', ');

    // Complexity handlers
    const handleComplexityFocus = () => {
        setIsEditingComplexity(true);
        setLocalComplexity(data.complexity.toString());
    };

    const handleComplexityChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setLocalComplexity(e.target.value);
    };

    const handleComplexityBlur = () => {
        setIsEditingComplexity(false);
        const parsed = parseFloat(localComplexity);
        if(!isNaN(parsed)) {
            data.onChange?.(id, "complexity", parsed);
            setLocalComplexity(parsed.toString());
        } else {
            setLocalComplexity(data.complexity.toString());
        }
    };

    // Index handlers
    const handleIndexFocus = () => {
        setIsEditingIndex(true);
        setLocalIndex(data.index.toString());
    };

    const handleIndexChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setLocalIndex(e.target.value);
    };

    const handleIndexBlur = () => {
        setIsEditingIndex(false);
        const parsed = parseInt(localIndex);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'index', parsed);
            setLocalIndex(parsed.toString());
        } else {
            setLocalIndex(data.index.toString());
        }
    };

    // Color handlers
    const handleColorFocus = () => {
        setIsEditingColor(true);
        setLocalColor(data.color.join(', '));
    };

    const handleColorChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setLocalColor(e.target.value);
    };

    const handleColorBlur = () => {
        setIsEditingColor(false);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
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
                        value={displayComplexity}
                        onChange={handleComplexityChange}
                        onFocus={handleComplexityFocus}
                        onBlur={handleComplexityBlur}
                        onKeyDown={handleKeyDown}
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
                        value={displayIndex}
                        onChange={handleIndexChange}
                        onFocus={handleIndexFocus}
                        onBlur={handleIndexBlur}
                        onKeyDown={handleKeyDown}
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
                        value={displayColor}
                        onChange={handleColorChange}
                        onFocus={handleColorFocus}
                        onBlur={handleColorBlur}
                        onKeyDown={handleKeyDown}
                        placeholder=".5, 1, .5, 1"
                        style={{ width: "100%" }}
                    />
                </div>
            </div>
        </div>
    );
}