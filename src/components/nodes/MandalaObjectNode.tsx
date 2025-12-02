import { Handle, Position } from "reactflow";


interface MandalObjectNodeData{
    label: string;
}
interface MandalObjectNodeProps{
    id: string;
    data: MandalObjectNodeData;
}

export function MandalaObjectNode({data}: MandalObjectNodeProps){
    return(
        <div style={{border: "2px solid white", padding: "20px"}}>
            <div>{data.label}</div>
            <div style={{position: "relative"}}>
            <div style={{position: "relative"}}>
                <Handle 
                type="target" 
                position={Position.Left}
                id="speed"
                style={{background: "white", width:"10px", height: "10px"}}
                />
                <span style={{marginLeft: "20px"}}>speed</span>
            </div>
            <div style={{position: "relative"}}>
                <Handle 
                type="target" 
                position={Position.Left}
                id="complexity"
                style={{background: "white", width:"10px", height: "10px"}}
                />
                <span style={{marginLeft: "20px"}}>complexity</span>
            </div>
            </div>
            
        </div>
    )
}