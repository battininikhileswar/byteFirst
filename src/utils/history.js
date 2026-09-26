import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing undo/redo history of design states.
 */
export function useDesignHistory(initialDesign) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialDesign);
  const [future, setFuture] = useState([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Update design with option to commit to undo history
  const updateDesign = useCallback((newDesignOrFn, commitToHistory = true) => {
    setPresent((current) => {
      const next = typeof newDesignOrFn === 'function' ? newDesignOrFn(current) : newDesignOrFn;
      if (JSON.stringify(current) === JSON.stringify(next)) {
        return current;
      }

      if (commitToHistory) {
        setPast((prevPast) => [...prevPast.slice(-30), current]); // Keep last 30 states
        setFuture([]); // Clear redo stack on new action
      }
      return next;
    });
  }, []);

  // Undo to previous state
  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setPresent((current) => {
        setFuture((prevFuture) => [current, ...prevFuture]);
        return previous;
      });

      return newPast;
    });
  }, []);

  // Redo to next state
  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setPresent((current) => {
        setPast((prevPast) => [...prevPast, current]);
        return next;
      });

      return newFuture;
    });
  }, []);

  // Reset entirely
  const resetDesign = useCallback((newInitial) => {
    setPast([]);
    setPresent(newInitial);
    setFuture([]);
  }, []);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y / Ctrl+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    design: present,
    setDesign: updateDesign,
    undo,
    redo,
    canUndo,
    canRedo,
    resetDesign
  };
}
