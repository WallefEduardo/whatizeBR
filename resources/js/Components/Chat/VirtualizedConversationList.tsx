import { FixedSizeList } from 'react-window'
import { Search } from 'lucide-react'

interface Tag {
    id: string
    name: string
    color: string
}

interface Contact {
    id: string
    name: string | null
    phone: string
    avatar_url: string | null
    tags: Tag[]
}

interface Conversation {
    id: string
    contact: Contact
    last_message: string | null
    last_message_at: string | null
    unread_count: number
    status: 'open' | 'pending' | 'closed'
    instance: {
        id: string
        name: string
    }
}

interface Props {
    conversations: Conversation[]
    selectedConversationId?: string
    onConversationClick: (conversationId: string) => void
    getInitials: (name: string | null, phone: string) => string
    formatTime: (dateString: string) => string
}

export default function VirtualizedConversationList({
    conversations,
    selectedConversationId,
    onConversationClick,
    getInitials,
    formatTime,
}: Props) {
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const conversation = conversations[index]
        const isSelected = selectedConversationId === conversation.id

        return (
            <div style={style}>
                <button
                    onClick={() => onConversationClick(conversation.id)}
                    className={`w-full p-4 flex gap-3 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors border-b border-dark-200 dark:border-dark-700 ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            {conversation.contact.avatar_url ? (
                                <img
                                    src={conversation.contact.avatar_url}
                                    alt={conversation.contact.name || conversation.contact.phone}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                    {getInitials(conversation.contact.name, conversation.contact.phone)}
                                </span>
                            )}
                        </div>
                        {conversation.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-medium">
                                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-dark-900 dark:text-dark-50 truncate">
                                {conversation.contact.name || conversation.contact.phone}
                            </h3>
                            {conversation.last_message_at && (
                                <span className="text-xs text-dark-500 ml-2 flex-shrink-0">
                                    {formatTime(conversation.last_message_at)}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-dark-600 dark:text-dark-400 truncate">
                            {conversation.last_message || 'Nenhuma mensagem ainda'}
                        </p>
                    </div>
                </button>
            </div>
        )
    }

    if (conversations.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10 text-dark-400" />
                    </div>
                    <p className="text-dark-500 dark:text-dark-400">
                        Nenhuma conversa encontrada
                    </p>
                </div>
            </div>
        )
    }

    return (
        <FixedSizeList
            height={window.innerHeight - 280} // Ajuste conforme necessário
            itemCount={conversations.length}
            itemSize={88} // Altura de cada item em pixels
            width="100%"
        >
            {Row}
        </FixedSizeList>
    )
}
