import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, MessageSquare, Users, MessageCircle } from 'lucide-react'
import Tabs from '@/Components/UI/Tabs'
import { cn } from '@/lib/utils'
import { router } from '@inertiajs/react'

interface SearchResult {
    id: string
    type: string
    title: string
    subtitle?: string
    description?: string
    highlighted?: string
    url: string
    metadata?: any
    created_at?: string
}

interface SearchResultsModalProps {
    isOpen: boolean
    onClose: () => void
    query: string
    results: {
        messages?: any[]
        contacts?: any[]
        conversations?: any[]
        total: number
    }
    isLoading: boolean
}

export default function SearchResultsModal({
    isOpen,
    onClose,
    query,
    results,
    isLoading,
}: SearchResultsModalProps) {
    const messagesCount = results.messages?.length || 0
    const contactsCount = results.contacts?.length || 0
    const conversationsCount = results.conversations?.length || 0

    const handleResultClick = (result: any, type: string) => {
        const urls = {
            message: `/chat/${result.conversation_id}`,
            contact: `/contacts/${result.id}`,
            conversation: `/chat/${result.id}`,
        }

        router.visit(urls[type as keyof typeof urls])
        onClose()
    }

    const renderHighlightedText = (text: string, highlighted?: string) => {
        if (!highlighted) return text

        return (
            <div
                className="text-sm text-dark-600 dark:text-dark-400 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: highlighted }}
            />
        )
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return ''

        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        } else if (diffInHours < 24 * 7) {
            return date.toLocaleDateString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
        } else {
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded bg-white dark:bg-dark-800 shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-200 dark:border-dark-700">
                                    <div>
                                        <Dialog.Title className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                            Resultados da busca
                                        </Dialog.Title>
                                        {query && (
                                            <p className="mt-1 text-sm text-dark-500">
                                                {results.total} {results.total === 1 ? 'resultado' : 'resultados'} para "{query}"
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-dark-500" />
                                    </button>
                                </div>

                                {/* Tabs Content */}
                                <div className="px-6 py-4">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="text-center">
                                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                                                <p className="mt-3 text-sm text-dark-500">Buscando...</p>
                                            </div>
                                        </div>
                                    ) : results.total === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="w-16 h-16 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center mb-4">
                                                <MessageSquare className="w-8 h-8 text-dark-400" />
                                            </div>
                                            <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                                                Nenhum resultado encontrado
                                            </p>
                                            <p className="mt-1 text-sm text-dark-500">
                                                Tente buscar por outros termos
                                            </p>
                                        </div>
                                    ) : (
                                        <Tabs defaultValue="all">
                                            <Tabs.List className="mb-4">
                                                <Tabs.Trigger value="all">
                                                    Todos ({results.total})
                                                </Tabs.Trigger>
                                                <Tabs.Trigger value="messages">
                                                    Mensagens ({messagesCount})
                                                </Tabs.Trigger>
                                                <Tabs.Trigger value="contacts">
                                                    Contatos ({contactsCount})
                                                </Tabs.Trigger>
                                                <Tabs.Trigger value="conversations">
                                                    Conversas ({conversationsCount})
                                                </Tabs.Trigger>
                                            </Tabs.List>

                                            {/* Tab: Todos */}
                                            <Tabs.Content value="all">
                                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                                    {/* Mensagens */}
                                                    {results.messages && results.messages.length > 0 && (
                                                        <>
                                                            <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider px-3 py-2">
                                                                Mensagens
                                                            </h3>
                                                            {results.messages.slice(0, 3).map((message) => (
                                                                <button
                                                                    key={message.id}
                                                                    onClick={() => handleResultClick(message, 'message')}
                                                                    className="w-full text-left p-3 rounded hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                                                            <MessageCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                                                                                {message.conversation?.contact?.name || message.from_phone}
                                                                            </p>
                                                                            {message.content_highlighted ? (
                                                                                <div
                                                                                    className="text-sm text-dark-600 dark:text-dark-400 line-clamp-2 [&_b]:font-semibold [&_b]:text-primary-600 dark:[&_b]:text-primary-400"
                                                                                    dangerouslySetInnerHTML={{ __html: message.content_highlighted }}
                                                                                />
                                                                            ) : (
                                                                                <p className="text-sm text-dark-600 dark:text-dark-400 line-clamp-2">
                                                                                    {message.content}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs text-dark-400">
                                                                            {formatDate(message.created_at)}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </>
                                                    )}

                                                    {/* Contatos */}
                                                    {results.contacts && results.contacts.length > 0 && (
                                                        <>
                                                            <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider px-3 py-2 mt-4">
                                                                Contatos
                                                            </h3>
                                                            {results.contacts.slice(0, 3).map((contact) => (
                                                                <button
                                                                    key={contact.id}
                                                                    onClick={() => handleResultClick(contact, 'contact')}
                                                                    className="w-full text-left p-3 rounded hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                                                            <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                                                                                {contact.name || contact.phone}
                                                                            </p>
                                                                            <p className="text-sm text-dark-600 dark:text-dark-400 truncate">
                                                                                {contact.phone}
                                                                                {contact.email && ` • ${contact.email}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </>
                                                    )}

                                                    {/* Conversas */}
                                                    {results.conversations && results.conversations.length > 0 && (
                                                        <>
                                                            <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider px-3 py-2 mt-4">
                                                                Conversas
                                                            </h3>
                                                            {results.conversations.slice(0, 3).map((conversation) => (
                                                                <button
                                                                    key={conversation.id}
                                                                    onClick={() => handleResultClick(conversation, 'conversation')}
                                                                    className="w-full text-left p-3 rounded hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                                                            <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                                                                                {conversation.contact?.name || conversation.contact?.phone}
                                                                            </p>
                                                                            <p className="text-sm text-dark-600 dark:text-dark-400 truncate">
                                                                                Status: {conversation.status}
                                                                                {conversation.unread_count > 0 && ` • ${conversation.unread_count} não lidas`}
                                                                            </p>
                                                                        </div>
                                                                        <span className="text-xs text-dark-400">
                                                                            {formatDate(conversation.last_message_at)}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                            </Tabs.Content>

                                            {/* Tab: Mensagens */}
                                            <Tabs.Content value="messages">
                                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                                    {results.messages && results.messages.length > 0 ? (
                                                        results.messages.map((message) => (
                                                            <button
                                                                key={message.id}
                                                                onClick={() => handleResultClick(message, 'message')}
                                                                className="w-full text-left p-3 rounded hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                                                        <MessageCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                                                                            {message.conversation?.contact?.name || message.from_phone}
                                                                        </p>
                                                                        {message.content_highlighted ? (
                                                                            <div
                                                                                className="text-sm text-dark-600 dark:text-dark-400 line-clamp-2 [&_b]:font-semibold [&_b]:text-primary-600 dark:[&_b]:text-primary-400"
                                                                                dangerouslySetInnerHTML={{ __html: message.content_highlighted }}
                                                                            />
                                                                        ) : (
                                                                            <p className="text-sm text-dark-600 dark:text-dark-400 line-clamp-2">
                                                                                {message.content}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs text-dark-400">
                                                                        {formatDate(message.created_at)}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-sm text-dark-500">
                                                            Nenhuma mensagem encontrada
                                                        </div>
                                                    )}
                                                </div>
                                            </Tabs.Content>

                                            {/* Tab: Contatos */}
                                            <Tabs.Content value="contacts">
                                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                                    {results.contacts && results.contacts.length > 0 ? (
                                                        results.contacts.map((contact) => (
                                                            <button
                                                                key={contact.id}
                                                                onClick={() => handleResultClick(contact, 'contact')}
                                                                className="w-full text-left p-3 rounded hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                                                        <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                                                                            {contact.name || contact.phone}
                                                                        </p>
                                                                        <p className="text-sm text-dark-600 dark:text-dark-400 truncate">
                                                                            {contact.phone}
                                                                            {contact.email && ` • ${contact.email}`}
                                                                        </p>
                                                                        {contact.tags && contact.tags.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                {contact.tags.map((tag: any) => (
                                                                                    <span
                                                                                        key={tag.id}
                                                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                                                        style={{
                                                                                            backgroundColor: `${tag.color}20`,
                                                                                            color: tag.color,
                                                                                        }}
                                                                                    >
                                                                                        {tag.name}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-sm text-dark-500">
                                                            Nenhum contato encontrado
                                                        </div>
                                                    )}
                                                </div>
                                            </Tabs.Content>

                                            {/* Tab: Conversas */}
                                            <Tabs.Content value="conversations">
                                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                                    {results.conversations && results.conversations.length > 0 ? (
                                                        results.conversations.map((conversation) => (
                                                            <button
                                                                key={conversation.id}
                                                                onClick={() => handleResultClick(conversation, 'conversation')}
                                                                className="w-full text-left p-3 rounded hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                                                        <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                                                                            {conversation.contact?.name || conversation.contact?.phone}
                                                                        </p>
                                                                        <p className="text-sm text-dark-600 dark:text-dark-400 truncate">
                                                                            Status: {conversation.status}
                                                                            {conversation.unread_count > 0 && ` • ${conversation.unread_count} não lidas`}
                                                                        </p>
                                                                        {conversation.tags && conversation.tags.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                {conversation.tags.map((tag: any) => (
                                                                                    <span
                                                                                        key={tag.id}
                                                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                                                        style={{
                                                                                            backgroundColor: `${tag.color}20`,
                                                                                            color: tag.color,
                                                                                        }}
                                                                                    >
                                                                                        {tag.name}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs text-dark-400">
                                                                        {formatDate(conversation.last_message_at)}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-sm text-dark-500">
                                                            Nenhuma conversa encontrada
                                                        </div>
                                                    )}
                                                </div>
                                            </Tabs.Content>
                                        </Tabs>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
