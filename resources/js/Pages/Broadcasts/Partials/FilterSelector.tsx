import { useState, useEffect } from 'react';
import { Tag, Building2, UserX } from 'lucide-react';

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface Department {
    id: string;
    name: string;
}

interface Filters {
    tags: string[];
    departments: string[];
    exclude_blocked: boolean;
}

interface Props {
    filters: Filters;
    onChange: (filters: Filters) => void;
}

export default function FilterSelector({ filters, onChange }: Props) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFiltersData();
    }, []);

    const fetchFiltersData = async () => {
        try {
            // TODO: Fetch from API when endpoints are ready
            // For now using mock data
            setTags([
                { id: '1', name: 'VIP', color: '#f59e0b' },
                { id: '2', name: 'Cliente Ativo', color: '#22c55e' },
                { id: '3', name: 'Inadimplente', color: '#ef4444' },
            ]);

            setDepartments([
                { id: '1', name: 'Vendas' },
                { id: '2', name: 'Suporte' },
                { id: '3', name: 'Financeiro' },
            ]);
        } catch (error) {
            console.error('Error fetching filter data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTagToggle = (tagId: string) => {
        const newTags = filters.tags.includes(tagId)
            ? filters.tags.filter((id) => id !== tagId)
            : [...filters.tags, tagId];

        onChange({ ...filters, tags: newTags });
    };

    const handleDepartmentToggle = (deptId: string) => {
        const newDepartments = filters.departments.includes(deptId)
            ? filters.departments.filter((id) => id !== deptId)
            : [...filters.departments, deptId];

        onChange({ ...filters, departments: newDepartments });
    };

    const handleExcludeBlockedToggle = () => {
        onChange({ ...filters, exclude_blocked: !filters.exclude_blocked });
    };

    if (isLoading) {
        return (
            <div className="bg-dark-50 dark:bg-dark-900 rounded border border-dark-200 dark:border-dark-700 p-4">
                <p className="text-sm text-dark-500 text-center">Carregando filtros...</p>
            </div>
        );
    }

    return (
        <div className="bg-dark-50 dark:bg-dark-900 rounded border border-dark-200 dark:border-dark-700 p-4 space-y-4">
            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Filtrar por Tags
                </label>
                <div className="flex flex-wrap gap-2">
                    {tags.length === 0 ? (
                        <p className="text-sm text-dark-500">Nenhuma tag disponível</p>
                    ) : (
                        tags.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                    filters.tags.includes(tag.id)
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-2 border-primary-500'
                                        : 'bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:border-primary-300'
                                }`}
                            >
                                <span
                                    className="inline-block w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                            </button>
                        ))
                    )}
                </div>
                {filters.tags.length > 0 && (
                    <p className="text-xs text-dark-500 mt-2">
                        {filters.tags.length} tag(s) selecionada(s)
                    </p>
                )}
            </div>

            {/* Departments */}
            <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Filtrar por Departamentos
                </label>
                <div className="flex flex-wrap gap-2">
                    {departments.length === 0 ? (
                        <p className="text-sm text-dark-500">Nenhum departamento disponível</p>
                    ) : (
                        departments.map((dept) => (
                            <button
                                key={dept.id}
                                type="button"
                                onClick={() => handleDepartmentToggle(dept.id)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                    filters.departments.includes(dept.id)
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-2 border-primary-500'
                                        : 'bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:border-primary-300'
                                }`}
                            >
                                {dept.name}
                            </button>
                        ))
                    )}
                </div>
                {filters.departments.length > 0 && (
                    <p className="text-xs text-dark-500 mt-2">
                        {filters.departments.length} departamento(s) selecionado(s)
                    </p>
                )}
            </div>

            {/* Exclude Blocked */}
            <div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.exclude_blocked}
                        onChange={handleExcludeBlockedToggle}
                        className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700 dark:text-dark-300">
                        <UserX className="w-4 h-4 inline mr-2" />
                        Excluir contatos bloqueados
                    </span>
                </label>
            </div>

            {/* Filter Summary */}
            {(filters.tags.length > 0 || filters.departments.length > 0 || !filters.exclude_blocked) && (
                <div className="pt-3 border-t border-dark-200 dark:border-dark-700">
                    <p className="text-xs text-dark-500">
                        Filtros ativos: {[
                            filters.tags.length > 0 && `${filters.tags.length} tag(s)`,
                            filters.departments.length > 0 && `${filters.departments.length} departamento(s)`,
                            !filters.exclude_blocked && 'incluindo bloqueados',
                        ].filter(Boolean).join(', ')}
                    </p>
                </div>
            )}
        </div>
    );
}
