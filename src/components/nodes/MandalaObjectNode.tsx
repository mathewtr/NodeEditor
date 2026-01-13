import { useState } from "react";
import { Handle, Position } from "reactflow";


interface MandalObjectNodeData{
    label: string;
    speed: number;
    complexity: number;
    onChange?: (id: string, field: string, value: number) => void; 
}
interface MandalObjectNodeProps{
    id: string;
    data: MandalObjectNodeData;
}

export function MandalaObjectNode({id, data}: MandalObjectNodeProps){

    const [localSpeed, setLocalSpeed] = useState(data.speed.toString());
    const [localComplexity, setLocalComplexity] = useState(data.complexity.toString());

    const handleSpeedChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setLocalSpeed(e.target.value);
    }
    const handleComplexityChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setLocalComplexity(e.target.value);
    }

    const handleSpeedBlur = () => {
        const parsed = parseFloat(localSpeed);
        if(!isNaN(parsed)) {
            data.onChange?.(id, "speed", parsed);
            setLocalSpeed(parsed.toString());
        } else {
            setLocalSpeed(data.speed.toString());
        }
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
    return (
        <div style={{ border: "2px solid white", padding: "10px" }}>
            <div>{data.label}</div>

            {/* Speed Input */}
            <div style={{ marginTop: "5px" }}>
                <label style={{ fontSize: "12px" }}>speed:</label>
                <div style={{ position: "relative" }}>
                    <Handle 
                        type="target" 
                        position={Position.Left}
                        id="speed"
                        style={{ background: "white", width: "10px", height: "10px", left: "-15px" }}
                    />
                    <input
                        type="number"
                        value={localSpeed}
                        onChange={handleSpeedChange}
                        onBlur={handleSpeedBlur}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            {/* Complexity Input */}
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
        </div>
    );
}