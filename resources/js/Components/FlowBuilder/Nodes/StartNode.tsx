import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PlayIcon } from '@heroicons/react/24/solid';

export default function StartNode({ data, selected }: NodeProps) {
    return (
        <div
            className={`px-4 py-3 bg-green-50 border-2 ${
                selected ? 'border-green-500' : 'border-green-300'
            } min-w-[160px]`}
            style={{ borderRadius: '4px' }}
        >
            <div className="flex items-center gap-2">
                <PlayIcon className="w-5 h-5 text-green-600" />
                <div>
                    <div className="text-xs font-medium text-green-900 uppercase tracking-wide">Início</div>
                    <div className="text-xs text-green-600 mt-0.5">{data.label || 'Ponto de entrada'}</div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
        </div>
    );
}
