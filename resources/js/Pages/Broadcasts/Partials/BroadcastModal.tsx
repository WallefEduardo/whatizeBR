import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';
import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Filter, Users, MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import FilterSelector from './FilterSelector';
import RecipientPreview from './RecipientPreview';
import MessagePreview from '@/Pages/Schedules/Partials/MessagePreview';

interface Broadcast {
    id: string;
    name: string;
    filters: {
        tags?: string[];
        departments?: string[];
        exclude_blocked?: boolean;
    } | null;
    message_type: 'text' | 'image' | 'video' | 'document';
    message_content: string | null;
    media_url: string | null;
    scheduled_at: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    broadcast?: Broadcast | null;
}

export default function BroadcastModal({ isOpen, onClose, broadcast }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Form data
    const [name, setName] = useState('');
    const [filters, setFilters] = useState<{
        tags: string[];
        departments: string[];
        exclude_blocked: boolean;
    }>({
        tags: [],
        departments: [],
        exclude_blocked: true,
    });
    const [messageType, setMessageType] = useState<'text' | 'image' | 'video' | 'document'>('text');
    const [messageContent, setMessageContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [recipientCount, setRecipientCount] = useState(0);

    // Load broadcast data if editing
    useEffect(() => {
        if (broadcast) {
            setName(broadcast.name);
            setFilters({
                tags: broadcast.filters?.tags || [],
                departments: broadcast.filters?.departments || [],
                exclude_blocked: broadcast.filters?.exclude_blocked ?? true,
            });
            setMessageType(broadcast.message_type);
            setMessageContent(broadcast.message_content || '');
            setMediaUrl(broadcast.media_url || '');
            setScheduledAt(broadcast.scheduled_at || '');
        } else {
            resetForm();
        }
    }, [broadcast]);

    // Fetch recipient count when filters change
    useEffect(() => {
        if (isOpen) {
            fetchRecipientCount();
        }
    }, [filters, isOpen]);

    const resetForm = () => {
        setName('');
        setFilters({
            tags: [],
            departments: [],
            exclude_blocked: true,
        });
        setMessageType('text');
        setMessageContent('');
        setMediaUrl('');
        setScheduledAt('');
        setRecipientCount(0);
        setShowFilters(false);
        setShowPreview(false);
    };

    const fetchRecipientCount = async () => {
        try {
            const response = await fetch(route('broadcasts.preview'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ filters }),
            });

            if (response.ok) {
                const data = await response.json();
                setRecipientCount(data.recipient_count);
            }
        } catch (error) {
            console.error('Error fetching recipient count:', error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            name,
            filters,
            message_type: messageType,
            message_content: messageContent || null,
            media_url: mediaUrl || null,
            scheduled_at: scheduledAt || null,
        };

        if (broadcast) {
            router.put(route('broadcasts.update', broadcast.id), data, {
                onSuccess: () => {
                    onClose();
                    resetForm();
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('broadcasts.store'), data, {
                onSuccess: () => {
                    onClose();
                    resetForm();
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={broadcast ? 'Editar Transmissão' : 'Nova Transmissão'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                        Nome da Transmissão
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Promoção Black Friday"
                        required
                    />
                </div>

                {/* Filtros de Destinatários */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                            <Filter className="w-4 h-4 inline mr-2" />
                            Filtros de Destinatários
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            {showFilters ? 'Ocultar filtros' : 'Configurar filtros'}
                        </button>
                    </div>

                    {showFilters && (
                        <FilterSelector
                            filters={filters}
                            onChange={setFilters}
                        />
                    )}

                    {/* Recipient Preview */}
                    <RecipientPreview
                        count={recipientCount}
                        filters={filters}
                    />
                </div>

                {/* Tipo de Mensagem */}
                <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Tipo de Mensagem
                    </label>
                    <Select
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value as any)}
                        required
                    >
                        <option value="text">Texto</option>
                        <option value="image">Imagem</option>
                        <option value="video">Vídeo</option>
                        <option value="document">Documento</option>
                    </Select>
                </div>

                {/* Conteúdo da Mensagem */}
                <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                        Conteúdo da Mensagem
                    </label>
                    <Textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Digite a mensagem..."
                        rows={4}
                    />
                </div>

                {/* URL de Mídia (se não for texto) */}
                {messageType !== 'text' && (
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            URL da Mídia
                        </label>
                        <Input
                            type="url"
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                            placeholder="https://exemplo.com/arquivo.jpg"
                        />
                    </div>
                )}

                {/* Preview da Mensagem */}
                {(messageContent || mediaUrl) && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                                Preview da Mensagem
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                {showPreview ? 'Ocultar preview' : 'Mostrar preview'}
                            </button>
                        </div>
                        {showPreview && (
                            <MessagePreview
                                type={messageType}
                                content={messageContent}
                                mediaUrl={mediaUrl}
                            />
                        )}
                    </div>
                )}

                {/* Agendamento (Opcional) */}
                <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Agendar Envio (Opcional)
                    </label>
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full px-4 py-2 border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-dark-500 mt-1">
                        Deixe em branco para salvar como rascunho
                    </p>
                </div>

                {/* Warning sobre rate limit */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-900 dark:text-orange-200">
                            <p className="font-medium mb-1">Atenção: Rate Limit</p>
                            <p>
                                As mensagens serão enviadas com intervalo de 6 segundos entre cada contato
                                para respeitar os limites do WhatsApp. Para {recipientCount} destinatários,
                                o envio completo levará aproximadamente{' '}
                                <strong>{Math.ceil((recipientCount * 6) / 60)} minutos</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                        disabled={recipientCount === 0}
                    >
                        {broadcast ? 'Atualizar' : 'Criar'} Transmissão
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
