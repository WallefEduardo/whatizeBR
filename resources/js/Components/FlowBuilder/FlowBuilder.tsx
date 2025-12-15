import React, { useCallback, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Node,
    NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodePalette from './NodePalette';
import NodeEditor from './NodeEditor';
import StartNode from './Nodes/StartNode';
import TextNode from './Nodes/TextNode';
import ButtonNode from './Nodes/ButtonNode';
import ListNode from './Nodes/ListNode';
import MediaNode from './Nodes/MediaNode';
import DelayNode from './Nodes/DelayNode';
import ConditionNode from './Nodes/ConditionNode';
import ApiNode from './Nodes/ApiNode';
import TransferNode from './Nodes/TransferNode';
import EndNode from './Nodes/EndNode';
import { validateFlow, convertToBackendFormat } from './flowValidation';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import FlowSimulator from './FlowSimulator';

const nodeTypes: NodeTypes = {
    start: StartNode,
    text: TextNode,
    button: ButtonNode,
    list: ListNode,
    media: MediaNode,
    delay: DelayNode,
    condition: ConditionNode,
    api: ApiNode,
    transfer: TransferNode,
    end: EndNode,
};

interface FlowBuilderProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    onSave?: (nodes: Node[], edges: Edge[]) => void;
}

export default function FlowBuilder({ initialNodes = [], initialEdges = [], onSave }: FlowBuilderProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [validationErrors, setValidationErrors] = useState<any[]>([]);
    const [showValidation, setShowValidation] = useState(false);
    const [showSimulator, setShowSimulator] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const addNode = useCallback(
        (type: string) => {
            const newNode: Node = {
                id: `node-${type}-${Date.now()}`,
                type,
                position: { x: 250, y: 100 },
                data: { label: `${type} node` },
            };

            setNodes((nds) => [...nds, newNode]);
        },
        [setNodes]
    );

    const updateNodeData = useCallback(
        (nodeId: string, data: any) => {
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
                )
            );
        },
        [setNodes]
    );

    const deleteNode = useCallback(
        (nodeId: string) => {
            setNodes((nds) => nds.filter((node) => node.id !== nodeId));
            setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
            setSelectedNode(null);
        },
        [setNodes, setEdges]
    );

    const handleValidate = useCallback(() => {
        const result = validateFlow(nodes, edges);
        setValidationErrors(result.errors);
        setShowValidation(true);
        return result;
    }, [nodes, edges]);

    const handleSave = useCallback(() => {
        const validation = validateFlow(nodes, edges);
        setValidationErrors(validation.errors);

        if (!validation.isValid) {
            setShowValidation(true);
            alert('O fluxo contém erros. Por favor, corrija-os antes de salvar.');
            return;
        }

        if (onSave) {
            const flowData = convertToBackendFormat(nodes, edges);
            onSave(flowData.nodes, flowData.edges);
        }
    }, [nodes, edges, onSave]);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Node Palette Sidebar */}
            <NodePalette onAddNode={addNode} />

            {/* Main Canvas */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background />
                    <Controls />
                    <MiniMap />
                </ReactFlow>

                {/* Toolbar */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={() => setShowSimulator(true)}
                        className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
                        style={{ borderRadius: '4px' }}
                    >
                        Testar
                    </button>
                    <button
                        onClick={handleValidate}
                        className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                        style={{ borderRadius: '4px' }}
                    >
                        Validar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        style={{ borderRadius: '4px' }}
                    >
                        Salvar Fluxo
                    </button>
                </div>

                {/* Validation Panel */}
                {showValidation && (
                    <div className="absolute top-20 right-4 z-10 w-80 bg-white border border-gray-200 shadow-lg" style={{ borderRadius: '4px' }}>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Validação do Fluxo</h3>
                            <button
                                onClick={() => setShowValidation(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {validationErrors.length === 0 ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircleIcon className="w-5 h-5" />
                                    <span className="text-sm">Fluxo válido!</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {validationErrors.map((error, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-2 p-2 ${
                                                error.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                                            }`}
                                            style={{ borderRadius: '4px' }}
                                        >
                                            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span className="text-xs">{error.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Node Editor Sidebar */}
            {selectedNode && (
                <NodeEditor
                    node={selectedNode}
                    onUpdateNode={updateNodeData}
                    onDeleteNode={deleteNode}
                    onClose={() => setSelectedNode(null)}
                />
            )}

            {/* Flow Simulator */}
            {showSimulator && (
                <FlowSimulator
                    nodes={nodes}
                    edges={edges}
                    onClose={() => setShowSimulator(false)}
                />
            )}
        </div>
    );
}
