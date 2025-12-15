import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';
import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Clock, Calendar, Repeat, MessageSquare, Users, X } from 'lucide-react';
import DateTimePicker from './DateTimePicker';
import MessagePreview from './MessagePreview';

interface Schedule {
    id: string;
    name: string;
    type: 'daily' | 'weekly' | 'monthly' | 'once';
    scheduled_at: string;
    recipients: string[];
    message_type: 'text' | 'image' | 'video' | 'document';
    message_content: string | null;
    media_url: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    schedule?: Schedule | null;
}

export default function ScheduleModal({ isOpen, onClose, schedule }: Props) {
    const { props } = usePage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data
    const [name, setName] = useState('');
    const [type, setType] = useState<'daily' | 'weekly' | 'monthly' | 'once'>('once');
    const [scheduledAt, setScheduledAt] = useState('');
    const [recipients, setRecipients] = useState<string[]>([]);
    const [recipientInput, setRecipientInput] = useState('');
    const [messageType, setMessageType] = useState<'text' | 'image' | 'video' | 'document'>('text');
    const [messageContent, setMessageContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');

    // Load schedule data if editing
    useEffect(() => {
        if (schedule) {
            setName(schedule.name);
            setType(schedule.type);
            setScheduledAt(schedule.scheduled_at);
            setRecipients(schedule.recipients);
            setMessageType(schedule.message_type);
            setMessageContent(schedule.message_content || '');
            setMediaUrl(schedule.media_url || '');
        } else {
            resetForm();
        }
    }, [schedule]);

    const resetForm = () => {
        setName('');
        setType('once');
        setScheduledAt('');
        setRecipients([]);
        setRecipientInput('');
        setMessageType('text');
        setMessageContent('');
        setMediaUrl('');
    };

    const handleAddRecipient = () => {
        const phone = recipientInput.trim();
        if (phone && !recipients.includes(phone)) {
            setRecipients([...recipients, phone]);
            setRecipientInput('');
        }
    };

    const handleRemoveRecipient = (phone: string) => {
        setRecipients(recipients.filter((r) => r !== phone));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            instance_id: 'temp-instance-id', // TODO: Get from user's active instance
            name,
            type,
            scheduled_at: scheduledAt,
            recipients,
            message_type: messageType,
            message_content: messageContent || null,
            media_url: mediaUrl || null,
        };

        if (schedule) {
            router.put(route('schedules.update', schedule.id), data, {
                onSuccess: () => {
                    onClose();
                    resetForm();
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('schedules.store'), data, {
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
            title={schedule ? 'Editar Agendamento' : 'Novo Agendamento'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                        Nome do Agendamento
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Lembrete semanal"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            <Repeat className="w-4 h-4 inline mr-2" />
                            Tipo de Recorrência
                        </label>
                        <Select value={type} onChange={(e) => setType(e.target.value as any)} required>
                            <option value="once">Único</option>
                            <option value="daily">Diário</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensal</option>
                        </Select>
                    </div>

                    {/* Data/Hora */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            <Clock className="w-4 h-4 inline mr-2" />
                            Data e Hora
                        </label>
                        <DateTimePicker
                            value={scheduledAt}
                            onChange={setScheduledAt}
                            required
                        />
                    </div>
                </div>

                {/* Destinatários */}
                <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                        <Users className="w-4 h-4 inline mr-2" />
                        Destinatários ({recipients.length})
                    </label>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                                value={recipientInput}
                                onChange={(e) => setRecipientInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRecipient())}
                                placeholder="Digite o telefone (com DDD)"
                                className="flex-1"
                            />
                            <Button type="button" onClick={handleAddRecipient} variant="secondary">
                                Adicionar
                            </Button>
                        </div>

                        {recipients.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-dark-50 dark:bg-dark-900 rounded border border-dark-200 dark:border-dark-700 max-h-32 overflow-y-auto">
                                {recipients.map((phone) => (
                                    <span
                                        key={phone}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded text-sm"
                                    >
                                        {phone}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRecipient(phone)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
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

                {/* Preview */}
                {(messageContent || mediaUrl) && (
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            Preview da Mensagem
                        </label>
                        <MessagePreview
                            type={messageType}
                            content={messageContent}
                            mediaUrl={mediaUrl}
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>
                        {schedule ? 'Atualizar' : 'Criar'} Agendamento
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
