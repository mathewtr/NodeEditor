import { createContext, useContext } from 'react';
import type { NodeDefinitionsFile } from '../types/nodeDefinitions';

export const NodeDefinitionsContext = createContext<NodeDefinitionsFile | null>(null);

export function useNodeDefinitionsContext() {
  return useContext(NodeDefinitionsContext);
}
