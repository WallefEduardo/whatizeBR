import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid';

export default function TextNode({ data, selected }: NodeProps) {
    const message = data.message || 'Mensagem de texto';
    const truncated = message.length > 40 ? message.substring(0, 40) + '...' : message;

    return (
        <div
            className={`px-4 py-3 bg-blue-50 border-2 ${
                selected ? 'border-blue-500' : 'border-blue-300'
            } min-w-[180px] max-w-[250px]`}
            style={{ borderRadius: '4px' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-blue-500" />

            <div className="flex items-start gap-2">
                <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-blue-900 uppercase tracking-wide">Texto</div>
                    <div className="text-xs text-blue-700 mt-1 break-words">{truncated}</div>
                    {data.wait_for_response && (
                        <div className="text-xs text-blue-500 mt-1 italic">Aguarda resposta</div>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
        </div>
    );
}
