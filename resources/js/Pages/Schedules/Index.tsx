import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import VirtualizedTable from '@/Components/Common/VirtualizedTable';
import { Calendar, Clock, Users, Plus, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import ScheduleModal from './Partials/ScheduleModal';

interface Schedule {
    id: string;
    name: string;
    type: 'daily' | 'weekly' | 'monthly' | 'once';
    scheduled_at: string;
    recipients: string[];
    message_type: 'text' | 'image' | 'video' | 'document';
    message_content: string | null;
    media_url: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    sent_count: number;
    failed_count: number;
    created_at: string;
}

interface Props {
    schedules: {
        data: Schedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
        type?: string;
        search?: string;
    };
}

export default function Index({ schedules, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    const handleSearch = () => {
        router.get(
            route('schedules.index'),
            { search, status: statusFilter, type: typeFilter },
            { preserveState: true }
        );
    };

    const handleCancel = (scheduleId: string) => {
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            router.post(route('schedules.cancel', scheduleId));
        }
    };

    const handleDelete = (scheduleId: string) => {
        if (confirm('Tem certeza que deseja deletar este agendamento?')) {
            router.delete(route('schedules.destroy', scheduleId));
        }
    };

    const getStatusBadge = (status: Schedule['status']) => {
        const variants = {
            pending: { variant: 'info' as const, label: 'Pendente' },
            processing: { variant: 'warning' as const, label: 'Processando' },
            completed: { variant: 'success' as const, label: 'Concluído' },
            failed: { variant: 'danger' as const, label: 'Falhou' },
            cancelled: { variant: 'default' as const, label: 'Cancelado' },
        };
        return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
    };

    const getTypeBadge = (type: Schedule['type']) => {
        const labels = {
            daily: 'Diário',
            weekly: 'Semanal',
            monthly: 'Mensal',
            once: 'Único',
        };
        return <Badge variant="default">{labels[type]}</Badge>;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout title="Agendamentos">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                            Agendamentos
                        </h1>
                        <p className="text-sm text-dark-500 mt-1">
                            Gerencie mensagens agendadas e recorrentes
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Agendamento
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2 border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Todos os status</option>
                                <option value="pending">Pendente</option>
                                <option value="processing">Processando</option>
                                <option value="completed">Concluído</option>
                                <option value="failed">Falhou</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Todos os tipos</option>
                                <option value="once">Único</option>
                                <option value="daily">Diário</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensal</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button variant="primary" size="sm" onClick={handleSearch}>
                            <Filter className="w-4 h-4 mr-2" />
                            Filtrar
                        </Button>
                    </div>
                </div>

                {/* Schedules List */}
                {schedules.data.length === 0 ? (
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-12 text-center">
                        <Calendar className="w-12 h-12 text-dark-300 mx-auto mb-4" />
                        <p className="text-dark-500">Nenhum agendamento encontrado</p>
                        <Button
                            variant="primary"
                            maxWidth="sm"
                            className="mt-4"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Criar primeiro agendamento
                        </Button>
                    </div>
                ) : (
                    <VirtualizedTable
                        columns={[
                            {
                                key: 'name',
                                label: 'Nome',
                                render: (schedule: Schedule) => (
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                                                {schedule.name}
                                            </p>
                                            <p className="text-xs text-dark-500">
                                                {schedule.message_type === 'text'
                                                    ? 'Texto'
                                                    : schedule.message_type === 'image'
                                                    ? 'Imagem'
                                                    : schedule.message_type === 'video'
                                                    ? 'Vídeo'
                                                    : 'Documento'}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'type',
                                label: 'Tipo',
                                width: '120px',
                                render: (schedule: Schedule) => getTypeBadge(schedule.type),
                            },
                            {
                                key: 'scheduled_at',
                                label: 'Agendado para',
                                width: '180px',
                                render: (schedule: Schedule) => (
                                    <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                                        <Clock className="w-4 h-4" />
                                        {formatDate(schedule.scheduled_at)}
                                    </div>
                                ),
                            },
                            {
                                key: 'recipients',
                                label: 'Destinatários',
                                width: '120px',
                                render: (schedule: Schedule) => (
                                    <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                                        <Users className="w-4 h-4" />
                                        {schedule.recipients.length}
                                    </div>
                                ),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                width: '120px',
                                render: (schedule: Schedule) => getStatusBadge(schedule.status),
                            },
                            {
                                key: 'progress',
                                label: 'Progresso',
                                width: '150px',
                                render: (schedule: Schedule) =>
                                    schedule.status === 'completed' || schedule.status === 'processing' ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-dark-600 dark:text-dark-400">
                                                <span className="text-green-600">✓ {schedule.sent_count}</span>
                                                {schedule.failed_count > 0 && (
                                                    <span className="text-red-600">✗ {schedule.failed_count}</span>
                                                )}
                                            </div>
                                            <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary-500 h-1.5 rounded-full"
                                                    style={{
                                                        width: `${(schedule.sent_count / schedule.recipients.length) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-dark-400">-</span>
                                    ),
                            },
                            {
                                key: 'actions',
                                label: 'Ações',
                                width: '150px',
                                render: (schedule: Schedule) => (
                                    <div className="flex items-center gap-2">
                                        {schedule.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditingSchedule(schedule);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(schedule.id)}
                                                    className="text-sm text-orange-600 hover:text-orange-700"
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        )}
                                        {['completed', 'failed', 'cancelled'].includes(schedule.status) && (
                                            <button
                                                onClick={() => handleDelete(schedule.id)}
                                                className="text-sm text-red-600 hover:text-red-700"
                                            >
                                                Deletar
                                            </button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={schedules.data}
                        keyExtractor={(schedule) => schedule.id}
                        rowHeight={80}
                        containerHeight={600}
                        emptyMessage="Nenhum agendamento encontrado"
                    />
                )}

                {/* Pagination */}
                {schedules.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: schedules.last_page }, (_, i) => i + 1).map(
                            (page) => (
                                <button
                                    key={page}
                                    onClick={() =>
                                        router.get(route('schedules.index', { page }))
                                    }
                                    className={`px-4 py-2 rounded ${
                                        page === schedules.current_page
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 border border-dark-200 dark:border-dark-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            <ScheduleModal
                show={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSchedule(null);
                }}
                schedule={editingSchedule}
            />
        </AppLayout>
    );
}
