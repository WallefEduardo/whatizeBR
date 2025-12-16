import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import VirtualizedTable from '@/Components/Common/VirtualizedTable';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, MessageSquare, Image, Video, FileText } from 'lucide-react';
import QuickReplyModal from './Partials/QuickReplyModal';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';

interface QuickReply {
    id: string;
    shortcut: string;
    message: string;
    media_url?: string;
    media_type?: 'image' | 'video' | 'audio' | 'document';
    created_at: string;
    updated_at: string;
}

interface Props {
    quickReplies: {
        data: QuickReply[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ quickReplies, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuickReply, setEditingQuickReply] = useState<QuickReply | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/quick-replies', { search }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleEdit = (quickReply: QuickReply) => {
        setEditingQuickReply(quickReply);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeletingId(id);
    };

    const confirmDelete = () => {
        if (!deletingId) return;

        setIsDeleting(true);
        router.delete(`/quick-replies/${deletingId}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeletingId(null);
            },
        });
    };

    const getMediaIcon = (mediaType?: string) => {
        switch (mediaType) {
            case 'image':
                return <Image className="w-4 h-4 text-blue-500" />;
            case 'video':
                return <Video className="w-4 h-4 text-purple-500" />;
            case 'document':
                return <FileText className="w-4 h-4 text-orange-500" />;
            default:
                return <MessageSquare className="w-4 h-4 text-dark-500" />;
        }
    };

    return (
        <AppLayout
            title="Respostas Rápidas"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Respostas Rápidas', href: '/quick-replies' },
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                            Respostas Rápidas
                        </h1>
                        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                            Gerencie atalhos para mensagens frequentes
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingQuickReply(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Resposta Rápida
                    </Button>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Buscar
                        </Button>
                        {search && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setSearch('');
                                    router.get('/quick-replies');
                                }}
                            >
                                Limpar
                            </Button>
                        )}
                    </form>
                </div>

                {/* Table */}
                {quickReplies.data.length === 0 ? (
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 px-4 py-12 text-center text-dark-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-dark-300 dark:text-dark-600" />
                        <p className="text-sm">
                            {search
                                ? 'Nenhuma resposta rápida encontrada'
                                : 'Nenhuma resposta rápida cadastrada'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 overflow-hidden">
                        <VirtualizedTable
                            columns={[
                                {
                                    key: 'shortcut',
                                    label: 'Atalho',
                                    width: '150px',
                                    render: (quickReply: QuickReply) => (
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 font-mono text-xs">
                                            /{quickReply.shortcut}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'message',
                                    label: 'Mensagem',
                                    render: (quickReply: QuickReply) => (
                                        <div className="max-w-md truncate text-dark-900 dark:text-dark-100">
                                            {quickReply.message}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'media',
                                    label: 'Mídia',
                                    width: '120px',
                                    render: (quickReply: QuickReply) => (
                                        <div className="flex items-center gap-1">
                                            {getMediaIcon(quickReply.media_type)}
                                            {quickReply.media_type && (
                                                <span className="text-xs text-dark-500 capitalize">
                                                    {quickReply.media_type}
                                                </span>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'actions',
                                    label: 'Ações',
                                    width: '100px',
                                    render: (quickReply: QuickReply) => (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(quickReply)}
                                                className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4 text-dark-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quickReply.id)}
                                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Deletar"
                                            >
                                                <Trash2 className="w-4 h-4 text-dark-500 hover:text-red-600" />
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            data={quickReplies.data}
                            keyExtractor={(quickReply) => quickReply.id}
                            rowHeight={64}
                            containerHeight={600}
                            emptyMessage="Nenhuma resposta rápida encontrada"
                        />
                    </div>
                )}

                    {/* Pagination */}
                    {quickReplies.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                            <div className="text-sm text-dark-500">
                                Mostrando {quickReplies.data.length} de {quickReplies.total}{' '}
                                respostas
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: quickReplies.last_page }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                router.get('/quick-replies', {
                                                    page,
                                                    search,
                                                })
                                            }
                                            className={`px-3 py-1 rounded text-sm transition-colors ${
                                                page === quickReplies.current_page
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <QuickReplyModal
                show={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingQuickReply(null);
                }}
                quickReply={editingQuickReply}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                show={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                title="Deletar Resposta Rápida"
                message="Tem certeza que deseja deletar esta resposta rápida? Esta ação não pode ser desfeita."
                confirmText="Deletar"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isDeleting}
            />
        </AppLayout>
    );
}
