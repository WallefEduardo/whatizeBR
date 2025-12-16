import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Plus, Search, Filter, X, UserPlus, Users, UserX, Tag as TagIcon } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import Button from '@/Components/UI/Button'
import VirtualizedTable from '@/Components/Common/VirtualizedTable'
import TableActions from '@/Components/UI/Table/TableActions'
import Badge from '@/Components/UI/Badge'
import Modal from '@/Components/UI/Modal'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'
import { useConfirm } from '@/Hooks/useConfirm'

interface Tag {
    id: string
    name: string
    color: string
}

interface Instance {
    id: string
    name: string
}

interface Contact {
    id: string
    name: string | null
    phone: string
    email: string | null
    avatar_url: string | null
    is_blocked: boolean
    last_interaction_at: string | null
    created_at: string
    tags: Tag[]
    instance: {
        id: string
        name: string
    }
}

interface PaginatedContacts {
    data: Contact[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

interface Props {
    contacts: PaginatedContacts
    tags: Tag[]
    instances: Instance[]
    filters: {
        search?: string
        blocked?: boolean
        tags?: string[]
        instance_id?: string
    }
}

export default function ContactsIndex({ contacts, tags, instances, filters }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState(filters.search || '')
    const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || [])
    const [selectedInstance, setSelectedInstance] = useState(filters.instance_id || '')
    const [blockedFilter, setBlockedFilter] = useState<boolean | undefined>(filters.blocked)

    const { confirm, isOpen, isLoading, options, handleConfirm, handleClose } = useConfirm()

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        applyFilters({ search: query })
    }

