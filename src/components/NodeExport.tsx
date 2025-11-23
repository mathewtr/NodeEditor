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
	console.log("HI!!!!!!!!!!")
	const link = document.createElement("a")
	link.href = "NodeExport.txt"
	link.download = "NodeExport.txt"
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	
}