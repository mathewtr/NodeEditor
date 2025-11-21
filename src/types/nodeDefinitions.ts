// What data types can flow through connections?
export type ConnectionType = 'float' | 'int' | 'vector4' | 'object';

//  What does an input/output port look like?
export interface NodePort {
  id: string;           
  type: ConnectionType; 
}

// What does an editable parameter look like?
export interface NodeParameter {
  name: string;            // (e.g. "frequency")
  type: 'float' | 'int';  
  default: number;  
}

// What does a complete node type definition look like?
export interface NodeDefinition {
  id: string;                  // Unique ID (e.g., "value", "sine_wave")
  title: string;               // Display name (e.g., "Sine Wave")
  type: string;                // Category (e.g., "parameter", "connector", "generator")
  appParameter?: string;       // OPTIONAL: Only for connector nodes (e.g., "complexity")
  inputs: NodePort[];          // Array of input ports
  outputs: NodePort[];         // Array of output ports
  parameters: NodeParameter[]; // Array of editable parameters
}

// What does the entire JSON file look like?
export interface NodeDefinitionsFile {
  version: string;                  // File version (e.g., "1.0")
  description: string;              // Description of file
  nodeTypes: NodeDefinition[];      // Array of all node definitions
}