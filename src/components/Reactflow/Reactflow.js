import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MiniMap,
  Controls,
  Background
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AddOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Menu, MenuItem } from '@mui/material';

const nodePosition = [{x:500,y:50}]

const initialNodes = [
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

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-2', source: '3', target: '4' },
];

const FlowChart = () => {
  const theme = useTheme();
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // Track the node where the "Add" button was clicked
  const [currentNodeId, setCurrentNodeId] = useState(null);

  // State for menu (dropdown)
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // console.log("final result", nodes, edges);
  }, [nodes, edges]);

  const onNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }

  const onEdgesChange = (changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }

  const onConnect = (connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }

  const isNodeConnected = (nodeId) => {
    return edges.some(edge => edge.source === nodeId);
  }

  // Show the "Add" button when a node is not connected
  const renderNodeContent = (node) => {
    const nodeContent = node.data.label;
    const showAddIcon = !isNodeConnected(node.id);

    return (
      <div style={{ position: 'relative' }}>
        {nodeContent}
        {showAddIcon && (
          <div
            style={{
              position: 'absolute',
              bottom: -17,
              left: '50%',
              transform: 'translateX(-50%)',
              cursor: 'pointer',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '50px',
              fontSize: "1px"
            }}
            onClick={(event) => handleAddClick(event, node.id)}
          >
            <AddOutlined sx={{ width: "12px", height: "12px", transform: "scale(1.2)", color: "#fff" }} />
          </div>
        )}
      </div>
    );
  }

  // Open the dropdown when "Add" is clicked
  const handleAddClick = (event, nodeId) => {
    setAnchorEl(event.currentTarget); // open menu at clicked position
    setCurrentNodeId(nodeId); // store the current node id
  }

  // Handle selection of node type from dropdown
  const handleNodeTypeSelect = (type) => {
    setAnchorEl(null); // Close the menu

    if (!currentNodeId) return;

    // Find the current node (parent node)
    const parentNode = nodes.find(node => node.id === currentNodeId);
    if (!parentNode) return;

    if (type === 'Button') {
      // Add button parent node and child button node
      const newNodeId = (nodes.length + 1).toString();
      const buttonNode = {
        id: newNodeId,
        data: { label: 'Button' },
        position: { x: parentNode.position.x, y: parentNode.position.y + 100 },
      };

      const childButtonNodeId = (nodes.length + 2).toString();
      const childButtonNode = {
        id: childButtonNodeId,
        data: { label: 'Button 1' },
        position: { x: parentNode.position.x + 35, y: parentNode.position.y + 200 },
        style:{background:"#646464",color:"white",width:"80px",border:"none"}
      };

      setNodes((nds) => [...nds, buttonNode, childButtonNode]);
      setEdges((eds) => [
        ...eds,
        { id: `e${currentNodeId}-${newNodeId}`, source: currentNodeId, target: newNodeId },
        { id: `e${newNodeId}-${childButtonNodeId}`, source: newNodeId, target: childButtonNodeId }
      ]);
    }

    if (type === 'Carousel') {
      // Add carousel node and 4 child nodes
      const carouselNodeId = (nodes.length + 1).toString();
      const carouselNode = {
        id: carouselNodeId,
        data: { label: 'Carousel' },
        position: { x: parentNode.position.x, y: parentNode.position.y + 100 },
      };

      const card1NodeId = (nodes.length + 2).toString();
      const card1Node = {
        id: card1NodeId,
        data: { label: 'Card 1' },
        position: { x: parentNode.position.x - 100, y: parentNode.position.y + 200 },
        style:{background:"#646464",color:"white",width:"80px",border:"none"}
      };

      const card2NodeId = (nodes.length + 3).toString();
      const card2Node = {
        id: card2NodeId,
        data: { label: 'Card 2' },
        position: { x: parentNode.position.x + 150, y: parentNode.position.y + 200 },
        style:{background:"#646464",color:"white",width:"80px",border:"none"}
      };

      const button1NodeId = (nodes.length + 4).toString();
      const button1Node = {
        id: button1NodeId,
        data: { label: 'Button 1' },
        position: { x: parentNode.position.x - 100, y: parentNode.position.y + 300 },
        style:{background:"#646464",color:"white",width:"80px",border:"none"}
      };

      const button2NodeId = (nodes.length + 5).toString();
      const button2Node = {
        id: button2NodeId,
        data: { label: 'Button 2' },
        position: { x: parentNode.position.x + 150, y: parentNode.position.y + 300 },
        style:{background:"#646464",color:"white",width:"80px",border:"none"}
      };

      setNodes((nds) => [...nds, carouselNode, card1Node, card2Node, button1Node, button2Node]);
      setEdges((eds) => [
        ...eds,
        { id: `e${currentNodeId}-${carouselNodeId}`, source: currentNodeId, target: carouselNodeId },
        { id: `e${carouselNodeId}-${card1NodeId}`, source: carouselNodeId, target: card1NodeId },
        { id: `e${carouselNodeId}-${card2NodeId}`, source: carouselNodeId, target: card2NodeId },
        { id: `e${card1NodeId}-${button1NodeId}`, source: card1NodeId, target: button1NodeId },
        { id: `e${card2NodeId}-${button2NodeId}`, source: card2NodeId, target: button2NodeId }
      ]);
    }

    if (type === 'Send Message') {
      const newNodeId = (nodes.length + 1).toString();
      const messageNode = {
        id: newNodeId,
        data: { label: 'Send Message' },
        position: { x: parentNode.position.x - 35, y: parentNode.position.y + 100 },
      };

      setNodes((nds) => [...nds, messageNode]);
      setEdges((eds) => [...eds, { id: `e${currentNodeId}-${newNodeId}`, source: currentNodeId, target: newNodeId }]);
    }

    if (type === 'Collect Input') {
      const newNodeId = (nodes.length + 1).toString();
      const inputNode = {
        id: newNodeId,
        data: { label: 'Collect Input' },
        position: { x: parentNode.position.x, y: parentNode.position.y + 100 },
      };

      setNodes((nds) => [...nds, inputNode]);
      setEdges((eds) => [...eds, { id: `e${currentNodeId}-${newNodeId}`, source: currentNodeId, target: newNodeId }]);
    }

    setCurrentNodeId(null); // Reset the current node
  }

  const customNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      label: renderNodeContent(node)
    }
  }));

  return (
    <div style={{ height: '90vh' }}>
      <ReactFlow
        nodes={customNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* Dropdown for selecting node type */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleNodeTypeSelect('Button')}>Button</MenuItem>
        <MenuItem onClick={() => handleNodeTypeSelect('Carousel')}>Carousel</MenuItem>
        <MenuItem onClick={() => handleNodeTypeSelect('Send Message')}>Send Message</MenuItem>
        <MenuItem onClick={() => handleNodeTypeSelect('Collect Input')}>Collect Input</MenuItem>
      </Menu>
    </div>
  );
};

export default FlowChart;
