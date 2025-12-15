import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Filter, MessageSquare, Calendar, AlertCircle, Settings, Users, Clock, Send } from 'lucide-react';
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

type Step = 'config' | 'recipients' | 'schedule' | 'review';

export default function BroadcastModal({ isOpen, onClose, broadcast }: Props) {
    const [currentStep, setCurrentStep] = useState<Step>('config');
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
        setCurrentStep('config');
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

    const handleSubmit = () => {
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

    const steps = [
        { id: 'config' as Step, label: 'Configuração', icon: Settings },
        { id: 'recipients' as Step, label: 'Destinatários', icon: Users },
        { id: 'schedule' as Step, label: 'Agendamento', icon: Clock },
        { id: 'review' as Step, label: 'Finalizar', icon: Send },
    ];

    const getStepIndex = (step: Step) => steps.findIndex(s => s.id === step);

    const canGoNext = () => {
        if (currentStep === 'config') {
            return name.trim() !== '' && messageContent.trim() !== '';
        }
        if (currentStep === 'recipients') {
            return recipientCount > 0;
        }
        return true;
    };

    const handleNext = () => {
        const currentIndex = getStepIndex(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1].id);
        }
    };

    const handleBack = () => {
        const currentIndex = getStepIndex(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1].id);
        }
    };

    return (
        <Modal
            show={isOpen}
            onClose={onClose}
            title={broadcast ? 'Editar Transmissão' : 'Nova Transmissão'}
            maxWidth="4xl"
        >
            <div className="flex gap-6 min-h-[500px]">
                {/* Sidebar - Steps */}
                <div className="w-64 flex-shrink-0 bg-dark-50 dark:bg-dark-900 rounded-lg p-4">
                    <div className="space-y-2">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = getStepIndex(currentStep) > index;

                            return (
                                <button
                                    key={step.id}
                                    type="button"
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                        isActive
                                            ? 'bg-primary-500 text-white'
                                            : isCompleted
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium text-sm">{step.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-2">
                        {/* Step 1: Configuração */}
                        {currentStep === 'config' && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-1">
                                        1. Configuração
                                    </h2>
                                    <p className="text-sm text-dark-500">
                                        Configure o nome e o conteúdo da transmissão
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        Nome da Transmissão <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                            <MessageSquare className="w-4 h-4 inline mr-2" />
                                            Tipo de Mensagem
                                        </label>
                                        <Select
                                            value={messageType}
                                            onChange={(e) => setMessageType(e.target.value as any)}
                                            required
                                            options={[
                                                { value: 'text', label: 'Texto' },
                                                { value: 'image', label: 'Imagem' },
                                                { value: 'video', label: 'Vídeo' },
                                                { value: 'document', label: 'Documento' },
                                            ]}
                                        />
                                    </div>

                                    {messageType !== 'text' && (
                                        <div>
                                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                                URL da Mídia
                                            </label>
                                            <Input
                                                type="url"
                                                value={mediaUrl}
                                                onChange={(e) => setMediaUrl(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        Conteúdo da Mensagem <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        rows={6}
                                    />
                                </div>

                                {(messageContent || mediaUrl) && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                                                Preview da Mensagem
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPreview(!showPreview)}
                                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                            >
                                                {showPreview ? 'Ocultar' : 'Mostrar'}
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
                            </div>
                        )}

                        {/* Step 2: Destinatários */}
                        {currentStep === 'recipients' && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-1">
                                        2. Destinatários
                                    </h2>
                                    <p className="text-sm text-dark-500">
                                        Selecione os destinatários usando filtros
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                                            <Filter className="w-4 h-4 inline mr-2" />
                                            Filtros de Destinatários
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
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

                                    <RecipientPreview
                                        count={recipientCount}
                                        filters={filters}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Agendamento */}
                        {currentStep === 'schedule' && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-1">
                                        3. Agendamento
                                    </h2>
                                    <p className="text-sm text-dark-500">
                                        Escolha quando a transmissão será enviada
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Agendar Envio
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledAt}
                                        onChange={(e) => setScheduledAt(e.target.value)}
                                        className="w-full px-4 py-2 border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-dark-500 mt-2">
                                        Deixe em branco para salvar como rascunho
                                    </p>
                                </div>

                                {recipientCount > 0 && (
                                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
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
                                )}
                            </div>
                        )}

                        {/* Step 4: Finalizar */}
                        {currentStep === 'review' && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-1">
                                        4. Revisar e Finalizar
                                    </h2>
                                    <p className="text-sm text-dark-500">
                                        Revise as informações antes de criar a transmissão
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-dark-50 dark:bg-dark-900 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">
                                            Configuração
                                        </h3>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-dark-500">Nome:</dt>
                                                <dd className="text-dark-900 dark:text-dark-50 font-medium">{name}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-dark-500">Tipo:</dt>
                                                <dd className="text-dark-900 dark:text-dark-50 font-medium">
                                                    {messageType === 'text' && 'Texto'}
                                                    {messageType === 'image' && 'Imagem'}
                                                    {messageType === 'video' && 'Vídeo'}
                                                    {messageType === 'document' && 'Documento'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-dark-500 mb-1">Mensagem:</dt>
                                                <dd className="text-dark-900 dark:text-dark-50 bg-white dark:bg-dark-800 p-3 rounded">
                                                    {messageContent}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="bg-dark-50 dark:bg-dark-900 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">
                                            Destinatários
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-primary-600" />
                                            <span className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                                                {recipientCount}
                                            </span>
                                            <span className="text-sm text-dark-500">
                                                {recipientCount === 1 ? 'destinatário' : 'destinatários'}
                                            </span>
                                        </div>
                                    </div>

                                    {scheduledAt && (
                                        <div className="bg-dark-50 dark:bg-dark-900 rounded-lg p-4">
                                            <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">
                                                Agendamento
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-primary-600" />
                                                <span className="text-sm text-dark-900 dark:text-dark-50">
                                                    {new Date(scheduledAt).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Navigation */}
                    <div className="flex justify-between items-center pt-5 mt-5 border-t border-dark-200 dark:border-dark-700">
                        <div>
                            {currentStep !== 'config' && (
                                <Button type="button" variant="secondary" onClick={handleBack}>
                                    Voltar
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>
                                Cancelar
                            </Button>

                            {currentStep !== 'review' ? (
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleNext}
                                    disabled={!canGoNext()}
                                >
                                    Continuar
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleSubmit}
                                    isLoading={isSubmitting}
                                    disabled={recipientCount === 0}
                                >
                                    {broadcast ? 'Atualizar' : 'Criar'} Transmissão
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
