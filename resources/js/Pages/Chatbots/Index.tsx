import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CodeBracketIcon,
    PowerIcon,
} from '@heroicons/react/24/outline';

interface Chatbot {
    id: string;
    name: string;
    description: string | null;
    trigger_type: 'keyword' | 'always' | 'business_hours' | 'custom';
    trigger_value: string | null;
    instance_id: string | null;
    is_active: boolean;
    priority: number;
    flows_count: number;
    sessions_count: number;
}

interface WhatsAppInstance {
    id: string;
    name: string;
}

interface Props {
    auth: any;
    chatbots: Chatbot[];
    instances: WhatsAppInstance[];
}

export default function Index({ auth, chatbots, instances }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);

    const handleCreate = () => {
        setEditingChatbot(null);
        setShowModal(true);
    };

    const handleEdit = (chatbot: Chatbot) => {
        setEditingChatbot(chatbot);
        setShowModal(true);
    };

    const handleToggle = (chatbot: Chatbot) => {
        router.post(route('chatbots.toggle', chatbot.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (chatbot: Chatbot) => {
        if (confirm(`Tem certeza que deseja excluir o chatbot "${chatbot.name}"?`)) {
            router.delete(route('chatbots.destroy', chatbot.id));
        }
    };

    const handleOpenBuilder = (chatbot: Chatbot) => {
        router.get(route('chatbots.builder', chatbot.id));
    };

    const triggerTypeLabels: Record<string, string> = {
        keyword: 'Palavra-chave',
        always: 'Sempre',
        business_hours: 'Fora do expediente',
        custom: 'Personalizado',
    };

    return (
        <AppLayout title="Chatbots">
            <Head title="Chatbots" />

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Chatbots
                </h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    style={{ borderRadius: '4px' }}
                >
                    <PlusIcon className="w-5 h-5" />
                    Novo Chatbot
                </button>
            </div>

            <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800" style={{ borderRadius: '4px' }}>
                        {chatbots.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Nenhum chatbot criado ainda.
                                </p>
                                <button
                                    onClick={handleCreate}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    style={{ borderRadius: '4px' }}
                                >
                                    Criar primeiro chatbot
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Nome
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Gatilho
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Instância
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Prioridade
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Fluxos
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {chatbots.map((chatbot) => (
                                            <tr
                                                key={chatbot.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {chatbot.name}
                                                        </div>
                                                        {chatbot.description && (
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {chatbot.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                                        {triggerTypeLabels[chatbot.trigger_type]}
                                                    </div>
                                                    {chatbot.trigger_value && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {chatbot.trigger_value}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {chatbot.instance_id ? (
                                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" style={{ borderRadius: '4px' }}>
                                                            Conectado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" style={{ borderRadius: '4px' }}>
                                                            Sem instância
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                    {chatbot.priority}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                    {chatbot.flows_count}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleToggle(chatbot)}
                                                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${
                                                            chatbot.is_active
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}
                                                        style={{ borderRadius: '4px' }}
                                                    >
                                                        <PowerIcon className="w-3 h-3" />
                                                        {chatbot.is_active ? 'Ativo' : 'Inativo'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenBuilder(chatbot)}
                                                            className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            title="Editar fluxo"
                                                        >
                                                            <CodeBracketIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(chatbot)}
                                                            className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                                            title="Editar"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(chatbot)}
                                                            className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Excluir"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
            </div>

            {showModal && (
                <ChatbotModal
                    chatbot={editingChatbot}
                    instances={instances}
                    onClose={() => setShowModal(false)}
                />
            )}
        </AppLayout>
    );
}

interface ChatbotModalProps {
    chatbot: Chatbot | null;
    instances: WhatsAppInstance[];
    onClose: () => void;
}

function ChatbotModal({ chatbot, instances, onClose }: ChatbotModalProps) {
    const [formData, setFormData] = useState({
        name: chatbot?.name || '',
        description: chatbot?.description || '',
        trigger_type: chatbot?.trigger_type || 'keyword',
        trigger_value: chatbot?.trigger_value || '',
        instance_id: chatbot?.instance_id || '',
        priority: chatbot?.priority || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('🔵 Submitting chatbot:', formData);

        if (chatbot) {
            console.log('🔵 Updating chatbot:', chatbot.id);
            router.put(route('chatbots.update', chatbot.id), formData, {
                onSuccess: () => {
                    console.log('✅ Update success');
                    onClose();
                },
                onError: (errors) => {
                    console.error('❌ Update error:', errors);
                },
            });
        } else {
            console.log('🔵 Creating new chatbot');
            router.post(route('chatbots.store'), formData, {
                onSuccess: () => {
                    console.log('✅ Create success');
                    onClose();
                },
                onError: (errors) => {
                    console.error('❌ Create error:', errors);
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg" style={{ borderRadius: '4px' }}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {chatbot ? 'Editar Chatbot' : 'Novo Chatbot'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nome
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderRadius: '4px' }}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderRadius: '4px' }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Gatilho
                        </label>
                        <select
                            value={formData.trigger_type}
                            onChange={(e) =>
                                setFormData({ ...formData, trigger_type: e.target.value as any })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderRadius: '4px' }}
                        >
                            <option value="keyword">Palavra-chave</option>
                            <option value="always">Sempre</option>
                            <option value="business_hours">Fora do expediente</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>

                    {formData.trigger_type === 'keyword' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Palavra-chave
                            </label>
                            <input
                                type="text"
                                value={formData.trigger_value}
                                onChange={(e) =>
                                    setFormData({ ...formData, trigger_value: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                                placeholder="Ex: ajuda, suporte, etc"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Instância do WhatsApp
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Opcional)</span>
                        </label>
                        <select
                            value={formData.instance_id}
                            onChange={(e) =>
                                setFormData({ ...formData, instance_id: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderRadius: '4px' }}
                        >
                            <option value="">Sem instância (conectar depois)</option>
                            {instances.map((instance) => (
                                <option key={instance.id} value={instance.id}>
                                    {instance.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            O chatbot precisa estar conectado a uma instância para ser ativado
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Prioridade
                        </label>
                        <input
                            type="number"
                            value={formData.priority}
                            onChange={(e) =>
                                setFormData({ ...formData, priority: parseInt(e.target.value) })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderRadius: '4px' }}
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            style={{ borderRadius: '4px' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            style={{ borderRadius: '4px' }}
                        >
                            {chatbot ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
