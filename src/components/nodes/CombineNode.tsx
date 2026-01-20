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
    const [isEditingR, setIsEditingR] = useState(false);
    const [isEditingG, setIsEditingG] = useState(false);
    const [isEditingB, setIsEditingB] = useState(false);
    const [isEditingA, setIsEditingA] = useState(false);

    // Display values: use local when editing, data when not
    const displayR = isEditingR ? localR : data.r.toString();
    const displayG = isEditingG ? localG : data.g.toString();
    const displayB = isEditingB ? localB : data.b.toString();
    const displayA = isEditingA ? localA : data.a.toString();

    // R handlers
    const handleRFocus = () => {
        setIsEditingR(true);
        setLocalR(data.r.toString());
    };

    const handleRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalR(e.target.value);
    };

    const handleRBlur = () => {
        setIsEditingR(false);
        const parsed = parseFloat(localR);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'r', parsed);
            setLocalR(parsed.toString());
        } else {
            setLocalR(data.r.toString());
        }
    };

    // G handlers
    const handleGFocus = () => {
        setIsEditingG(true);
        setLocalG(data.g.toString());
    };

    const handleGChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalG(e.target.value);
    };

    const handleGBlur = () => {
        setIsEditingG(false);
        const parsed = parseFloat(localG);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'g', parsed);
            setLocalG(parsed.toString());
        } else {
            setLocalG(data.g.toString());
        }
    };

    // B handlers
    const handleBFocus = () => {
        setIsEditingB(true);
        setLocalB(data.b.toString());
    };

    const handleBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalB(e.target.value);
    };

    const handleBBlur = () => {
        setIsEditingB(false);
        const parsed = parseFloat(localB);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'b', parsed);
            setLocalB(parsed.toString());
        } else {
            setLocalB(data.b.toString());
        }
    };

    // A handlers
    const handleAFocus = () => {
        setIsEditingA(true);
        setLocalA(data.a.toString());
    };

    const handleAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalA(e.target.value);
    };

    const handleABlur = () => {
        setIsEditingA(false);
        const parsed = parseFloat(localA);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'a', parsed);
            setLocalA(parsed.toString());
        } else {
            setLocalA(data.a.toString());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    return (
        <div style={{ border: "2px solid white", padding: "20px", position: "relative" }}>
            <div>{data.label}</div>

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
                        value={displayR}
                        onChange={handleRChange}
                        onFocus={handleRFocus}
                        onBlur={handleRBlur}
                        onKeyDown={handleKeyDown}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>


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
                        value={displayG}
                        onChange={handleGChange}
                        onFocus={handleGFocus}
                        onBlur={handleGBlur}
                        onKeyDown={handleKeyDown}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>


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
                        value={displayB}
                        onChange={handleBChange}
                        onFocus={handleBFocus}
                        onBlur={handleBBlur}
                        onKeyDown={handleKeyDown}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>


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
                        value={displayA}
                        onChange={handleAChange}
                        onFocus={handleAFocus}
                        onBlur={handleABlur}
                        onKeyDown={handleKeyDown}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>


            <Handle
                type="source"
                position={Position.Right}
                id="output"
                style={{ background: "white", width: "10px", height: "10px" }}
            />
        </div>
    );
}