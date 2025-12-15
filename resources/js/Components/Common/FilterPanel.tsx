import { useState } from 'react'
import { Filter, X, Plus } from 'lucide-react'
import Button from '@/Components/UI/Button'
import Select from '@/Components/UI/Select'
import Input from '@/Components/UI/Input'
import { cn } from '@/lib/utils'

export interface FilterRule {
    id: string
    field: string
    condition: string
    value: any
}

interface FilterPanelProps {
    fields: Array<{ value: string; label: string; type?: string }>
    onApply: (filters: FilterRule[], operator: 'AND' | 'OR') => void
    onClear: () => void
    className?: string
}

const conditions = [
    { value: '=', label: 'Igual a' },
    { value: '!=', label: 'Diferente de' },
    { value: '>', label: 'Maior que' },
    { value: '>=', label: 'Maior ou igual a' },
    { value: '<', label: 'Menor que' },
    { value: '<=', label: 'Menor ou igual a' },
    { value: 'like', label: 'Contém' },
    { value: 'not_like', label: 'Não contém' },
    { value: 'in', label: 'Está em' },
    { value: 'not_in', label: 'Não está em' },
    { value: 'null', label: 'É nulo' },
    { value: 'not_null', label: 'Não é nulo' },
    { value: 'between', label: 'Entre' },
]

export default function FilterPanel({ fields, onApply, onClear, className }: FilterPanelProps) {
    const [filters, setFilters] = useState<FilterRule[]>([
        { id: '1', field: '', condition: '=', value: '' },
    ])
    const [operator, setOperator] = useState<'AND' | 'OR'>('AND')
    const [isExpanded, setIsExpanded] = useState(false)

    const addFilter = () => {
        setFilters([
            ...filters,
            { id: Date.now().toString(), field: '', condition: '=', value: '' },
        ])
    }

    const removeFilter = (id: string) => {
        if (filters.length === 1) return
        setFilters(filters.filter((f) => f.id !== id))
    }

    const updateFilter = (id: string, updates: Partial<FilterRule>) => {
        setFilters(
            filters.map((f) => (f.id === id ? { ...f, ...updates } : f))
        )
    }

    const handleApply = () => {
        const validFilters = filters.filter((f) => f.field && f.condition)
        onApply(validFilters, operator)
        setIsExpanded(false)
    }

    const handleClear = () => {
        setFilters([{ id: '1', field: '', condition: '=', value: '' }])
        setOperator('AND')
        onClear()
        setIsExpanded(false)
    }

    const activeFiltersCount = filters.filter((f) => f.field && f.condition).length

    return (
        <div className={cn('relative', className)}>
            {/* Toggle Button */}
            <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative"
            >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-500 rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </Button>

            {/* Filter Panel */}
            {isExpanded && (
                <div className="absolute right-0 top-full mt-2 w-[600px] max-w-full bg-white dark:bg-dark-800 rounded shadow-lg border border-dark-200 dark:border-dark-700 z-50">
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-dark-900 dark:text-dark-50">
                                Filtros Avançados
                            </h3>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                            >
                                <X className="w-4 h-4 text-dark-500" />
                            </button>
                        </div>

                        {/* Operator */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Operador Lógico
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setOperator('AND')}
                                    className={cn(
                                        'flex-1 px-3 py-2 text-sm rounded transition-colors',
                                        operator === 'AND'
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                    )}
                                >
                                    E (AND)
                                </button>
                                <button
                                    onClick={() => setOperator('OR')}
                                    className={cn(
                                        'flex-1 px-3 py-2 text-sm rounded transition-colors',
                                        operator === 'OR'
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                    )}
                                >
                                    OU (OR)
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-dark-500">
                                {operator === 'AND'
                                    ? 'Todas as condições devem ser verdadeiras'
                                    : 'Pelo menos uma condição deve ser verdadeira'}
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                            {filters.map((filter, index) => (
                                <div
                                    key={filter.id}
                                    className="flex gap-2 items-start p-3 rounded bg-dark-50 dark:bg-dark-900"
                                >
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                        {/* Field */}
                                        <Select
                                            value={filter.field}
                                            onChange={(e) =>
                                                updateFilter(filter.id, { field: e.target.value })
                                            }
                                            options={[
                                                { value: '', label: 'Selecione o campo' },
                                                ...fields,
                                            ]}
                                        />

                                        {/* Condition */}
                                        <Select
                                            value={filter.condition}
                                            onChange={(e) =>
                                                updateFilter(filter.id, { condition: e.target.value })
                                            }
                                            options={conditions}
                                        />

                                        {/* Value */}
                                        {filter.condition !== 'null' &&
                                            filter.condition !== 'not_null' && (
                                                <Input
                                                    value={filter.value}
                                                    onChange={(e) =>
                                                        updateFilter(filter.id, {
                                                            value: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Valor"
                                                />
                                            )}
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFilter(filter.id)}
                                        disabled={filters.length === 1}
                                        className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <X className="w-4 h-4 text-dark-500 hover:text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Filter Button */}
                        <button
                            onClick={addFilter}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 border border-dashed border-primary-300 dark:border-primary-700 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Filtro
                        </button>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                            <Button variant="secondary" size="sm" onClick={handleClear}>
                                Limpar
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleApply}>
                                Aplicar Filtros
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
