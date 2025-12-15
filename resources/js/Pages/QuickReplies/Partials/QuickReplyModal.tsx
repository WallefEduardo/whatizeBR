import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Textarea from '@/Components/UI/Textarea';
import Select from '@/Components/UI/Select';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';

interface QuickReply {
    id: string;
    shortcut: string;
    message: string;
    media_url?: string;
    media_type?: 'image' | 'video' | 'audio' | 'document';
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    quickReply?: QuickReply | null;
}

export default function QuickReplyModal({ isOpen, onClose, quickReply }: Props) {
    const [formData, setFormData] = useState({
        shortcut: '',
        message: '',
        media_url: '',
        media_type: '' as '' | 'image' | 'video' | 'audio' | 'document',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (quickReply) {
            setFormData({
                shortcut: quickReply.shortcut,
                message: quickReply.message,
                media_url: quickReply.media_url || '',
                media_type: quickReply.media_type || '',
            });
        } else {
            setFormData({
                shortcut: '',
                message: '',
                media_url: '',
                media_type: '',
            });
        }
        setErrors({});
    }, [quickReply, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = quickReply
            ? `/quick-replies/${quickReply.id}`
            : '/quick-replies';

        const method = quickReply ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                setFormData({
                    shortcut: '',
                    message: '',
                    media_url: '',
                    media_type: '',
                });
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const mediaTypeOptions = [
        { value: '', label: 'Nenhuma' },
        { value: 'image', label: 'Imagem' },
        { value: 'video', label: 'Vídeo' },
        { value: 'audio', label: 'Áudio' },
        { value: 'document', label: 'Documento' },
    ];

    return (
        <Modal
            show={isOpen}
            onClose={onClose}
            maxWidth="2xl"
        >
            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-dark-200 dark:border-dark-700 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-primary-500/10">
                            <MessageSquare className="w-5 h-5 text-primary-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                            {quickReply ? 'Editar Resposta Rápida' : 'Nova Resposta Rápida'}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4">
                    {/* Shortcut */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            Atalho <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
                                /
                            </span>
                            <Input
                                type="text"
                                value={formData.shortcut}
                                onChange={(e) =>
                                    setFormData({ ...formData, shortcut: e.target.value })
                                }
                                required
                                className="pl-7"
                                error={errors.shortcut}
                            />
                        </div>
                        {errors.shortcut && (
                            <p className="text-sm text-red-600 mt-1">{errors.shortcut}</p>
                        )}
                        <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                            Digite o atalho sem a barra inicial. Ex: ola
                        </p>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            Mensagem <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            value={formData.message}
                            onChange={(e) =>
                                setFormData({ ...formData, message: e.target.value })
                            }
                            required
                            rows={4}
                            error={errors.message}
                        />
                        {errors.message && (
                            <p className="text-sm text-red-600 mt-1">{errors.message}</p>
                        )}
                    </div>

                    {/* Media Type */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            Tipo de Mídia
                        </label>
                        <Select
                            value={formData.media_type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    media_type: e.target.value as any,
                                })
                            }
                            options={mediaTypeOptions}
                        />
                    </div>

                    {/* Media URL */}
                    {formData.media_type && (
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                URL da Mídia
                            </label>
                            <Input
                                type="url"
                                value={formData.media_url}
                                onChange={(e) =>
                                    setFormData({ ...formData, media_url: e.target.value })
                                }
                                error={errors.media_url}
                            />
                            {errors.media_url && (
                                <p className="text-sm text-red-600 mt-1">{errors.media_url}</p>
                            )}
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                Cole a URL completa da mídia
                            </p>
                        </div>
                    )}

                    {/* Preview */}
                    {formData.message && (
                        <div className="mt-6 pt-4 border-t border-dark-200 dark:border-dark-700">
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Preview
                            </label>
                            <div className="bg-dark-50 dark:bg-dark-900 rounded p-4 border border-dark-200 dark:border-dark-700">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">EU</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-white dark:bg-dark-800 rounded px-3 py-2 border border-dark-200 dark:border-dark-700">
                                            <p className="text-sm text-dark-900 dark:text-dark-50 whitespace-pre-wrap break-words">
                                                {formData.message}
                                            </p>
                                            {formData.media_type && formData.media_url && (
                                                <div className="mt-2 text-xs text-dark-500">
                                                    <span className="inline-flex items-center px-2 py-1 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400">
                                                        {formData.media_type.charAt(0).toUpperCase() +
                                                            formData.media_type.slice(1)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-dark-400 mt-1">
                                            Agora
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-dark-50 dark:bg-dark-900 border-t border-dark-200 dark:border-dark-700 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>
                        {quickReply ? 'Atualizar' : 'Criar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
