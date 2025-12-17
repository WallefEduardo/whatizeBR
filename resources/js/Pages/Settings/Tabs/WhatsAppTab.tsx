import { useState } from 'react'
import { Wifi, Webhook, MessageSquare, Clock, Link as LinkIcon } from 'lucide-react'
import Button from '@/Components/UI/Button'
import Input from '@/Components/UI/Input'
import Textarea from '@/Components/UI/Textarea'
import { Card } from '@/Components/UI/Card'
import Badge from '@/Components/UI/Badge'
import { SettingsData, WhatsAppInstance } from '@/types'
import InstanceManager from '@/Components/WhatsApp/InstanceManager'

interface WhatsAppTabProps {
    settings: SettingsData
    instances: WhatsAppInstance[]
    currentInstanceId: string | null
    onSave: (data: Record<string, any>) => void
    isSaving: boolean
}

const availableEvents = [
    { value: 'message.received', label: 'Mensagem Recebida' },
    { value: 'message.sent', label: 'Mensagem Enviada' },
    { value: 'message.read', label: 'Mensagem Lida' },
    { value: 'conversation.created', label: 'Conversa Criada' },
    { value: 'conversation.assigned', label: 'Conversa Atribuída' },
    { value: 'conversation.closed', label: 'Conversa Fechada' },
]

export default function WhatsAppTab({
    settings,
    instances,
    currentInstanceId,
    onSave,
    isSaving,
}: WhatsAppTabProps) {
    const [formData, setFormData] = useState({
        welcome_message: settings.welcome_message?.value || '',
        away_message: settings.away_message?.value || '',
        queue_message: settings.queue_message?.value || '',
        auto_assign_enabled: settings.auto_assign_enabled?.value || false,
        max_concurrent_chats: settings.max_concurrent_chats?.value || 5,
        auto_close_inactive_chats: settings.auto_close_inactive_chats?.value || false,
        auto_close_inactive_hours: settings.auto_close_inactive_hours?.value || 24,
        webhook_enabled: settings.webhook_enabled?.value || false,
        webhook_url: settings.webhook_url?.value || '',
        webhook_events: (settings.webhook_events?.value as string[]) || [
            'message.received',
            'message.sent',
            'message.read',
        ],
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const handleEventToggle = (event: string) => {
        setFormData((prev) => ({
            ...prev,
            webhook_events: prev.webhook_events.includes(event)
                ? prev.webhook_events.filter((e) => e !== event)
                : [...prev.webhook_events, event],
        }))
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
            connected: 'success',
            authenticated: 'success',
            connecting: 'warning',
            disconnected: 'danger',
            failed: 'danger',
        }
        return <Badge variant={variants[status] || 'info'}>{status}</Badge>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instâncias WhatsApp */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Wifi className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                            Instâncias WhatsApp
                        </h3>
                    </div>

                    <InstanceManager instances={instances} />
                </div>
            </Card>

            {/* Mensagens Padrão */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                            Mensagens Padrão
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Mensagem de Boas-vindas
                            </label>
                            <Textarea
                                value={formData.welcome_message}
                                onChange={(e) =>
                                    setFormData({ ...formData, welcome_message: e.target.value })
                                }
                                rows={3}
                                placeholder="Olá! Bem-vindo ao nosso atendimento..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Mensagem de Ausência
                            </label>
                            <Textarea
                                value={formData.away_message}
                                onChange={(e) =>
                                    setFormData({ ...formData, away_message: e.target.value })
                                }
                                rows={3}
                                placeholder="No momento estamos fora do horário de atendimento..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Mensagem de Fila
                            </label>
                            <Textarea
                                value={formData.queue_message}
                                onChange={(e) =>
                                    setFormData({ ...formData, queue_message: e.target.value })
                                }
                                rows={3}
                                placeholder="Você está na fila de atendimento..."
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Configurações de Atendimento */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                            Configurações de Atendimento
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formData.auto_assign_enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        auto_assign_enabled: e.target.checked,
                                    })
                                }
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-dark-700 dark:text-dark-300">
                                Atribuição automática de conversas
                            </span>
                        </label>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Máximo de conversas simultâneas por agente
                            </label>
                            <Input
                                type="number"
                                min="1"
                                max="50"
                                value={formData.max_concurrent_chats}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        max_concurrent_chats: parseInt(e.target.value),
                                    })
                                }
                            />
                        </div>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formData.auto_close_inactive_chats}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        auto_close_inactive_chats: e.target.checked,
                                    })
                                }
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-dark-700 dark:text-dark-300">
                                Fechar conversas inativas automaticamente
                            </span>
                        </label>

                        {formData.auto_close_inactive_chats && (
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    Fechar após (horas)
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="720"
                                    value={formData.auto_close_inactive_hours}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            auto_close_inactive_hours: parseInt(e.target.value),
                                        })
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Webhooks */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                <Webhook className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                Webhooks
                            </h3>
                        </div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.webhook_enabled}
                                onChange={(e) =>
                                    setFormData({ ...formData, webhook_enabled: e.target.checked })
                                }
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-dark-700 dark:text-dark-300">
                                Habilitar
                            </span>
                        </label>
                    </div>

                    {formData.webhook_enabled && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    URL do Webhook
                                </label>
                                <Input
                                    type="url"
                                    value={formData.webhook_url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, webhook_url: e.target.value })
                                    }
                                    placeholder="https://seu-site.com/webhook"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
                                    Eventos
                                </label>
                                <div className="space-y-2">
                                    {availableEvents.map((event) => (
                                        <label
                                            key={event.value}
                                            className="flex items-center gap-3 p-2 rounded hover:bg-dark-50 dark:hover:bg-dark-900"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.webhook_events.includes(
                                                    event.value
                                                )}
                                                onChange={() => handleEventToggle(event.value)}
                                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-dark-700 dark:text-dark-300">
                                                {event.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSaving}>
                    Salvar Configurações
                </Button>
            </div>
        </form>
    )
}
