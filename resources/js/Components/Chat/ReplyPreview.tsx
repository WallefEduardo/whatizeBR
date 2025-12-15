import { X, Reply } from 'lucide-react'

interface Message {
    id: string
    content: string
    type: string
    direction: 'inbound' | 'outbound'
    media_url?: string
}

interface ReplyPreviewProps {
    message: Message
    onCancel: () => void
}

export default function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
    const getPreviewContent = () => {
        if (message.type === 'text') {
            return message.content
        } else if (message.type === 'image') {
            return '📷 Imagem'
        } else if (message.type === 'video') {
            return '🎥 Vídeo'
        } else if (message.type === 'audio') {
            return '🎵 Áudio'
        } else if (message.type === 'document') {
            return '📄 Documento'
        } else if (message.type === 'location') {
            return '📍 Localização'
        } else if (message.type === 'contact') {
            return '👤 Contato'
        }
        return message.content
    }

    return (
        <div className="px-4 py-2 bg-dark-50 dark:bg-dark-900 border-t border-dark-200 dark:border-dark-700">
            <div className="flex items-start gap-3">
                {/* Reply indicator */}
                <div className="flex-shrink-0 pt-1">
                    <Reply className="w-4 h-4 text-primary-500" />
                </div>

                {/* Message preview */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
                        Respondendo {message.direction === 'inbound' ? 'ao contato' : 'a você mesmo'}
                    </p>
                    <div className="flex items-center gap-2">
                        {/* Thumbnail for media */}
                        {message.media_url && message.type === 'image' && (
                            <img
                                src={message.media_url}
                                alt="Preview"
                                className="w-10 h-10 rounded object-cover"
                            />
                        )}
                        <p className="text-sm text-dark-900 dark:text-dark-50 line-clamp-1">
                            {getPreviewContent()}
                        </p>
                    </div>
                </div>

                {/* Cancel button */}
                <button
                    onClick={onCancel}
                    className="flex-shrink-0 p-1 rounded hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
                >
                    <X className="w-4 h-4 text-dark-500" />
                </button>
            </div>
        </div>
    )
}
