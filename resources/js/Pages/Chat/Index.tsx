import { useState, useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
import { Search, Phone, MoreVertical, Paperclip, Smile, Mic, Send, X, User, Tag as TagIcon, FileText, Clock } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import Badge from '@/Components/UI/Badge'
import { useWebSocket } from '@/Hooks/useWebSocket'

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
    notes: string | null
    tags: Tag[]
    custom_fields: Record<string, any>
}

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
    conversations: {
        data: Conversation[]
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
    selectedConversation?: Conversation
    messages?: Message[]
    stats: {
        open: number
        pending: number
        closed: number
    }
}

export default function ChatIndex({ conversations, selectedConversation, messages = [], stats }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [messageText, setMessageText] = useState('')
    const [statusFilter, setStatusFilter] = useState<'open' | 'pending' | 'closed'>('open')
    const [showContactPanel, setShowContactPanel] = useState(true)
    const [localMessages, setLocalMessages] = useState<Message[]>(messages)
    const [typingContact, setTypingContact] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Update local messages when props change (conversation switch)
    useEffect(() => {
        setLocalMessages(messages)
    }, [messages])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [localMessages])

    // WebSocket integration
    const { sendTypingIndicator } = useWebSocket({
        conversationId: selectedConversation?.id || '',
        onMessageReceived: (message) => {
            setLocalMessages(prev => [...prev, message])
        },
        onMessageSent: (message) => {
            setLocalMessages(prev => {
                const existing = prev.find(m => m.id === message.id)
                if (existing) {
                    return prev.map(m => m.id === message.id ? message : m)
                }
                return [...prev, message]
            })
        },
        onMessageRead: (messageId) => {
            setLocalMessages(prev =>
                prev.map(m => m.id === messageId ? { ...m, status: 'read' as const } : m)
            )
        },
        onTypingIndicator: (contactName, isTyping) => {
            setTypingContact(isTyping ? contactName : null)
            if (isTyping) {
                setTimeout(() => setTypingContact(null), 3000)
            }
        },
    })

    const getInitials = (name: string | null, phone: string) => {
        const text = name || phone
        return text.substring(0, 2).toUpperCase()
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) {
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        } else if (days === 1) {
            return 'Ontem'
        } else if (days < 7) {
            return date.toLocaleDateString('pt-BR', { weekday: 'short' })
        } else {
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        }
    }

    const formatMessageTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }

    const handleConversationClick = (conversationId: string) => {
        router.visit(`/chat/${conversationId}`)
    }

    const handleSendMessage = () => {
        if (!messageText.trim() || !selectedConversation) return

        router.post(`/conversations/${selectedConversation.id}/messages`, {
            content: messageText,
            type: 'text',
        }, {
            onSuccess: () => {
                setMessageText('')
            },
        })
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const getStatusCheckmarks = (status: string) => {
        if (status === 'read') {
            return (
                <div className="flex items-center gap-0.5">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                    <svg className="w-4 h-4 text-blue-500 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                </div>
            )
        } else if (status === 'delivered') {
            return (
                <div className="flex items-center gap-0.5">
                    <svg className="w-4 h-4 text-dark-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                    <svg className="w-4 h-4 text-dark-400 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                </div>
            )
        } else if (status === 'sent') {
            return (
                <svg className="w-4 h-4 text-dark-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
            )
        } else if (status === 'pending') {
            return (
                <svg className="w-4 h-4 text-dark-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )
        }
        return null
    }

    const filteredConversations = conversations.data.filter(conv => {
        const matchesStatus = conv.status === statusFilter
        const matchesSearch = !searchQuery ||
            (conv.contact.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            conv.contact.phone.includes(searchQuery)
        return matchesStatus && matchesSearch
    })

    return (
        <AppLayout title="Chat ao Vivo">
            <div className="-m-6 h-[calc(100vh-4rem)] flex">
                {/* Lista de Conversas - Sidebar Esquerda */}
                <div className="w-96 bg-white dark:bg-dark-800 border-r border-dark-200 dark:border-dark-700 flex flex-col">
                    {/* Header da Lista */}
                    <div className="p-4 border-b border-dark-200 dark:border-dark-700">
                        <h1 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-4">
                            Conversas
                        </h1>

                        {/* Busca */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input
                                type="text"
                                placeholder="Buscar conversas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-dark-50 dark:bg-dark-900 text-dark-900 dark:text-dark-50 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Tabs de Status */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter('open')}
                                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                    statusFilter === 'open'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                }`}
                            >
                                Atendimento
                                {stats.open > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                                        {stats.open}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                    statusFilter === 'pending'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                }`}
                            >
                                Aguardando
                                {stats.pending > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                                        {stats.pending}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setStatusFilter('closed')}
                                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                    statusFilter === 'closed'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                }`}
                            >
                                Finalizados
                            </button>
                        </div>
                    </div>

                    {/* Lista de Conversas */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-dark-400" />
                                </div>
                                <p className="text-sm text-dark-500">
                                    Nenhuma conversa encontrada
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    onClick={() => handleConversationClick(conversation.id)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors border-b border-dark-100 dark:border-dark-700 ${
                                        selectedConversation?.id === conversation.id
                                            ? 'bg-dark-50 dark:bg-dark-700/50'
                                            : ''
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
                                                <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                                                    {getInitials(conversation.contact.name, conversation.contact.phone)}
                                                </span>
                                            )}
                                        </div>
                                        {conversation.unread_count > 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">
                                                    {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-dark-900 dark:text-dark-50 truncate">
                                                {conversation.contact.name || conversation.contact.phone}
                                            </h3>
                                            {conversation.last_message_at && (
                                                <span className="text-xs text-dark-500 ml-2 flex-shrink-0">
                                                    {formatTime(conversation.last_message_at)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-dark-500 truncate">
                                            {conversation.last_message || 'Nenhuma mensagem'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Janela de Chat - Central */}
                <div className="flex-1 flex flex-col bg-dark-50 dark:bg-dark-900">
                    {selectedConversation ? (
                        <>
                            {/* Header do Chat */}
                            <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                        {selectedConversation.contact.avatar_url ? (
                                            <img
                                                src={selectedConversation.contact.avatar_url}
                                                alt={selectedConversation.contact.name || selectedConversation.contact.phone}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                                                {getInitials(selectedConversation.contact.name, selectedConversation.contact.phone)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h2 className="font-semibold text-dark-900 dark:text-dark-50">
                                            {selectedConversation.contact.name || selectedConversation.contact.phone}
                                        </h2>
                                        <p className="text-xs text-dark-500">
                                            {selectedConversation.contact.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded transition-colors">
                                        <Phone className="w-5 h-5 text-dark-500" />
                                    </button>
                                    <button
                                        onClick={() => setShowContactPanel(!showContactPanel)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded transition-colors"
                                    >
                                        <User className="w-5 h-5 text-dark-500" />
                                    </button>
                                    <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded transition-colors">
                                        <MoreVertical className="w-5 h-5 text-dark-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Typing Indicator */}
                            {typingContact && (
                                <div className="px-4 py-2 bg-dark-100 dark:bg-dark-700/50 border-b border-dark-200 dark:border-dark-700">
                                    <p className="text-xs text-dark-600 dark:text-dark-400">
                                        <span className="font-medium">{typingContact}</span> está digitando
                                        <span className="inline-flex ml-1">
                                            <span className="animate-pulse">.</span>
                                            <span className="animate-pulse animation-delay-200">.</span>
                                            <span className="animate-pulse animation-delay-400">.</span>
                                        </span>
                                    </p>
                                </div>
                            )}

                            {/* Área de Mensagens */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {localMessages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="w-20 h-20 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-10 h-10 text-dark-400" />
                                            </div>
                                            <p className="text-sm text-dark-500">
                                                Nenhuma mensagem ainda
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {localMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-md px-4 py-2 rounded ${
                                                    message.direction === 'outbound'
                                                        ? 'bg-primary-500 text-white rounded-br-none'
                                                        : 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-none'
                                                }`}
                                            >
                                                {message.type === 'text' && (
                                                    <p className="text-sm whitespace-pre-wrap break-words">
                                                        {message.content}
                                                    </p>
                                                )}

                                                {message.type === 'image' && (
                                                    <div>
                                                        <img
                                                            src={message.media_url}
                                                            alt="Imagem"
                                                            className="rounded mb-2 max-w-full"
                                                        />
                                                        {message.caption && (
                                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                                {message.caption}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className={`flex items-center justify-end gap-1 mt-1 ${
                                                    message.direction === 'outbound' ? 'text-white/70' : 'text-dark-500'
                                                }`}>
                                                    <span className="text-xs">
                                                        {formatMessageTime(message.created_at)}
                                                    </span>
                                                    {message.direction === 'outbound' && (
                                                        <div className="flex-shrink-0">
                                                            {getStatusCheckmarks(message.status)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input de Mensagem */}
                            <div className="bg-white dark:bg-dark-800 border-t border-dark-200 dark:border-dark-700 p-4">
                                <div className="flex items-end gap-2">
                                    <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded transition-colors flex-shrink-0">
                                        <Smile className="w-5 h-5 text-dark-500" />
                                    </button>
                                    <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded transition-colors flex-shrink-0">
                                        <Paperclip className="w-5 h-5 text-dark-500" />
                                    </button>

                                    <textarea
                                        value={messageText}
                                        onChange={(e) => {
                                            setMessageText(e.target.value)
                                            if (e.target.value.trim() && selectedConversation) {
                                                sendTypingIndicator(true)
                                            }
                                        }}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Digite uma mensagem..."
                                        rows={1}
                                        className="flex-1 px-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />

                                    {messageText.trim() ? (
                                        <button
                                            onClick={handleSendMessage}
                                            className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors flex-shrink-0"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded transition-colors flex-shrink-0">
                                            <Mic className="w-5 h-5 text-dark-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-12 h-12 text-dark-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2">
                                    Selecione uma conversa
                                </h3>
                                <p className="text-sm text-dark-500">
                                    Escolha uma conversa na lista ao lado para começar
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Painel de Contato - Sidebar Direita */}
                {selectedConversation && showContactPanel && (
                    <div className="w-80 bg-white dark:bg-dark-800 border-l border-dark-200 dark:border-dark-700 overflow-y-auto">
                        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
                            <h3 className="font-semibold text-dark-900 dark:text-dark-50">
                                Detalhes do Contato
                            </h3>
                            <button
                                onClick={() => setShowContactPanel(false)}
                                className="p-1 hover:bg-dark-100 dark:hover:bg-dark-700 rounded transition-colors"
                            >
                                <X className="w-5 h-5 text-dark-500" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Avatar e Nome */}
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-3">
                                    {selectedConversation.contact.avatar_url ? (
                                        <img
                                            src={selectedConversation.contact.avatar_url}
                                            alt={selectedConversation.contact.name || selectedConversation.contact.phone}
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-primary-600 dark:text-primary-400 font-bold text-2xl">
                                            {getInitials(selectedConversation.contact.name, selectedConversation.contact.phone)}
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-semibold text-dark-900 dark:text-dark-50 mb-1">
                                    {selectedConversation.contact.name || 'Sem nome'}
                                </h4>
                                <p className="text-sm text-dark-500">
                                    {selectedConversation.contact.phone}
                                </p>
                            </div>

                            {/* Tags */}
                            {selectedConversation.contact.tags.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <TagIcon className="w-4 h-4 text-dark-500" />
                                        <h5 className="text-sm font-semibold text-dark-700 dark:text-dark-300">
                                            Tags
                                        </h5>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedConversation.contact.tags.map(tag => (
                                            <Badge
                                                key={tag.id}
                                                variant="default"
                                                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                            >
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Observações */}
                            {selectedConversation.contact.notes && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-4 h-4 text-dark-500" />
                                        <h5 className="text-sm font-semibold text-dark-700 dark:text-dark-300">
                                            Observações
                                        </h5>
                                    </div>
                                    <p className="text-sm text-dark-600 dark:text-dark-400 whitespace-pre-wrap">
                                        {selectedConversation.contact.notes}
                                    </p>
                                </div>
                            )}

                            {/* Campos Personalizados */}
                            {Object.keys(selectedConversation.contact.custom_fields).length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">
                                        Campos Personalizados
                                    </h5>
                                    <div className="space-y-3">
                                        {Object.entries(selectedConversation.contact.custom_fields).map(([key, value]) => (
                                            <div key={key}>
                                                <p className="text-xs text-dark-500 mb-1">{key}</p>
                                                <p className="text-sm text-dark-900 dark:text-dark-50">
                                                    {String(value)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Informações da Instância */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-dark-500" />
                                    <h5 className="text-sm font-semibold text-dark-700 dark:text-dark-300">
                                        Informações
                                    </h5>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-dark-500">Instância</p>
                                        <p className="text-sm text-dark-900 dark:text-dark-50">
                                            {selectedConversation.instance.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-dark-500">Status</p>
                                        <Badge variant={
                                            selectedConversation.status === 'open' ? 'success' :
                                            selectedConversation.status === 'pending' ? 'warning' : 'default'
                                        }>
                                            {selectedConversation.status === 'open' ? 'Em Atendimento' :
                                             selectedConversation.status === 'pending' ? 'Aguardando' : 'Finalizado'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
