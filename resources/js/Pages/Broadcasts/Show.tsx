import AppLayout from '@/Components/Layout/AppLayout';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import { router } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, MessageSquare, Send, XCircle, CheckCircle, Eye, Clock } from 'lucide-react';
import BroadcastStats from './Partials/BroadcastStats';

interface BroadcastMessage {
    id: string;
    contact: {
        name: string;
        phone: string;
    };
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    error_message: string | null;
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
    failed_at: string | null;
}

interface Broadcast {
    id: string;
    name: string;
    message_type: 'text' | 'image' | 'video' | 'document';
    message_content: string | null;
    media_url: string | null;
    status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
    scheduled_at: string | null;
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    read_count: number;
    failed_count: number;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    user: {
        name: string;
    };
    messages: BroadcastMessage[];
}

interface Props {
    broadcast: Broadcast;
}

export default function BroadcastShow({ broadcast }: Props) {
    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
            pending: 'default',
            sent: 'info',
            delivered: 'success',
            read: 'success',
            failed: 'error',
        };

        const labels: Record<string, string> = {
            pending: 'Pendente',
            sent: 'Enviado',
            delivered: 'Entregue',
            read: 'Lido',
            failed: 'Falhou',
        };

        return <Badge variant={variants[status]} size="sm">{labels[status]}</Badge>;
    };

    const getMessageStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            pending: <Clock className="w-4 h-4 text-dark-400" />,
            sent: <Send className="w-4 h-4 text-blue-600" />,
            delivered: <CheckCircle className="w-4 h-4 text-green-600" />,
            read: <Eye className="w-4 h-4 text-purple-600" />,
            failed: <XCircle className="w-4 h-4 text-red-600" />,
        };

        return icons[status];
    };

    return (
        <AppLayout title={`Transmissão: ${broadcast.name}`}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.visit(route('broadcasts.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">{broadcast.name}</h1>
                        <p className="text-sm text-dark-500 mt-1">
                            Criado por {broadcast.user.name} em {new Date(broadcast.created_at).toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>

                {/* Main Info Card */}
                <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-dark-500 block mb-1">Tipo de Mensagem</label>
                                <p className="text-dark-900 dark:text-dark-50 font-medium">
                                    {broadcast.message_type === 'text' && 'Texto'}
                                    {broadcast.message_type === 'image' && 'Imagem'}
                                    {broadcast.message_type === 'video' && 'Vídeo'}
                                    {broadcast.message_type === 'document' && 'Documento'}
                                </p>
                            </div>

                            {broadcast.message_content && (
                                <div>
                                    <label className="text-sm text-dark-500 block mb-1">Conteúdo</label>
                                    <div className="bg-dark-50 dark:bg-dark-900 rounded p-3 text-sm text-dark-900 dark:text-dark-50 whitespace-pre-wrap">
                                        {broadcast.message_content}
                                    </div>
                                </div>
                            )}

                            {broadcast.media_url && (
                                <div>
                                    <label className="text-sm text-dark-500 block mb-1">URL da Mídia</label>
                                    <a
                                        href={broadcast.media_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:text-primary-700 text-sm underline"
                                    >
                                        {broadcast.media_url}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {broadcast.scheduled_at && (
                                <div>
                                    <label className="text-sm text-dark-500 block mb-1">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Agendado para
                                    </label>
                                    <p className="text-dark-900 dark:text-dark-50 font-medium">
                                        {new Date(broadcast.scheduled_at).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            )}

                            {broadcast.started_at && (
                                <div>
                                    <label className="text-sm text-dark-500 block mb-1">Iniciado em</label>
                                    <p className="text-dark-900 dark:text-dark-50 font-medium">
                                        {new Date(broadcast.started_at).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            )}

                            {broadcast.completed_at && (
                                <div>
                                    <label className="text-sm text-dark-500 block mb-1">Concluído em</label>
                                    <p className="text-dark-900 dark:text-dark-50 font-medium">
                                        {new Date(broadcast.completed_at).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                    <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                        Estatísticas de Envio
                    </h2>
                    <BroadcastStats broadcast={broadcast} />
                </div>

                {/* Messages List */}
                {broadcast.messages && broadcast.messages.length > 0 && (
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700">
                        <div className="px-6 py-4 border-b border-dark-200 dark:border-dark-700">
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                Mensagens Enviadas ({broadcast.messages.length})
                            </h2>
                        </div>

                        <div className="divide-y divide-dark-200 dark:divide-dark-700">
                            {broadcast.messages.map((message) => (
                                <div key={message.id} className="px-6 py-4 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            {getMessageStatusIcon(message.status)}
                                            <div>
                                                <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                                                    {message.contact.name || 'Sem nome'}
                                                </p>
                                                <p className="text-xs text-dark-500">
                                                    {message.contact.phone}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(message.status)}

                                            {message.sent_at && (
                                                <span className="text-xs text-dark-500">
                                                    {new Date(message.sent_at).toLocaleTimeString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {message.error_message && (
                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                            <p className="text-xs text-red-700 dark:text-red-300">
                                                Erro: {message.error_message}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
