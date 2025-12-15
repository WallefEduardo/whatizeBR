import { useState, useRef, useEffect } from 'react'
import { Zap, X, Search } from 'lucide-react'

interface QuickReply {
    id: string
    shortcut: string
    message: string
}

interface QuickRepliesProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (message: string) => void
    quickReplies?: QuickReply[]
}

// Mock data - in production, this would come from props or API
const defaultQuickReplies: QuickReply[] = [
    { id: '1', shortcut: '/ola', message: 'Olá! Como posso ajudá-lo hoje?' },
    { id: '2', shortcut: '/obrigado', message: 'Obrigado pelo contato! Estamos à disposição.' },
    { id: '3', shortcut: '/aguarde', message: 'Por favor, aguarde um momento enquanto verifico isso para você.' },
    { id: '4', shortcut: '/horario', message: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.' },
    { id: '5', shortcut: '/entendi', message: 'Entendi sua situação. Vou ajudá-lo com isso.' },
    { id: '6', shortcut: '/mais', message: 'Há algo mais em que posso ajudá-lo?' },
]

export default function QuickReplies({
    isOpen,
    onClose,
    onSelect,
    quickReplies = defaultQuickReplies,
}: QuickRepliesProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredReplies, setFilteredReplies] = useState(quickReplies)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    useEffect(() => {
        if (searchTerm) {
            const filtered = quickReplies.filter(
                (reply) =>
                    reply.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reply.message.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredReplies(filtered)
        } else {
            setFilteredReplies(quickReplies)
        }
    }, [searchTerm, quickReplies])

    const handleSelect = (message: string) => {
        onSelect(message)
        setSearchTerm('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div
            ref={menuRef}
            className="absolute bottom-16 right-0 z-50 w-96 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-dark-200 dark:border-dark-700 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-500" />
                    <h3 className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                        Respostas Rápidas
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
                >
                    <X className="w-4 h-4 text-dark-500" />
                </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-dark-200 dark:border-dark-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar respostas..."
                        className="w-full pl-10 pr-4 py-2 bg-dark-100 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 rounded-md text-sm text-dark-900 dark:text-dark-50 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus
                    />
                </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
                {filteredReplies.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-sm text-dark-500">Nenhuma resposta encontrada</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-200 dark:divide-dark-700">
                        {filteredReplies.map((reply) => (
                            <button
                                key={reply.id}
                                onClick={() => handleSelect(reply.message)}
                                className="w-full px-4 py-3 text-left hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-primary-500" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
                                            {reply.shortcut}
                                        </p>
                                        <p className="text-sm text-dark-900 dark:text-dark-50 line-clamp-2">
                                            {reply.message}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
