import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CloudIcon } from '@heroicons/react/24/solid';

export default function ApiNode({ data, selected }: NodeProps) {
    const method = data.method || 'POST';
    const url = data.url || 'URL não definida';
    const truncatedUrl = url.length > 30 ? url.substring(0, 30) + '...' : url;

    return (
        <div
            className={`px-4 py-3 bg-cyan-50 border-2 ${
                selected ? 'border-cyan-500' : 'border-cyan-300'
            } min-w-[180px] max-w-[250px]`}
            style={{ borderRadius: '4px' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-cyan-500" />

            <div className="flex items-start gap-2">
                <CloudIcon className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-cyan-900 uppercase tracking-wide">API Webhook</div>
                    <div className="text-xs text-cyan-700 mt-1">
                        <span className="font-semibold">{method}</span>
                    </div>
                    <div className="text-xs text-cyan-600 mt-1 break-all">{truncatedUrl}</div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-cyan-500" />
        </div>
    );
}
