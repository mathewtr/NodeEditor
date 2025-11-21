import { useState, useEffect } from 'react';
import type { NodeDefinitionsFile, NodeDefinition } from '../types/nodeDefinitions.ts';

export function useNodeDefinitions() {
  // STATE: Store the loaded definitions
  const [definitions, setDefinitions] = useState<NodeDefinitionsFile | null>(null);
  
  // STATE: Track if we're still loading
  const [loading, setLoading] = useState<boolean>(true);
  
  // STATE: Store any error that occurs
  const [error, setError] = useState<string | null>(null);

  // EFFECT: Run this code when component mounts
  useEffect(() => {
    async function loadDefinitions() {
      try {
        setLoading(true);
        
        // Fetch the JSON file from /public folder
        const response = await fetch('/nodeDefinitions.json');
        
        // Check if fetch was successful
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.statusText}`);
        }
        
        // Parse the JSON
        const data: NodeDefinitionsFile = await response.json();
        
        // Save it to state
        setDefinitions(data);
        setError(null);
      } catch (err) {
        console.error('Error loading node definitions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadDefinitions();
  }, []); // Empty array = run once when component mounts

  // Return the data for components to use
  return { definitions, loading, error };
}

// HELPER: Find a specific node definition by ID
export function getNodeDefinition(
  definitions: NodeDefinitionsFile | null,
  nodeId: string
): NodeDefinition | undefined {
  return definitions?.nodeTypes.find(node => node.id === nodeId);
}