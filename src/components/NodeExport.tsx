import type { ReactFlowInstance } from "reactflow";

// The DOM Button object that, when clicked, triggers the download
const ExportGraphButton = (reactFlowInstance: ReactFlowInstance) => <button onClick={() => ExportGraph(reactFlowInstance)}>Export Node Graph</button>;
// TODO: fix the red squiggly - Cole

// Functionality to take the node graph, put it in a file, and download it
const ExportGraph = (reactFlowInstance: ReactFlowInstance) => {
	// TODO: Refine JSON object to only include nodes and edges before stringify - Cole
	const jsonString = JSON.stringify(reactFlowInstance, null, 2);
	const link: HTMLAnchorElement = document.createElement("a");
	const filename = "export.json";
	const contentType = "application/json;charset=utf-8;";
	link.href = 'data:' + contentType + ',' + encodeURIComponent(jsonString);
	link.download = filename;
	link.target = '_blank';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export default ExportGraphButton;