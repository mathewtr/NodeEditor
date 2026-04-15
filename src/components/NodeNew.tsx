import '../styles/NodeExport.css';

interface NodeNewProps {
  hasContent: boolean;
  onNew: () => void;
}

/**
 * Button that clears the current graph and starts a fresh canvas.
 * Prompts for confirmation if the canvas isn't already empty so the
 * designer doesn't lose unsaved work by accident.
 */
export function NewGraphButton({ hasContent, onNew }: NodeNewProps) {
  const handleClick = () => {
    if (hasContent) {
      const confirmed = window.confirm(
        'Discard the current graph and start a new blank canvas? Any unsaved changes will be lost.'
      );
      if (!confirmed) return;
    }
    onNew();
  };

  return (
    <button className="graph-action-button" onClick={handleClick}>
      New
    </button>
  );
}
