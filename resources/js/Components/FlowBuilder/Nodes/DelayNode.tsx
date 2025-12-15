import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ClockIcon } from '@heroicons/react/24/solid';

export default function DelayNode({ data, selected }: NodeProps) {
    const seconds = data.delay_seconds || 1;

    return (
        <div
            className={`px-4 py-3 bg-yellow-50 border-2 ${
                selected ? 'border-yellow-500' : 'border-yellow-300'
            } min-w-[160px]`}
            style={{ borderRadius: '4px' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-yellow-500" />

            <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
                <div>
                    <div className="text-xs font-medium text-yellow-900 uppercase tracking-wide">Delay</div>
                    <div className="text-xs text-yellow-700 mt-1">
                        {seconds} {seconds === 1 ? 'segundo' : 'segundos'}
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />
        </div>
    );
}
