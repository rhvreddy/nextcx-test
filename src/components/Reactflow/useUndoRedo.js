import { useCallback, useEffect, useState } from 'react';
import { Edge, Node, useReactFlow } from '@xyflow/react';

const defaultOptions = {
  maxHistorySize: 100,
  enableShortcuts: true,
};

export const useUndoRedo = ({
                              maxHistorySize = defaultOptions.maxHistorySize,
                              enableShortcuts = defaultOptions.enableShortcuts,
                            } = defaultOptions) => {
  // The past and future arrays store the states that we can jump to
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();

  const takeSnapshot = useCallback(() => {
    // Push the current graph to the past state
    setPast((past) => [
      ...past.slice(past.length - maxHistorySize + 1, past.length),
      { nodes: getNodes(), edges: getEdges() },
    ]);

    // Whenever we take a new snapshot, clear the redo operations to avoid state mismatches
    setFuture([]);
  }, [getNodes, getEdges, maxHistorySize]);

  const undo = useCallback(() => {
    // Get the last state that we want to go back to
    const pastState = past[past.length - 1];

    if (pastState) {
      // First, remove the state from the history
      setPast((past) => past.slice(0, past.length - 1));
      // Store the current graph for the redo operation
      setFuture((future) => [
        ...future,
        { nodes: getNodes(), edges: getEdges() },
      ]);
      // Now we can set the graph to the past state
      setNodes(pastState.nodes);
      setEdges(pastState.edges);
    }
  }, [setNodes, setEdges, getNodes, getEdges, past]);

  const redo = useCallback(() => {
    const futureState = future[future.length - 1];

    if (futureState) {
      setFuture((future) => future.slice(0, future.length - 1));
      setPast((past) => [...past, { nodes: getNodes(), edges: getEdges() }]);
      setNodes(futureState.nodes);
      setEdges(futureState.edges);
    }
  }, [setNodes, setEdges, getNodes, getEdges, future]);

  useEffect(() => {
    // This effect is used to attach the global event handlers
    if (!enableShortcuts) {
      return;
    }

    const keyDownHandler = (event) => {
      if (
        event.key === 'z' &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey
      ) {
        redo();
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        undo();
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [undo, redo, enableShortcuts]);

  return {
    undo,
    redo,
    takeSnapshot,
    canUndo: past.length === 0,
    canRedo: future.length === 0,
  };
};

export default useUndoRedo;
