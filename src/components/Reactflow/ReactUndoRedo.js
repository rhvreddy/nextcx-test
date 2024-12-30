import React, { CSSProperties, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Panel,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  useReactFlow,
  NodeOrigin,
  Node,
  Edge,
  DefaultEdgeOptions,
  ProOptions,
  OnConnect,
  SelectionDragHandler,
  OnNodesDelete,
  OnEdgesDelete,
  OnNodeDrag,
} from '@xyflow/react';

// Importing the useUndoRedo hook
import useUndoRedo from './useUndoRedo';
import '@xyflow/react/dist/style.css';

const nodeLabels = [
  'Wire',
  'your',
  'ideas',
  'with',
  'React',
  'Flow',
  '!',
];
const nodePosition = [{x:500,y:50}]
const proOptions = { account: 'paid-pro', hideAttribution: true };
const defaultNodes = [
  {
    id: '1',
    type: 'customNode',
    data: { label: 'Bot triggered' },
    position: { x: nodePosition[0].x, y: nodePosition[0].y},
  },
  {
    id: '2',
    type: "customNode",
    data: { label: 'Welcome Message 1' },
    position: { x: nodePosition[0].x - 250, y: nodePosition[0].y + 100 },
  },
  {
    id: '3',
    type: "customNode",
    data: { label: 'Welcome Message 2' },
    position: { x: nodePosition[0].x + 250, y: nodePosition[0].y + 100 },
  },
  {
    id: '4',
    type: 'customNode',
    data: { label: 'Buttons Menu' },
    position: { x:  nodePosition[0].x + 250, y: nodePosition[0].y + 200 },
  },
];
const defaultEdgeOptions = [];
const defaultEdges = [ { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-2', source: '3', target: '4' },]
const connectionLineStyle = {
  strokeWidth: 2,
  stroke: '#ff99c7',
};
const nodeOrigin = [0.5, 0.5];

function ReactFlowPro() {
  const { undo, redo, canUndo, canRedo, takeSnapshot } = useUndoRedo();
  const [nodes, , onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const { screenToFlowPosition, addNodes } = useReactFlow();

  const onConnect = useCallback(
    (connection) => {
      takeSnapshot(); // Make adding edges undoable
      setEdges((edges) => addEdge(connection, edges));
    },
    [setEdges, takeSnapshot]
  );

  const onPaneClick = useCallback(
    (evt) => {
      takeSnapshot(); // Make adding nodes undoable
      const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
      const label = nodeLabels.shift();
      addNodes([
        {
          id: `${new Date().getTime()}`,
          data: { label },
          position
        },
      ]);
      nodeLabels.push(`${label}`);
    },
    [takeSnapshot, addNodes, screenToFlowPosition]
  );

  const onNodeDragStart = useCallback(() => {
    takeSnapshot(); // Make dragging a node undoable
  }, [takeSnapshot]);

  const onSelectionDragStart = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodesDelete = useCallback(() => {
    takeSnapshot(); // Make deleting nodes undoable
  }, [takeSnapshot]);

  const onEdgesDelete = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      proOptions={proOptions}
      onConnect={onConnect}
      onNodeDragStart={onNodeDragStart}
      onSelectionDragStart={onSelectionDragStart}
      onNodesDelete={onNodesDelete}
      onEdgesDelete={onEdgesDelete}
      defaultEdgeOptions={defaultEdgeOptions}
      onPaneClick={onPaneClick}
      nodeOrigin={nodeOrigin}
      connectionLineStyle={connectionLineStyle}
      selectNodesOnDrag={false}
    >
      <Background />
      <Controls />
      <Panel position="bottom-center">
        <div>
          <button disabled={canUndo} onClick={undo}>
            <span>⤴️</span> undo
          </button>
          <button disabled={canRedo} onClick={redo}>
            redo <span>⤵️</span>
          </button>
        </div>
      </Panel>
    </ReactFlow>
  );
}

// React Flow Wrapper Component
function ReactFlowWrapper(props) {
  return (
    <div style={{ height: '90vh' }}>
    <ReactFlowProvider>
      <ReactFlowPro {...props} />
    </ReactFlowProvider>
    </div>
  );
}

export default ReactFlowWrapper;
