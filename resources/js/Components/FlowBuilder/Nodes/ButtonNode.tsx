import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { RectangleStackIcon } from '@heroicons/react/24/solid';

export default function ButtonNode({ data, selected }: NodeProps) {
    const buttons = data.buttons || [];
    const buttonCount = buttons.length;

    return (
        <div
            className={`px-4 py-3 bg-purple-50 border-2 ${
                selected ? 'border-purple-500' : 'border-purple-300'
            } min-w-[180px]`}
            style={{ borderRadius: '4px' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-purple-500" />

            <div className="flex items-start gap-2">
                <RectangleStackIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="text-xs font-medium text-purple-900 uppercase tracking-wide">Botões</div>
                    {data.message && (
                        <div className="text-xs text-purple-700 mt-1">
                            {data.message.length > 30 ? data.message.substring(0, 30) + '...' : data.message}
                        </div>
                    )}
                    <div className="text-xs text-purple-500 mt-1">
                        {buttonCount} {buttonCount === 1 ? 'botão' : 'botões'}
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
        </div>
    );
}