    const applyFilters = (newFilters: Partial<typeof filters> = {}) => {
        const params: any = {
            search: searchQuery,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            instance_id: selectedInstance || undefined,
            blocked: blockedFilter,
            ...newFilters,
        }

        // Remove undefined values
        Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
                delete params[key]
            }
        })

        router.get('/contacts', params, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedTags([])
        setSelectedInstance('')
        setBlockedFilter(undefined)
        router.get('/contacts')
    }

    const toggleTag = (tagId: string) => {
        const newTags = selectedTags.includes(tagId)
            ? selectedTags.filter(id => id !== tagId)
            : [...selectedTags, tagId]
        setSelectedTags(newTags)
    }

    const handleDelete = (contact: Contact) => {
        confirm({
            title: 'Deletar Contato',
            message: `Tem certeza que deseja deletar o contato "${contact.name || contact.phone}"? Esta ação não pode ser desfeita.`,
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            variant: 'danger',
            onConfirm: async () => {
                router.delete(`/contacts/${contact.id}`)
            },
        })
    }

    const handleToggleBlock = (contact: Contact) => {
        const action = contact.is_blocked ? 'desbloquear' : 'bloquear'
        confirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Contato`,
            message: `Tem certeza que deseja ${action} o contato "${contact.name || contact.phone}"?`,
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            cancelText: 'Cancelar',
            variant: 'warning',
            onConfirm: async () => {
                router.post(`/contacts/${contact.id}/toggle-block`, {}, {
                    preserveScroll: true,
                })
            },
        })
    }

    const columns = [
        {
            key: 'name',
            label: 'Contato',
            render: (contact: Contact) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                        {contact.avatar_url ? (
                            <img
                                src={contact.avatar_url}
                                alt={contact.name || contact.phone}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                                {(contact.name || contact.phone).substring(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-dark-900 dark:text-dark-50 truncate">
                            {contact.name || 'Sem nome'}
                        </p>
                        <p className="text-sm text-dark-500 truncate">{contact.phone}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'E-mail',
            render: (contact: Contact) => (
                <span className="text-sm text-dark-600 dark:text-dark-400">
                    {contact.email || '-'}
                </span>
            ),
        },
        {
            key: 'instance',
            label: 'Instância',
            render: (contact: Contact) => (
                <span className="text-sm text-dark-600 dark:text-dark-400">
                    {contact.instance.name}
                </span>
            ),
        },
        {
            key: 'tags',
            label: 'Tags',
            render: (contact: Contact) => (
                <div className="flex flex-wrap gap-1">
                    {contact.tags.length > 0 ? (
                        contact.tags.slice(0, 3).map(tag => (
                            <Badge
                                key={tag.id}
                                variant="default"
                                maxWidth="sm"
                                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                                {tag.name}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs text-dark-400">-</span>
                    )}
                    {contact.tags.length > 3 && (
                        <Badge variant="default" maxWidth="sm">
                            +{contact.tags.length - 3}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (contact: Contact) => (
                contact.is_blocked ? (
                    <Badge variant="danger" maxWidth="sm">Bloqueado</Badge>
                ) : (
                    <Badge variant="success" maxWidth="sm">Ativo</Badge>
                )
            ),
        },
        {
            key: 'last_interaction',
            label: 'Última interação',
            render: (contact: Contact) => (
                <span className="text-sm text-dark-600 dark:text-dark-400">
                    {contact.last_interaction_at
                        ? new Date(contact.last_interaction_at).toLocaleDateString('pt-BR')
                        : 'Nunca'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Ações',
            width: '120px',
            render: (contact: Contact) => (
                <TableActions
                    onView={() => router.visit(`/contacts/${contact.id}`)}
                    onEdit={() => router.visit(`/contacts/${contact.id}/edit`)}
                    onDelete={() => handleDelete(contact)}
                    customActions={[
                        {
                            label: contact.is_blocked ? 'Desbloquear' : 'Bloquear',
                            icon: <UserX className="w-4 h-4" />,
                            onClick: () => handleToggleBlock(contact),
                            variant: 'default',
                        },
                    ]}
                />
            ),
        },
    ]

    const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedInstance || blockedFilter !== undefined

    return (
        <AppLayout title="Contatos">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">Contatos</h1>
                        <p className="mt-1 text-sm text-dark-500">
                            Gerencie todos os contatos do seu WhatsApp
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Contato
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-dark-500">Total de Contatos</p>
                                <p className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                                    {contacts.total}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-dark-400 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-dark-500">Com Tags</p>
                                <p className="text-2xl font-bold text-primary-600">
                                    {contacts.data.filter(c => c.tags.length > 0).length}
                                </p>
                            </div>
                            <TagIcon className="w-8 h-8 text-primary-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-dark-500">Bloqueados</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {contacts.data.filter(c => c.is_blocked).length}
                                </p>
                            </div>
                            <UserX className="w-8 h-8 text-red-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-dark-500">Novos (7 dias)</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {contacts.data.filter(c => {
                                        const days = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)
                                        return days <= 7
                                    }).length}
                                </p>
                            </div>
                            <UserPlus className="w-8 h-8 text-blue-500 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, telefone ou e-mail..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            variant={showFilters ? 'primary' : 'secondary'}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                            {hasActiveFilters && !showFilters && (
                                <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>
                            )}
                        </Button>

                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={clearFilters}>
                                <X className="w-4 h-4 mr-2" />
                                Limpar Filtros
                            </Button>
                        )}
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700 space-y-4">
                            {/* Instance Filter */}
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    Instância
                                </label>
                                <select
                                    value={selectedInstance}
                                    onChange={(e) => setSelectedInstance(e.target.value)}
                                    className="w-full px-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Todas as instâncias</option>
                                    {instances.map(instance => (
                                        <option key={instance.id} value={instance.id}>
                                            {instance.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tags Filter */}
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                                selectedTags.includes(tag.id)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                            }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                    {tags.length === 0 && (
                                        <p className="text-sm text-dark-500">Nenhuma tag cadastrada</p>
                                    )}
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    Status
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setBlockedFilter(undefined)}
                                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                            blockedFilter === undefined
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        onClick={() => setBlockedFilter(false)}
                                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                            blockedFilter === false
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                        }`}
                                    >
                                        Ativos
                                    </button>
                                    <button
                                        onClick={() => setBlockedFilter(true)}
                                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                            blockedFilter === true
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                        }`}
                                    >
                                        Bloqueados
                                    </button>
                                </div>
                            </div>

                            {/* Apply Filters Button */}
                            <div className="flex justify-end">
                                <Button variant="primary" onClick={() => applyFilters()}>
                                    Aplicar Filtros
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table - Virtualizada */}
                <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700">
                    <VirtualizedTable
                        columns={columns}
                        data={contacts.data}
                        keyExtractor={(contact) => contact.id}
                        rowHeight={72}
                        containerHeight={600}
                        emptyMessage="Nenhum contato encontrado. Clique em 'Novo Contato' para adicionar."
                    />

                    {/* Pagination */}
                    {contacts.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                            <p className="text-sm text-dark-500">
                                Mostrando {(contacts.current_page - 1) * contacts.per_page + 1} a{' '}
                                {Math.min(contacts.current_page * contacts.per_page, contacts.total)} de {contacts.total} contatos
                            </p>
                            <div className="flex gap-2">
                                {Array.from({ length: contacts.last_page }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => router.get(`/contacts?page=${page}`, {}, { preserveState: true })}
                                        className={`px-3 py-1 rounded text-sm font-medium ${
                                            page === contacts.current_page
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal - Will implement in next step */}
            <Modal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Novo Contato"
                maxWidth="lg"
            >
                <p className="text-dark-600 dark:text-dark-400">Modal de criação será implementado na próxima etapa...</p>
            </Modal>

            {/* Confirm Dialog */}
            {options && (
                <ConfirmDialog
                    show={isOpen}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    title={options.title}
                    message={options.message}
                    confirmText={options.confirmText}
                    cancelText={options.cancelText}
                    type={options.variant}
                    isLoading={isLoading}
                />
            )}
        </AppLayout>
    )
}
