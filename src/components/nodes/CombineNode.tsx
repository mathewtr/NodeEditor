// src/nodes/CombineNode.tsx
import React, { useState } from "react";
import { Handle, Position } from "reactflow";

interface CombineNodeData {
    label: string;
    r: number;
    g: number;
    b: number;
    a: number;
    onChange?: (id: string, field: string, value: number) => void;
}

interface CombineNodeProps {
    id: string;
    data: CombineNodeData;
}

export function CombineNode({ id, data }: CombineNodeProps) {
    const [localR, setLocalR] = useState(data.r.toString());
    const [localG, setLocalG] = useState(data.g.toString());
    const [localB, setLocalB] = useState(data.b.toString());
    const [localA, setLocalA] = useState(data.a.toString());

    const handleRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalR(e.target.value);
    };

    const handleGChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalG(e.target.value);
    };

    const handleBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalB(e.target.value);
    };

    const handleAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalA(e.target.value);
    };

    const handleRBlur = () => {
        const parsed = parseFloat(localR);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'r', parsed);
            setLocalR(parsed.toString());
        } else {
            setLocalR(data.r.toString());
        }
    };

    const handleGBlur = () => {
        const parsed = parseFloat(localG);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'g', parsed);
            setLocalG(parsed.toString());
        } else {
            setLocalG(data.g.toString());
        }
    };

    const handleBBlur = () => {
        const parsed = parseFloat(localB);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'b', parsed);
            setLocalB(parsed.toString());
        } else {
            setLocalB(data.b.toString());
        }
    };

    const handleABlur = () => {
        const parsed = parseFloat(localA);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'a', parsed);
            setLocalA(parsed.toString());
        } else {
            setLocalA(data.a.toString());
        }
    };

    return (
        <div style={{ border: "2px solid white", padding: "20px", position: "relative" }}>
            <div>{data.label}</div>

            {/* R Input */}
            <div style={{ marginTop: "5px" }}>
                <label style={{ fontSize: "12px" }}>R:</label>
                <div style={{ position: "relative" }}>
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="r"
                        style={{ background: "white", width: "10px", height: "10px", left: "-15px" }}
                    />
                    <input
                        type="number"
                        value={localR}
                        onChange={handleRChange}
                        onBlur={handleRBlur}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            {/* G Input */}
            <div style={{ marginTop: "5px" }}>
                <label style={{ fontSize: "12px" }}>G:</label>
                <div style={{ position: "relative" }}>
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="g"
                        style={{ background: "white", width: "10px", height: "10px", left: "-15px" }}
                    />
                    <input
                        type="number"
                        value={localG}
                        onChange={handleGChange}
                        onBlur={handleGBlur}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            {/* B Input */}
            <div style={{ marginTop: "5px" }}>
                <label style={{ fontSize: "12px" }}>B:</label>
                <div style={{ position: "relative" }}>
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="b"
                        style={{ background: "white", width: "10px", height: "10px", left: "-15px" }}
                    />
                    <input
                        type="number"
                        value={localB}
                        onChange={handleBChange}
                        onBlur={handleBBlur}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            {/* A Input */}
            <div style={{ marginTop: "5px" }}>
                <label style={{ fontSize: "12px" }}>A:</label>
                <div style={{ position: "relative" }}>
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="a"
                        style={{ background: "white", width: "10px", height: "10px", left: "-15px" }}
                    />
                    <input
                        type="number"
                        value={localA}
                        onChange={handleAChange}
                        onBlur={handleABlur}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="output"
                style={{ background: "white", width: "10px", height: "10px" }}
            />
        </div>
    );
}