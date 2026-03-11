import { Handle, Position, type NodeProps } from 'reactflow';
import { useNodeDefinitionsContext } from '../../contexts/NodeDefinitionsContext';
import { NodeField } from './NodeField';

export function GenericNode({ id, data, type }: NodeProps) {
  const definitions = useNodeDefinitionsContext();
  const definition = definitions?.nodeTypes.find((n) => n.id === type);

  if (!definition) {
    return <div className="node">Unknown node: {type}</div>;
  }

  // Build a set of input IDs for quick lookup
  const inputIds = new Set(definition.inputs.map((i) => i.id));

  // Parameters that have matching inputs get connection handles
  const paramEntries = definition.parameters.map((param) => ({
    ...param,
    hasHandle: inputIds.has(param.name),
  }));

  // Inputs that don't have matching parameters get standalone handles
  const standaloneInputs = definition.inputs.filter(
    (input) => !definition.parameters.some((p) => p.name === input.id)
  );

  // Multiple outputs need vertical positioning
  const outputCount = definition.outputs.length;

  return (
    <div className="node">
      {/* Standalone input handles (no matching parameter) */}
      {standaloneInputs.map((input) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          className="node-handle"
        />
      ))}

      {/* Header */}
      <div className="node-header">
        <span className="node-title">{data.label}</span>
      </div>

      {/* Parameter fields (with optional connection handles) */}
      {paramEntries.length > 0 && (
        <div className="node-params">
          {paramEntries.map((param) => (
            <NodeField
              key={param.name}
              label={param.name}
              value={data[param.name] as number | number[] | string}
              nodeId={id}
              fieldName={param.name}
              handleId={param.hasHandle ? param.name : undefined}
              onChange={data.onChange}
              placeholder={
                Array.isArray(param.default)
                  ? param.default.join(', ')
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Output handles */}
      {definition.outputs.map((output, i) => (
        <div key={output.id} className="node-output-row">
          <Handle
            type="source"
            position={Position.Right}
            id={output.id}
            className="node-handle"
            style={
              outputCount > 1
                ? {
                    top: `${((i + 1) / (outputCount + 1)) * 100}%`,
                    transform: 'translateY(-50%)',
                  }
                : undefined
            }
          />
          {outputCount > 1 && (
            <span className="node-output-label">{output.id.toUpperCase()}</span>
          )}
        </div>
      ))}
    </div>
  );
}
