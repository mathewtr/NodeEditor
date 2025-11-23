// import { useReactFlow } from 'reactflow';

// The DOM object that, when clicked, triggers the download
export function ExportGraphButton() {
	return (
			<button onClick={ExportGraph}>
				Export Node Graph
			</button>
	)
}


// Functionality to take the node graph, put it in a file, and download it
function ExportGraph(): void {
	// const reactFlowInstance = useReactFlow();

	// const flowData = reactFlowInstance.getNodes();
	// const jsonString = JSON.stringify(flowData, null, 2);
	// console.log(jsonString);
	
	const link: HTMLAnchorElement = document.createElement("a");
	link.href = "NodeExport.txt";
	link.download = "NodeExport.txt";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	
}