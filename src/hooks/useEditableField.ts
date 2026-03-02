import { useState } from 'react';

/**
 * Hook for editable input fields that show the data value when idle
 * and a local value while the user is typing. Commits on blur or Enter.
 * Handles both single numbers and number arrays (vectors).
 */

export function useEditableField(
  dataValue: number | number[],
  onCommit: (value: number | number[]) => void
) {
  const [localValue, setLocalValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const format = (v: number | number[]) =>
    Array.isArray(v) ? v.join(', ') : v.toString();

  const displayValue = isEditing ? localValue : format(dataValue);

  const handleFocus = () => {
    setIsEditing(true);
    setLocalValue(format(dataValue));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (Array.isArray(dataValue)) {
      const parsed = localValue.split(',').map(v => parseFloat(v.trim()));
      if (parsed.length === dataValue.length && parsed.every(v => !isNaN(v))) {
        onCommit(parsed);
      }
    } else {
      const parsed = parseFloat(localValue);
      if (!isNaN(parsed)) {
        onCommit(parsed);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return { displayValue, handleFocus, handleChange, handleBlur, handleKeyDown };
}
