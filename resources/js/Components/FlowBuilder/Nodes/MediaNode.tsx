import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PhotoIcon } from '@heroicons/react/24/solid';

export default function MediaNode({ data, selected }: NodeProps) {
    const mediaType = data.media_type || 'image';
    const mediaTypeLabels: Record<string, string> = {
        image: 'Imagem',
        video: 'Vídeo',
        audio: 'Áudio',
        document: 'Documento',
    };

    return (
        <div
            className={`px-4 py-3 bg-pink-50 border-2 ${
                selected ? 'border-pink-500' : 'border-pink-300'
            } min-w-[180px]`}
            style={{ borderRadius: '4px' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-pink-500" />

            <div className="flex items-start gap-2">
                <PhotoIcon className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="text-xs font-medium text-pink-900 uppercase tracking-wide">Mídia</div>
                    <div className="text-xs text-pink-700 mt-1">{mediaTypeLabels[mediaType]}</div>
                    {data.caption && (
                        <div className="text-xs text-pink-600 mt-1 italic">
                            {data.caption.length > 30 ? data.caption.substring(0, 30) + '...' : data.caption}
                        </div>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-pink-500" />
        </div>
    );
}
