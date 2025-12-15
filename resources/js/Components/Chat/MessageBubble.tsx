import { Reply, Download, MapPin, Phone, FileText, Film, Music, Image as ImageIcon } from 'lucide-react'

interface Message {
    id: string
    content: string
    type: string
    direction: 'inbound' | 'outbound'
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
    created_at: string
    media_url?: string
    media_type?: string
    caption?: string
    latitude?: number
    longitude?: number
    replied_to_message?: Message
    metadata?: any
}

interface MessageBubbleProps {
    message: Message
    onReply?: (message: Message) => void
    formatTime: (time: string) => string
    getStatusCheckmarks: (status: string) => React.ReactNode
}

export default function MessageBubble({
    message,
    onReply,
    formatTime,
    getStatusCheckmarks,
}: MessageBubbleProps) {
    const isOutbound = message.direction === 'outbound'

    const bubbleClasses = isOutbound
        ? 'bg-primary-500 text-white rounded-br-none'
        : 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-none border border-dark-200 dark:border-dark-700'

    const renderContent = () => {
        switch (message.type) {
            case 'text':
                return (
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )

            case 'image':
                return (
                    <div>
                        <img
                            src={message.media_url}
                            alt="Imagem"
                            className="rounded mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.media_url, '_blank')}
                        />
                        {message.caption && (
                            <p className="text-sm whitespace-pre-wrap break-words">
                                {message.caption}
                            </p>
                        )}
                    </div>
                )

            case 'video':
                return (
                    <div>
                        <div className="relative rounded overflow-hidden mb-2">
                            <video
                                src={message.media_url}
                                controls
                                className="w-full max-w-sm rounded"
                            />
                        </div>
                        {message.caption && (
                            <p className="text-sm whitespace-pre-wrap break-words">
                                {message.caption}
                            </p>
                        )}
                    </div>
                )

            case 'audio':
                return (
                    <div className="flex items-center gap-3 min-w-[250px]">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Music className={`w-5 h-5 ${isOutbound ? 'text-white' : 'text-primary-500'}`} />
                        </div>
                        <div className="flex-1">
                            <audio src={message.media_url} controls className="w-full" />
                        </div>
                    </div>
                )

            case 'document':
                return (
                    <a
                        href={message.media_url}
                        download
                        className="flex items-center gap-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-900/50 hover:bg-dark-100 dark:hover:bg-dark-900 transition-colors min-w-[250px]"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isOutbound ? 'text-white' : 'text-dark-900 dark:text-dark-50'}`}>
                                {message.content || 'Documento'}
                            </p>
                            <p className={`text-xs ${isOutbound ? 'text-white/70' : 'text-dark-500'}`}>
                                {message.media_type || 'Arquivo'}
                            </p>
                        </div>
                        <Download className={`w-4 h-4 flex-shrink-0 ${isOutbound ? 'text-white/70' : 'text-dark-500'}`} />
                    </a>
                )

            case 'location':
                return (
                    <div className="min-w-[250px]">
                        <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-dark-100 dark:bg-dark-900">
                            {message.latitude && message.longitude ? (
                                <a
                                    href={`https://www.google.com/maps?q=${message.latitude},${message.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full h-full"
                                >
                                    <img
                                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+22c55e(${message.longitude},${message.latitude})/${message.longitude},${message.latitude},15,0/400x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`}
                                        alt="Localização"
                                        className="w-full h-full object-cover"
                                    />
                                </a>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <MapPin className={`w-12 h-12 ${isOutbound ? 'text-white/50' : 'text-dark-400'}`} />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 ${isOutbound ? 'text-white/70' : 'text-dark-500'}`} />
                            <p className="text-sm">
                                {message.content || 'Localização compartilhada'}
                            </p>
                        </div>
                    </div>
                )

            case 'contact':
                return (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-900/50 min-w-[250px]">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Phone className={`w-6 h-6 ${isOutbound ? 'text-white' : 'text-primary-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isOutbound ? 'text-white' : 'text-dark-900 dark:text-dark-50'}`}>
                                {message.metadata?.name || 'Contato'}
                            </p>
                            <p className={`text-xs ${isOutbound ? 'text-white/70' : 'text-dark-500'}`}>
                                {message.metadata?.phone || message.content}
                            </p>
                        </div>
                    </div>
                )

            case 'button':
                return (
                    <div>
                        <p className="text-sm whitespace-pre-wrap break-words mb-3">
                            {message.content}
                        </p>
                        <div className="space-y-2">
                            {message.metadata?.buttons?.map((button: any, index: number) => (
                                <button
                                    key={index}
                                    className={`w-full px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                        isOutbound
                                            ? 'border-white/30 hover:bg-white/10'
                                            : 'border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                    }`}
                                >
                                    {button.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )

            case 'list':
                return (
                    <div>
                        <p className="text-sm whitespace-pre-wrap break-words mb-2">
                            {message.content}
                        </p>
                        {message.metadata?.title && (
                            <p className={`text-xs font-medium mb-2 ${isOutbound ? 'text-white/70' : 'text-dark-500'}`}>
                                {message.metadata.title}
                            </p>
                        )}
                        <button
                            className={`w-full px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                isOutbound
                                    ? 'border-white/30 hover:bg-white/10'
                                    : 'border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                            }`}
                        >
                            {message.metadata?.button_text || 'Ver opções'}
                        </button>
                    </div>
                )

            case 'sticker':
                return (
                    <div className="bg-transparent p-0">
                        <img
                            src={message.media_url}
                            alt="Sticker"
                            className="w-32 h-32 object-contain"
                        />
                    </div>
                )

            case 'reaction':
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{message.content}</span>
                        <p className="text-xs text-dark-500">Reagiu à mensagem</p>
                    </div>
                )

            default:
                return (
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )
        }
    }

    return (
        <div className="group">
            {/* Replied message preview */}
            {message.replied_to_message && (
                <div className={`mb-2 ${isOutbound ? 'text-right' : 'text-left'}`}>
                    <div
                        className={`inline-block px-3 py-2 rounded-lg text-xs ${
                            isOutbound
                                ? 'bg-primary-600 text-white/70'
                                : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Reply className="w-3 h-3" />
                            <span className="font-medium">
                                {message.replied_to_message.direction === 'inbound' ? 'Contato' : 'Você'}
                            </span>
                        </div>
                        <p className="line-clamp-2">
                            {message.replied_to_message.type === 'text'
                                ? message.replied_to_message.content
                                : `${message.replied_to_message.type.charAt(0).toUpperCase() + message.replied_to_message.type.slice(1)}`}
                        </p>
                    </div>
                </div>
            )}

            {/* Main message */}
            <div className={`max-w-md px-4 py-2 rounded-lg ${bubbleClasses} ${message.type === 'sticker' ? 'bg-transparent p-0 border-0' : ''}`}>
                {renderContent()}

                {/* Timestamp and status */}
                {message.type !== 'sticker' && (
                    <div
                        className={`flex items-center justify-end gap-1 mt-1 ${
                            isOutbound ? 'text-white/70' : 'text-dark-500'
                        }`}
                    >
                        <span className="text-xs">{formatTime(message.created_at)}</span>
                        {isOutbound && (
                            <div className="flex-shrink-0">{getStatusCheckmarks(message.status)}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Reply button (shown on hover) */}
            {onReply && (
                <button
                    onClick={() => onReply(message)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-xs text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 flex items-center gap-1 ${
                        isOutbound ? 'ml-auto' : 'mr-auto'
                    }`}
                >
                    <Reply className="w-3 h-3" />
                    Responder
                </button>
            )}
        </div>
    )
}
