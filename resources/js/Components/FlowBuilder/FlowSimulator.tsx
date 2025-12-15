import React, { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { PlayIcon, XMarkIcon, ChatBubbleLeftIcon, UserIcon } from '@heroicons/react/24/outline';

interface Message {
    id: string;
    type: 'bot' | 'user';
    content: string;
    metadata?: any;
}

interface FlowSimulatorProps {
    nodes: Node[];
    edges: Edge[];
    onClose: () => void;
}

export default function FlowSimulator({ nodes, edges, onClose }: FlowSimulatorProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
    const [variables, setVariables] = useState<Record<string, any>>({
        contact_name: 'Usuário Teste',
        contact_phone: '+5511999999999',
    });
    const [userInput, setUserInput] = useState('');
    const [isWaitingResponse, setIsWaitingResponse] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    const addMessage = (type: 'bot' | 'user', content: string, metadata?: any) => {
        const message: Message = {
            id: `msg-${Date.now()}`,
            type,
            content,
            metadata,
        };
        setMessages((prev) => [...prev, message]);
    };

    const replaceVariables = (text: string): string => {
        let result = text;
        Object.keys(variables).forEach((key) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            result = result.replace(regex, variables[key] || '');
        });
        return result;
    };

    const getNode = (nodeId: string): Node | undefined => {
        return nodes.find((n) => n.id === nodeId);
    };

    const getNextNode = (nodeId: string, userResponse?: string): Node | undefined => {
        const outgoingEdges = edges.filter((e) => e.source === nodeId);

        if (outgoingEdges.length === 0) return undefined;

        const currentNode = getNode(nodeId);
        if (currentNode?.type === 'condition') {
            // Simplified condition evaluation
            const variable = currentNode.data.variable;
            const operator = currentNode.data.operator || '==';
            const value = currentNode.data.value;
            const variableValue = variables[variable];

            let result = false;
            switch (operator) {
                case '==':
                    result = variableValue == value;
                    break;
                case '!=':
                    result = variableValue != value;
                    break;
                case 'contains':
                    result = String(variableValue).includes(String(value));
                    break;
            }

            const targetEdge = outgoingEdges.find((e) => e.data?.condition === (result ? 'true' : 'false'));
            return targetEdge ? getNode(targetEdge.target) : undefined;
        }

        const firstEdge = outgoingEdges[0];
        return firstEdge ? getNode(firstEdge.target) : undefined;
    };

    const executeNode = (node: Node) => {
        setCurrentNodeId(node.id);

        switch (node.type) {
            case 'start':
                const nextNode = getNextNode(node.id);
                if (nextNode) {
                    setTimeout(() => executeNode(nextNode), 500);
                }
                break;

            case 'text':
                const message = replaceVariables(node.data.message || '');
                addMessage('bot', message);

                if (node.data.wait_for_response) {
                    setIsWaitingResponse(true);
                } else {
                    const next = getNextNode(node.id);
                    if (next) {
                        setTimeout(() => executeNode(next), 1000);
                    } else {
                        setIsRunning(false);
                    }
                }
                break;

            case 'button':
                const buttonMessage = replaceVariables(node.data.message || '');
                addMessage('bot', buttonMessage, {
                    type: 'buttons',
                    buttons: node.data.buttons || [],
                });
                setIsWaitingResponse(true);
                break;

            case 'list':
                const listMessage = replaceVariables(node.data.message || '');
                addMessage('bot', listMessage, {
                    type: 'list',
                    title: node.data.title || 'Opções',
                });
                setIsWaitingResponse(true);
                break;

            case 'media':
                const caption = node.data.caption ? replaceVariables(node.data.caption) : '';
                addMessage('bot', `[${node.data.media_type}] ${caption}`, {
                    type: 'media',
                    media_type: node.data.media_type,
                    media_url: node.data.media_url,
                });
                const mediaNext = getNextNode(node.id);
                if (mediaNext) {
                    setTimeout(() => executeNode(mediaNext), 1000);
                } else {
                    setIsRunning(false);
                }
                break;

            case 'delay':
                const delaySeconds = node.data.delay_seconds || 1;
                addMessage('bot', `[Aguardando ${delaySeconds}s...]`);
                const delayNext = getNextNode(node.id);
                if (delayNext) {
                    setTimeout(() => executeNode(delayNext), delaySeconds * 1000);
                } else {
                    setIsRunning(false);
                }
                break;

            case 'condition':
                const condNext = getNextNode(node.id);
                if (condNext) {
                    setTimeout(() => executeNode(condNext), 500);
                } else {
                    setIsRunning(false);
                }
                break;

            case 'api':
                addMessage('bot', '[Chamando API...]');
                const apiNext = getNextNode(node.id);
                if (apiNext) {
                    setTimeout(() => executeNode(apiNext), 1500);
                } else {
                    setIsRunning(false);
                }
                break;

            case 'transfer':
                const transferMsg = replaceVariables(node.data.message || 'Transferindo...');
                addMessage('bot', transferMsg);
                setIsRunning(false);
                break;

            case 'end':
                if (node.data.message) {
                    const endMsg = replaceVariables(node.data.message);
                    addMessage('bot', endMsg);
                }
                setIsRunning(false);
                break;
        }
    };

    const handleStart = () => {
        setMessages([]);
        setIsRunning(true);
        setIsWaitingResponse(false);

        const startNode = nodes.find((n) => n.type === 'start');
        if (startNode) {
            executeNode(startNode);
        } else {
            addMessage('bot', 'Erro: Nó de início não encontrado');
            setIsRunning(false);
        }
    };

    const handleSendMessage = () => {
        if (!userInput.trim() || !currentNodeId) return;

        addMessage('user', userInput);

        const currentNode = getNode(currentNodeId);
        if (currentNode?.data.variable_name) {
            setVariables((prev) => ({ ...prev, [currentNode.data.variable_name]: userInput }));
        }

        setIsWaitingResponse(false);
        const nextNode = getNextNode(currentNodeId, userInput);
        setUserInput('');

        if (nextNode) {
            setTimeout(() => executeNode(nextNode), 500);
        } else {
            setIsRunning(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl h-[600px] flex flex-col" style={{ borderRadius: '4px' }}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Simulador de Fluxo</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        style={{ borderRadius: '4px' }}
                    >
                        <XMarkIcon className="w-5 h-5" style={{ color: '#737373' }} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.length === 0 && !isRunning && (
                        <div className="text-center text-gray-500 mt-8">
                            <p>Clique em "Iniciar Simulação" para testar o fluxo</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`flex gap-2 max-w-[80%] ${
                                    msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                                }`}
                            >
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                        msg.type === 'user' ? 'bg-blue-100' : 'bg-gray-200'
                                    }`}
                                >
                                    {msg.type === 'user' ? (
                                        <UserIcon className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <ChatBubbleLeftIcon className="w-5 h-5 text-gray-600" />
                                    )}
                                </div>
                                <div
                                    className={`px-4 py-2 ${
                                        msg.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-200'
                                    }`}
                                    style={{ borderRadius: '4px' }}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    {msg.metadata?.type === 'buttons' && (
                                        <div className="mt-2 space-y-1">
                                            {msg.metadata.buttons.map((btn: string, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs text-center"
                                                    style={{ borderRadius: '4px' }}
                                                >
                                                    {btn}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    {!isRunning ? (
                        <button
                            onClick={handleStart}
                            className="w-full px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            style={{ borderRadius: '4px' }}
                        >
                            <PlayIcon className="w-5 h-5" />
                            Iniciar Simulação
                        </button>
                    ) : isWaitingResponse ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite sua resposta..."
                                className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                                autoFocus
                            />
                            <button
                                onClick={handleSendMessage}
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                style={{ borderRadius: '4px' }}
                            >
                                Enviar
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 text-sm">Aguardando resposta do bot...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
