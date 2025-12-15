import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import FlowBuilder from '@/Components/FlowBuilder/FlowBuilder';
import { Node, Edge } from '@xyflow/react';

interface ChatbotFlow {
    id: string;
    chatbot_id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
    start_node_id: string | null;
}

interface Chatbot {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
}

interface Props {
    auth: any;
    chatbot: Chatbot;
    flow?: ChatbotFlow;
}

export default function Builder({ auth, chatbot, flow }: Props) {
    const [saving, setSaving] = useState(false);

    const initialNodes: Node[] = flow?.nodes || [
        {
            id: 'node-start-1',
            type: 'start',
            position: { x: 250, y: 50 },
            data: { label: 'Início' },
        },
    ];

    const initialEdges: Edge[] = flow?.edges || [];

    const handleSave = (nodes: Node[], edges: Edge[]) => {
        setSaving(true);

        const flowData = {
            chatbot_id: chatbot.id,
            name: flow?.name || 'Fluxo Principal',
            nodes,
            edges,
            start_node_id: nodes.find((n) => n.type === 'start')?.id || null,
            variables: {
                contact_name: '',
                contact_phone: '',
                contact_email: '',
            },
        };

        if (flow?.id) {
            // Update existing flow
            router.put(route('chatbot-flows.update', flow.id), flowData, {
                onSuccess: () => {
                    setSaving(false);
                    alert('Fluxo salvo com sucesso!');
                },
                onError: (errors) => {
                    setSaving(false);
                    console.error('Erro ao salvar fluxo:', errors);
                    alert('Erro ao salvar fluxo. Verifique o console para mais detalhes.');
                },
            });
        } else {
            // Create new flow
            router.post(route('chatbot-flows.store'), flowData, {
                onSuccess: () => {
                    setSaving(false);
                    alert('Fluxo criado com sucesso!');
                },
                onError: (errors) => {
                    setSaving(false);
                    console.error('Erro ao criar fluxo:', errors);
                    alert('Erro ao criar fluxo. Verifique o console para mais detalhes.');
                },
            });
        }
    };

    return (
        <>
            <Head title={`Editor de Fluxo - ${chatbot.name}`} />

            <FlowBuilder
                initialNodes={initialNodes}
                initialEdges={initialEdges}
                onSave={handleSave}
            />

            {saving && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white px-6 py-4" style={{ borderRadius: '4px' }}>
                        <p className="text-gray-900">Salvando fluxo...</p>
                    </div>
                </div>
            )}
        </>
    );
}
