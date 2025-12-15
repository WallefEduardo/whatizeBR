import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Plus, Send, XCircle, Eye, Edit, Trash2, Filter, Search } from 'lucide-react';
import BroadcastModal from './Partials/BroadcastModal';
import BroadcastStats from './Partials/BroadcastStats';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import { useConfirm } from '@/Hooks/useConfirm';

interface Broadcast {
    id: string;
    name: string;
    message_type: 'text' | 'image' | 'video' | 'document';
    status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
    scheduled_at: string | null;
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    read_count: number;
    failed_count: number;
    created_at: string;
}

interface Props {
    broadcasts: {
        data: Broadcast[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status: string;
        message_type: string;
        search: string;
        sort_by: string;
        sort_order: string;
    };
}

export default function BroadcastsIndex({ broadcasts, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [typeFilter, setTypeFilter] = useState(filters.message_type);
    const { confirm, isOpen, isLoading, options, handleConfirm, handleClose } = useConfirm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('broadcasts.index'), {
            search: searchTerm,
            status: statusFilter,
            message_type: typeFilter,
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(route('broadcasts.index'), {
            ...filters,
            [key]: value,
            search: searchTerm,
        }, { preserveState: true });
    };

    const handleCreate = () => {
        setSelectedBroadcast(null);
        setIsModalOpen(true);
    };

    const handleEdit = (broadcast: Broadcast) => {
        setSelectedBroadcast(broadcast);
        setIsModalOpen(true);
    };

    const handleSend = (broadcast: Broadcast) => {
        confirm({
            title: 'Enviar Broadcast',
            message: `Tem certeza que deseja enviar o broadcast "${broadcast.name}" para ${broadcast.total_recipients} destinatários?`,
            confirmText: 'Enviar',
            cancelText: 'Cancelar',
            variant: 'info',
            onConfirm: async () => {
                router.post(route('broadcasts.send', broadcast.id));
            },
        });
    };

    const handleCancel = (broadcast: Broadcast) => {
        confirm({
            title: 'Cancelar Broadcast',
            message: `Tem certeza que deseja cancelar o broadcast "${broadcast.name}"?`,
            confirmText: 'Cancelar Broadcast',
            cancelText: 'Voltar',
            variant: 'warning',
            onConfirm: async () => {
                router.post(route('broadcasts.cancel', broadcast.id));
            },
        });
    };

    const handleDelete = (broadcast: Broadcast) => {
        confirm({
            title: 'Deletar Broadcast',
            message: `Tem certeza que deseja deletar o broadcast "${broadcast.name}"? Esta ação não pode ser desfeita.`,
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            variant: 'danger',
            onConfirm: async () => {
                router.delete(route('broadcasts.destroy', broadcast.id));
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
            draft: 'default',
            scheduled: 'info',
            processing: 'warning',
            completed: 'success',
            failed: 'error',
            cancelled: 'default',
        };

        const labels: Record<string, string> = {
            draft: 'Rascunho',
            scheduled: 'Agendado',
            processing: 'Enviando',
            completed: 'Concluído',
            failed: 'Falhou',
            cancelled: 'Cancelado',
        };

        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        const labels: Record<string, string> = {
            text: 'Texto',
            image: 'Imagem',
            video: 'Vídeo',
            document: 'Documento',
        };

        return <Badge variant="default">{labels[type]}</Badge>;
    };

    const getProgressPercentage = (broadcast: Broadcast) => {
        if (broadcast.total_recipients === 0) return 0;
        return Math.round((broadcast.sent_count / broadcast.total_recipients) * 100);
    };

    return (
        <AppLayout title="Transmissões">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">Transmissões</h1>
                        <p className="text-sm text-dark-500 mt-1">
                            Envie mensagens em massa para seus contatos
                        </p>
                    </div>
                    <Button variant="primary" onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Transmissão
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar por nome..."
                                        className="w-full pl-10 pr-4 py-2 border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        handleFilterChange('status', e.target.value);
                                    }}
                                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="all">Todos os status</option>
                                    <option value="draft">Rascunho</option>
                                    <option value="scheduled">Agendado</option>
                                    <option value="processing">Enviando</option>
                                    <option value="completed">Concluído</option>
                                    <option value="failed">Falhou</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => {
                                        setTypeFilter(e.target.value);
                                        handleFilterChange('message_type', e.target.value);
                                    }}
                                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="all">Todos os tipos</option>
                                    <option value="text">Texto</option>
                                    <option value="image">Imagem</option>
                                    <option value="video">Vídeo</option>
                                    <option value="document">Documento</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Broadcasts List */}
                <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700">
                    {broadcasts.data.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-100 dark:bg-dark-700 mb-4">
                                <Send className="w-8 h-8 text-dark-400" />
                            </div>
                            <h3 className="text-lg font-medium text-dark-900 dark:text-dark-50 mb-2">
                                Nenhuma transmissão encontrada
                            </h3>
                            <p className="text-dark-500 mb-4">
                                Comece criando sua primeira transmissão em massa.
                            </p>
                            <Button variant="primary" onClick={handleCreate}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Transmissão
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-dark-200 dark:divide-dark-700">
                            {broadcasts.data.map((broadcast) => (
                                <div key={broadcast.id} className="p-6 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                                    {broadcast.name}
                                                </h3>
                                                {getStatusBadge(broadcast.status)}
                                                {getTypeBadge(broadcast.message_type)}
                                            </div>

                                            {/* Stats */}
                                            <BroadcastStats broadcast={broadcast} />

                                            {/* Scheduled Date */}
                                            {broadcast.scheduled_at && (
                                                <p className="text-sm text-dark-500 mt-2">
                                                    Agendado para: {new Date(broadcast.scheduled_at).toLocaleString('pt-BR')}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 ml-4">
                                            {broadcast.status === 'draft' && (
                                                <>
                                                    <button
                                                        onClick={() => handleSend(broadcast)}
                                                        className="p-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                                        title="Enviar"
                                                    >
                                                        <Send className="w-4 h-4 text-dark-500 hover:text-primary-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(broadcast)}
                                                        className="p-2 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4 text-dark-500" />
                                                    </button>
                                                </>
                                            )}

                                            {(broadcast.status === 'processing' || broadcast.status === 'scheduled') && (
                                                <button
                                                    onClick={() => handleCancel(broadcast)}
                                                    className="p-2 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                                                    title="Cancelar"
                                                >
                                                    <XCircle className="w-4 h-4 text-dark-500 hover:text-orange-600" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => router.visit(route('broadcasts.show', broadcast.id))}
                                                className="p-2 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                                                title="Visualizar"
                                            >
                                                <Eye className="w-4 h-4 text-dark-500" />
                                            </button>

                                            {['draft', 'cancelled', 'completed'].includes(broadcast.status) && (
                                                <button
                                                    onClick={() => handleDelete(broadcast)}
                                                    className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Deletar"
                                                >
                                                    <Trash2 className="w-4 h-4 text-dark-500 hover:text-red-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {broadcasts.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-dark-200 dark:border-dark-700">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-dark-500">
                                    Mostrando {broadcasts.data.length} de {broadcasts.total} transmissões
                                </p>
                                <div className="flex gap-2">
                                    {Array.from({ length: broadcasts.last_page }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => router.get(route('broadcasts.index', { page, ...filters }))}
                                            className={`px-3 py-1 rounded text-sm ${
                                                page === broadcasts.current_page
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <BroadcastModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                broadcast={selectedBroadcast}
            />

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
                    variant={options.variant}
                    isLoading={isLoading}
                />
            )}
        </AppLayout>
    );
}
