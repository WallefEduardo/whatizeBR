import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface NodeEditorProps {
    node: Node;
    onUpdateNode: (nodeId: string, data: any) => void;
    onDeleteNode: (nodeId: string) => void;
    onClose: () => void;
}

export default function NodeEditor({ node, onUpdateNode, onDeleteNode, onClose }: NodeEditorProps) {
    const [formData, setFormData] = useState(node.data);

    useEffect(() => {
        setFormData(node.data);
    }, [node]);

    const handleChange = (field: string, value: any) => {
        const updatedData = { ...formData, [field]: value };
        setFormData(updatedData);
        onUpdateNode(node.id, updatedData);
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este nó?')) {
            onDeleteNode(node.id);
        }
    };

    const renderFields = () => {
        switch (node.type) {
            case 'start':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Rótulo
                        </label>
                        <input
                            type="text"
                            value={formData.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderRadius: '4px' }}
                        />
                    </div>
                );

            case 'text':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mensagem
                            </label>
                            <textarea
                                value={formData.message || ''}
                                onChange={(e) => handleChange('message', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                                placeholder="Digite a mensagem... Use {{variavel}} para variáveis"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="wait_for_response"
                                checked={formData.wait_for_response || false}
                                onChange={(e) => handleChange('wait_for_response', e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="wait_for_response" className="text-sm text-gray-300">
                                Aguardar resposta do usuário
                            </label>
                        </div>
                        {formData.wait_for_response && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Salvar resposta na variável
                                </label>
                                <input
                                    type="text"
                                    value={formData.variable_name || ''}
                                    onChange={(e) => handleChange('variable_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderRadius: '4px' }}
                                    placeholder="nome_da_variavel"
                                />
                            </div>
                        )}
                    </>
                );

            case 'button':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mensagem
                            </label>
                            <textarea
                                value={formData.message || ''}
                                onChange={(e) => handleChange('message', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Botões (um por linha)
                            </label>
                            <textarea
                                value={(formData.buttons || []).join('\n')}
                                onChange={(e) => handleChange('buttons', e.target.value.split('\n').filter(Boolean))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                                placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                            />
                        </div>
                    </>
                );

            case 'list':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mensagem
                            </label>
                            <textarea
                                value={formData.message || ''}
                                onChange={(e) => handleChange('message', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Título do botão
                            </label>
                            <input
                                type="text"
                                value={formData.title || 'Opções'}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            />
                        </div>
                    </>
                );

            case 'media':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tipo de mídia
                            </label>
                            <select
                                value={formData.media_type || 'image'}
                                onChange={(e) => handleChange('media_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            >
                                <option value="image">Imagem</option>
                                <option value="video">Vídeo</option>
                                <option value="audio">Áudio</option>
                                <option value="document">Documento</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                URL da mídia
                            </label>
                            <input
                                type="text"
                                value={formData.media_url || ''}
                                onChange={(e) => handleChange('media_url', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Legenda (opcional)
                            </label>
                            <textarea
                                value={formData.caption || ''}
                                onChange={(e) => handleChange('caption', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            />
                        </div>
                    </>
                );

            case 'delay':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tempo de espera (segundos)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.delay_seconds || 1}
                            onChange={(e) => handleChange('delay_seconds', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderRadius: '4px' }}
                        />
                    </div>
                );

            case 'condition':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Variável
                            </label>
                            <input
                                type="text"
                                value={formData.variable || ''}
                                onChange={(e) => handleChange('variable', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                                placeholder="nome_variavel"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Operador
                            </label>
                            <select
                                value={formData.operator || '=='}
                                onChange={(e) => handleChange('operator', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            >
                                <option value="==">Igual a (==)</option>
                                <option value="!=">Diferente de (!=)</option>
                                <option value=">">Maior que (&gt;)</option>
                                <option value=">=">Maior ou igual (&gt;=)</option>
                                <option value="<">Menor que (&lt;)</option>
                                <option value="<=">Menor ou igual (&lt;=)</option>
                                <option value="contains">Contém</option>
                                <option value="starts_with">Começa com</option>
                                <option value="ends_with">Termina com</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Valor
                            </label>
                            <input
                                type="text"
                                value={formData.value || ''}
                                onChange={(e) => handleChange('value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            />
                        </div>
                    </>
                );

            case 'api':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                URL
                            </label>
                            <input
                                type="text"
                                value={formData.url || ''}
                                onChange={(e) => handleChange('url', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                                placeholder="https://api.exemplo.com/webhook"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Método
                            </label>
                            <select
                                value={formData.method || 'POST'}
                                onChange={(e) => handleChange('method', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="PATCH">PATCH</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Salvar resposta em
                            </label>
                            <input
                                type="text"
                                value={formData.response_variable || 'api_response'}
                                onChange={(e) => handleChange('response_variable', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            />
                        </div>
                    </>
                );

            case 'transfer':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mensagem
                            </label>
                            <textarea
                                value={formData.message || 'Transferindo para um atendente...'}
                                onChange={(e) => handleChange('message', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Departamento (opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.department_id || ''}
                                onChange={(e) => handleChange('department_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderRadius: '4px' }}
                                placeholder="ID do departamento"
                            />
                        </div>
                    </>
                );

            case 'end':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Mensagem final (opcional)
                        </label>
                        <textarea
                            value={formData.message || ''}
                            onChange={(e) => handleChange('message', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderRadius: '4px' }}
                            placeholder="Obrigado pelo contato!"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-100">Editar Nó</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    style={{ borderRadius: '4px' }}
                >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
                <div className="mb-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tipo</div>
                    <div className="text-sm font-medium text-gray-100 capitalize">{node.type}</div>
                </div>

                {renderFields()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleDelete}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
                    style={{ borderRadius: '4px' }}
                >
                    <TrashIcon className="w-4 h-4" />
                    Excluir Nó
                </button>
            </div>
        </div>
    );
}
