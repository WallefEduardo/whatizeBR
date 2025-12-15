import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CodeBracketIcon } from '@heroicons/react/24/solid';

export default function ConditionNode({ data, selected }: NodeProps) {
    const variable = data.variable || 'variável';
    const operator = data.operator || '==';
    const value = data.value || 'valor';

    const operatorLabels: Record<string, string> = {
        '==': '=',
        '!=': '≠',
        '>': '>',
        '>=': '≥',
        '<': '<',
        '<=': '≤',
        'contains': 'contém',
        'starts_with': 'começa com',
        'ends_with': 'termina com',
    };

    return (
        <div
            className={`px-4 py-3 bg-orange-50 border-2 ${
                selected ? 'border-orange-500' : 'border-orange-300'
            } min-w-[180px]`}
            style={{ borderRadius: '4px' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-orange-500" />

            <div className="flex items-start gap-2">
                <CodeBracketIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="text-xs font-medium text-orange-900 uppercase tracking-wide">Condição</div>
                    <div className="text-xs text-orange-700 mt-1 font-mono">
                        {variable} {operatorLabels[operator] || operator} {value}
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="true"
                className="!bg-green-500"
                style={{ top: '40%' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="false"
                className="!bg-red-500"
                style={{ top: '60%' }}
            />
        </div>
    );
}
