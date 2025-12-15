import { Eye, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface CustomAction {
    label: string
    icon: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'danger' | 'warning'
}

interface TableActionsProps {
    onView?: () => void
    onEdit?: () => void
    onDelete?: () => void
    customActions?: CustomAction[]
}

export default function TableActions({ onView, onEdit, onDelete, customActions = [] }: TableActionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const actions = [
        ...(onView ? [{
            label: 'Visualizar',
            icon: <Eye className="w-4 h-4" />,
            onClick: onView,
            variant: 'default' as const
        }] : []),
        ...(onEdit ? [{
            label: 'Editar',
            icon: <Pencil className="w-4 h-4" />,
            onClick: onEdit,
            variant: 'default' as const
        }] : []),
        ...customActions,
        ...(onDelete ? [{
            label: 'Deletar',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: onDelete,
            variant: 'danger' as const
        }] : []),
    ]

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 z-50">
                    <div className="py-1">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    action.onClick()
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                                    action.variant === 'danger'
                                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                                        : action.variant === 'warning'
                                        ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
                                        : 'text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'
                                }`}
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
