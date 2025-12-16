import { useEffect, useRef } from 'react'
import { VariableSizeList } from 'react-window'

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
}

interface Props {
    messages: Message[]
    formatMessageTime: (dateString: string) => string
    getStatusCheckmarks: (status: string) => React.ReactNode
    containerHeight?: number
}

export default function VirtualizedMessageList({
    messages,
    formatMessageTime,
    getStatusCheckmarks,
    containerHeight = window.innerHeight - 220,
}: Props) {
    const listRef = useRef<VariableSizeList>(null)
    const rowHeights = useRef<{ [key: number]: number }>({})

    // Auto-scroll to bottom on mount and when messages change
    useEffect(() => {
        if (listRef.current && messages.length > 0) {
            listRef.current.scrollToItem(messages.length - 1, 'end')
        }
    }, [messages.length])

    const getRowHeight = (index: number) => {
        return rowHeights.current[index] || 100 // Default height
    }

    const setRowHeight = (index: number, size: number) => {
        listRef.current?.resetAfterIndex(0)
        rowHeights.current = { ...rowHeights.current, [index]: size }
    }

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const message = messages[index]
        const isOutbound = message.direction === 'outbound'
        const rowRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            if (rowRef.current) {
                setRowHeight(index, rowRef.current.getBoundingClientRect().height)
            }
        }, [index])

        return (
            <div style={style}>
                <div
                    ref={rowRef}
                    className={`flex mb-4 ${isOutbound ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isOutbound
                                ? 'bg-primary-500 text-white'
                                : 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50'
                        }`}
                    >
                        {/* Media */}
                        {message.media_url && (
                            <div className="mb-2">
                                {message.media_type?.startsWith('image/') ? (
                                    <img
                                        src={message.media_url}
                                        alt="Mídia"
                                        className="max-w-full rounded"
                                    />
                                ) : message.media_type?.startsWith('video/') ? (
                                    <video
                                        src={message.media_url}
                                        controls
                                        className="max-w-full rounded"
                                    />
                                ) : message.media_type?.startsWith('audio/') ? (
                                    <audio src={message.media_url} controls className="w-full" />
                                ) : (
                                    <a
                                        href={message.media_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-500 hover:underline"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Baixar arquivo
                                    </a>
                                )}
                                {message.caption && (
                                    <p className="mt-2 text-sm">{message.caption}</p>
                                )}
                            </div>
                        )}

                        {/* Text Content */}
                        {message.type === 'text' && (
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        )}

                        {/* Time and Status */}
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                            isOutbound ? 'text-white/70' : 'text-dark-500'
                        }`}>
                            <span>{formatMessageTime(message.created_at)}</span>
                            {isOutbound && (
                                <span className="ml-1">
                                    {getStatusCheckmarks(message.status)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-dark-500 dark:text-dark-400">
                        Nenhuma mensagem ainda
                    </p>
                    <p className="text-sm text-dark-400 dark:text-dark-500 mt-2">
                        Envie a primeira mensagem para iniciar a conversa
                    </p>
                </div>
            </div>
        )
    }

    return (
        <VariableSizeList
            ref={listRef}
            height={containerHeight}
            itemCount={messages.length}
            itemSize={getRowHeight}
            width="100%"
            className="px-4"
        >
            {Row}
        </VariableSizeList>
    )
}
