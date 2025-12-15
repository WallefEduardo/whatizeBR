import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { StopIcon } from '@heroicons/react/24/solid';

export default function EndNode({ data, selected }: NodeProps) {
    return (
        <div
            className={`px-4 py-3 bg-red-50 border-2 ${
                selected ? 'border-red-500' : 'border-red-300'
            } min-w-[160px]`}
            style={{ borderRadius: '4px' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-red-500" />

            <div className="flex items-center gap-2">
                <StopIcon className="w-5 h-5 text-red-600" />
                <div>
                    <div className="text-xs font-medium text-red-900 uppercase tracking-wide">Fim</div>
                    {data.message && (
                        <div className="text-xs text-red-700 mt-1">
                            {data.message.length > 30 ? data.message.substring(0, 30) + '...' : data.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
