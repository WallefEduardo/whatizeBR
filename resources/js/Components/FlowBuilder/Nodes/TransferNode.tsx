import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArrowRightCircleIcon } from '@heroicons/react/24/solid';

export default function TransferNode({ data, selected }: NodeProps) {
    const message = data.message || 'Transferindo para atendente...';

    return (
        <div
            className={`px-4 py-3 bg-teal-50 border-2 ${
                selected ? 'border-teal-500' : 'border-teal-300'
            } min-w-[180px]`}
            style={{ borderRadius: '4px' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-teal-500" />

            <div className="flex items-start gap-2">
                <ArrowRightCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="text-xs font-medium text-teal-900 uppercase tracking-wide">Transferir</div>
                    <div className="text-xs text-teal-700 mt-1">
                        {message.length > 40 ? message.substring(0, 40) + '...' : message}
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-teal-500" />
        </div>
    );
}
