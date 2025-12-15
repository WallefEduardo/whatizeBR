import { FileText, Image, Video, File } from 'lucide-react';

interface MessagePreviewProps {
    type: 'text' | 'image' | 'video' | 'document';
    content: string;
    mediaUrl?: string;
}

export default function MessagePreview({ type, content, mediaUrl }: MessagePreviewProps) {
    return (
        <div className="bg-dark-50 dark:bg-dark-900 rounded border border-dark-200 dark:border-dark-700 p-4">
            <div className="max-w-md">
                {/* WhatsApp Message Bubble Style */}
                <div className="bg-primary-100 dark:bg-primary-900/20 rounded-lg p-3 relative">
                    {/* Media Preview */}
                    {type !== 'text' && mediaUrl && (
                        <div className="mb-2">
                            {type === 'image' && (
                                <div className="relative rounded overflow-hidden bg-dark-200 dark:bg-dark-700">
                                    <img
                                        src={mediaUrl}
                                        alt="Preview"
                                        className="w-full h-auto max-h-64 object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                    <div className="hidden flex items-center justify-center h-32">
                                        <div className="text-center text-dark-500">
                                            <Image className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-xs">Falha ao carregar imagem</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {type === 'video' && (
                                <div className="relative rounded overflow-hidden bg-dark-200 dark:bg-dark-700">
                                    <video
                                        src={mediaUrl}
                                        controls
                                        className="w-full h-auto max-h-64"
                                        onError={(e) => {
                                            const target = e.target as HTMLVideoElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                    <div className="hidden flex items-center justify-center h-32">
                                        <div className="text-center text-dark-500">
                                            <Video className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-xs">Falha ao carregar vídeo</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {type === 'document' && (
                                <div className="flex items-center gap-3 p-3 bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700">
                                    <div className="flex-shrink-0">
                                        <File className="w-8 h-8 text-primary-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                                            {mediaUrl.split('/').pop() || 'Documento'}
                                        </p>
                                        <p className="text-xs text-dark-500">Documento</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Text Content */}
                    {content && (
                        <div className="text-sm text-dark-900 dark:text-dark-50 whitespace-pre-wrap break-words">
                            {content}
                        </div>
                    )}

                    {/* Time Indicator (decorative) */}
                    <div className="flex justify-end items-center gap-1 mt-1">
                        <span className="text-xs text-dark-500">
                            {new Date().toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>

                    {/* WhatsApp Bubble Tail */}
                    <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-primary-100 dark:border-t-primary-900/20" />
                </div>

                {/* Info */}
                <p className="text-xs text-dark-500 mt-3 text-center">
                    Preview de como a mensagem será enviada
                </p>
            </div>
        </div>
    );
}
