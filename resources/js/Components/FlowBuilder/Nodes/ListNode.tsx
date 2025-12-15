import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ListBulletIcon } from '@heroicons/react/24/solid';

export default function ListNode({ data, selected }: NodeProps) {
    const title = data.title || 'Opções';

    return (
        <div
            className={`px-4 py-3 bg-indigo-50 border-2 ${
                selected ? 'border-indigo-500' : 'border-indigo-300'
            } min-w-[180px]`}
            style={{ borderRadius: '4px' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-indigo-500" />

            <div className="flex items-start gap-2">
                <ListBulletIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="text-xs font-medium text-indigo-900 uppercase tracking-wide">Lista</div>
                    {data.message && (
                        <div className="text-xs text-indigo-700 mt-1">
                            {data.message.length > 30 ? data.message.substring(0, 30) + '...' : data.message}
                        </div>
                    )}
                    <div className="text-xs text-indigo-500 mt-1">{title}</div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
        </div>
    );
}
