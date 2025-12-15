import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
    onSearch: (query: string) => void
    onClear?: () => void
    placeholder?: string
    isLoading?: boolean
    className?: string
    autoFocus?: boolean
}

export default function SearchBar({
    onSearch,
    onClear,
    placeholder = 'Buscar em conversas, contatos e mensagens...',
    isLoading = false,
    className,
    autoFocus = false,
}: SearchBarProps) {
    const [query, setQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus()
        }
    }, [autoFocus])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim().length >= 2) {
            onSearch(query.trim())
        }
    }

    const handleClear = () => {
        setQuery('')
        onClear?.()
        inputRef.current?.focus()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)

        // Busca automática após 2 caracteres
        if (value.trim().length >= 2) {
            onSearch(value.trim())
        } else if (value.trim().length === 0) {
            onClear?.()
        }
    }

    return (
        <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
            <div className="relative">
                {/* Ícone de busca */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-dark-400 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 text-dark-400" />
                    )}
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={cn(
                        'w-full h-10 pl-10 pr-10 text-sm rounded',
                        'bg-dark-50 dark:bg-dark-800',
                        'border border-dark-200 dark:border-dark-700',
                        'text-dark-900 dark:text-dark-50',
                        'placeholder:text-dark-400',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'transition-colors'
                    )}
                />

                {/* Botão de limpar */}
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </form>
    )
}
