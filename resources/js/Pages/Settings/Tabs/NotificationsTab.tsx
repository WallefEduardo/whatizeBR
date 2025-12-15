import { useState, useEffect, FormEventHandler } from 'react'
import { Bell, Volume2, Monitor, MessageSquare, UserPlus, Mail } from 'lucide-react'
import Button from '@/Components/UI/Button'
import { Card } from '@/Components/UI/Card'
import axios from 'axios'

interface NotificationsTabProps {
    // Standalone component that loads its own data
}

export default function NotificationsTab({}: NotificationsTabProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [recentlySuccessful, setRecentlySuccessful] = useState(false)
    const [formData, setFormData] = useState({
        new_message_enabled: true,
        conversation_assigned_enabled: true,
        sound_enabled: true,
        desktop_enabled: true,
        email_enabled: false,
    })

    // Load preferences on mount
    useEffect(() => {
        loadPreferences()
    }, [])

    const loadPreferences = async () => {
        try {
            const response = await axios.get('/notifications/preferences')
            setFormData({
                new_message_enabled: response.data.new_message_enabled,
                conversation_assigned_enabled: response.data.conversation_assigned_enabled,
                sound_enabled: response.data.sound_enabled,
                desktop_enabled: response.data.desktop_enabled,
                email_enabled: response.data.email_enabled,
            })
        } catch (error) {
            console.error('Failed to load notification preferences:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        setRecentlySuccessful(false)

        try {
            await axios.put('/notifications/preferences', formData)
            setRecentlySuccessful(true)
            setTimeout(() => setRecentlySuccessful(false), 3000)
        } catch (error) {
            console.error('Failed to save notification preferences:', error)
        } finally {
            setIsSaving(false)
        }
    }

    // Request desktop notification permission when enabling
    useEffect(() => {
        if (formData.desktop_enabled && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [formData.desktop_enabled])

    if (isLoading) {
        return (
            <Card>
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    Carregando preferências...
                </div>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sound Notifications */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                            Som de notificação
                        </h3>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded border border-gray-200 dark:border-gray-700">
                        <input
                            type="checkbox"
                            id="sound_enabled"
                            checked={formData.sound_enabled}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    sound_enabled: e.target.checked,
                                })
                            }
                            className="w-4 h-4 mt-1 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1">
                            <label
                                htmlFor="sound_enabled"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer"
                            >
                                Reproduzir som quando receber notificações
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Um som será reproduzido quando você receber novas mensagens ou notificações
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Desktop Notifications */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                            Notificações na área de trabalho
                        </h3>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded border border-gray-200 dark:border-gray-700">
                        <input
                            type="checkbox"
                            id="desktop_enabled"
                            checked={formData.desktop_enabled}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    desktop_enabled: e.target.checked,
                                })
                            }
                            className="w-4 h-4 mt-1 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1">
                            <label
                                htmlFor="desktop_enabled"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer"
                            >
                                Exibir notificações do navegador
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Mostrar notificações na área de trabalho mesmo quando o navegador estiver minimizado
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Notification Types */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                            Quando notificar
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {/* New Message */}
                        <div className="flex items-start gap-4 p-4 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <label
                                        htmlFor="new_message_enabled"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                    >
                                        Nova mensagem recebida
                                    </label>
                                    <input
                                        type="checkbox"
                                        id="new_message_enabled"
                                        checked={formData.new_message_enabled}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                new_message_enabled: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Notificar quando receber novas mensagens dos clientes
                                </p>
                            </div>
                        </div>

                        {/* Conversation Assigned */}
                        <div className="flex items-start gap-4 p-4 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <label
                                        htmlFor="conversation_assigned_enabled"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                    >
                                        Conversa atribuída para você
                                    </label>
                                    <input
                                        type="checkbox"
                                        id="conversation_assigned_enabled"
                                        checked={formData.conversation_assigned_enabled}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                conversation_assigned_enabled: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Notificar quando uma conversa for atribuída a você
                                </p>
                            </div>
                        </div>

                        {/* Email Notifications */}
                        <div className="flex items-start gap-4 p-4 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <label
                                        htmlFor="email_enabled"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                    >
                                        Notificações por e-mail
                                    </label>
                                    <input
                                        type="checkbox"
                                        id="email_enabled"
                                        checked={formData.email_enabled}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email_enabled: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Receber notificações importantes por e-mail
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-between">
                <div>
                    {recentlySuccessful && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                            Preferências salvas com sucesso!
                        </p>
                    )}
                </div>
                <Button type="submit" variant="primary" isLoading={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Preferências'}
                </Button>
            </div>
        </form>
    )
}
