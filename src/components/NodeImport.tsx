import type { Edge, ReactFlowInstance } from "reactflow";

import '../styles/NodeExport.css';

interface NodeExportProps {
	reactFlowInstance: ReactFlowInstance<Node, Edge> | null; 
  }

// The DOM Button object that, when clicked, triggers the download
const ImportGraphButton = ({reactFlowInstance}: NodeExportProps) => <button className="export-button" onClick={() => 
	{if (reactFlowInstance) {
		ImportGraph(reactFlowInstance);
	}
		}}>Upload (Currently non-functional)</button>;

// Functionality to take the node graph, put it in a file, and download it
const ImportGraph = (reactFlowInstance: ReactFlowInstance) => {
	
// 	const reactFlowContents = reactFlowInstance.toObject()
// 	const exportContents = { nodes: reactFlowContents.nodes, edges: reactFlowContents.edges}
// 	const jsonString = JSON.stringify(exportContents, null, 2);
// 	console.log(jsonString)
// 	const link: HTMLAnchorElement = document.createElement("a");
// 	const filename = "export.json";
// 	const contentType = "application/json;charset=utf-8;";
// 	link.href = 'data:' + contentType + ',' + encodeURIComponent(jsonString);
// 	link.download = filename;
// 	link.target = '_blank';
// 	document.body.appendChild(link);
// 	link.click();
// 	document.body.removeChild(link);
}

export default ImportGraphButton;