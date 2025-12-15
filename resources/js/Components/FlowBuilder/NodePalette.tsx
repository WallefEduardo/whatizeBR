import React from 'react';
import {
    PlayIcon,
    ChatBubbleLeftIcon,
    RectangleStackIcon,
    ListBulletIcon,
    PhotoIcon,
    ClockIcon,
    CodeBracketIcon,
    CloudIcon,
    ArrowRightCircleIcon,
    StopIcon,
} from '@heroicons/react/24/outline';

interface NodePaletteProps {
    onAddNode: (type: string) => void;
}

const nodeDefinitions = [
    { type: 'start', label: 'Início', icon: PlayIcon, description: 'Ponto de entrada do fluxo' },
    { type: 'text', label: 'Texto', icon: ChatBubbleLeftIcon, description: 'Enviar mensagem de texto' },
    { type: 'button', label: 'Botões', icon: RectangleStackIcon, description: 'Botões de escolha' },
    { type: 'list', label: 'Lista', icon: ListBulletIcon, description: 'Lista de opções' },
    { type: 'media', label: 'Mídia', icon: PhotoIcon, description: 'Enviar imagem/vídeo/áudio' },
    { type: 'delay', label: 'Delay', icon: ClockIcon, description: 'Aguardar tempo' },
    { type: 'condition', label: 'Condição', icon: CodeBracketIcon, description: 'Avaliar condição if/else' },
    { type: 'api', label: 'API', icon: CloudIcon, description: 'Chamar webhook externo' },
    { type: 'transfer', label: 'Transferir', icon: ArrowRightCircleIcon, description: 'Transferir para atendente' },
    { type: 'end', label: 'Fim', icon: StopIcon, description: 'Finalizar atendimento' },
];

export default function NodePalette({ onAddNode }: NodePaletteProps) {
    return (
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-gray-100">Nós Disponíveis</h2>
                <p className="text-sm text-gray-400 mt-1">Clique para adicionar ao fluxo</p>
            </div>

            <div className="p-3 space-y-2">
                {nodeDefinitions.map((nodeDef) => (
                    <button
                        key={nodeDef.type}
                        onClick={() => onAddNode(nodeDef.type)}
                        className="w-full flex items-start gap-3 p-3 bg-gray-750 border border-gray-700 hover:border-blue-500 hover:bg-gray-700 transition-all group"
                        style={{ borderRadius: '4px' }}
                    >
                        <nodeDef.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 text-left">
                            <div className="font-medium text-gray-100 text-sm">{nodeDef.label}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{nodeDef.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
