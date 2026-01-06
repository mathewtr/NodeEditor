import React, { useState } from "react";
import { Handle, Position } from "reactflow";

interface SineWaveNodeData {
    label: string;
    frequency: number;
    amount: number;
    onChange?: (id: string, field: string, value: number) => void;
}

interface SineWaveNodeProps {
    id: string;
    data: SineWaveNodeData;
}

export function SineWaveNode({id, data}: SineWaveNodeProps) {
    const [localFrequency, setLocalFrequency] = useState(data.frequency.toString());
    const [localAmount, setLocalAmount] = useState(data.amount.toString());
    
    const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalFrequency(e.target.value);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalAmount(e.target.value);
    };

    const handleFrequencyBlur = () => {
        const parsed = parseFloat(localFrequency);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'frequency', parsed);  
            setLocalFrequency(parsed.toString());    
        } else {
            setLocalFrequency(data.frequency.toString());
        }
    };

    const handleAmountBlur = () => {
        const parsed = parseFloat(localAmount);
        if (!isNaN(parsed)) {
            data.onChange?.(id, 'amount', parsed);  
            setLocalAmount(parsed.toString());    
        } else {
            setLocalAmount(data.amount.toString());
        }
    };

    return (
        <div style={{border: "2px solid white", padding: "10px"}}>
            <div>{data.label}</div>
            
            <div style={{marginTop: "5px"}}>
                <label style={{fontSize: "12px"}}>Frequency:</label>
                <input
                    type="number"
                    value={localFrequency}
                    onChange={handleFrequencyChange}
                    onBlur={handleFrequencyBlur}
                    style={{width: "100%"}}
                />
            </div>
            
            <div style={{marginTop: "5px"}}>
                <label style={{fontSize: "12px"}}>Amount:</label>
                <input
                    type="number"
                    value={localAmount}
                    onChange={handleAmountChange}
                    onBlur={handleAmountBlur}
                    style={{width: "100%"}}
                />
            </div>
            
            <Handle
                type="source"
                position={Position.Right}
                style={{background: "white", width: "10px", height: "10px"}}
            />
        </div>
    );
}