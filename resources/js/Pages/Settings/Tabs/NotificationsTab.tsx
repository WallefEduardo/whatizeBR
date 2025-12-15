import { useState } from 'react'
import { Bell, Volume2, Monitor } from 'lucide-react'
import Button from '@/Components/UI/Button'
import { Card } from '@/Components/UI/Card'
import { SettingsData } from '@/types'

interface NotificationsTabProps {
    settings: SettingsData
    onSave: (data: Record<string, any>) => void
    isSaving: boolean
}

export default function NotificationsTab({ settings, onSave, isSaving }: NotificationsTabProps) {
    const [formData, setFormData] = useState({
        notifications_enabled: settings.notifications_enabled?.value !== false,
        notification_sound_enabled: settings.notification_sound_enabled?.value !== false,
        notification_desktop_enabled: settings.notification_desktop_enabled?.value !== false,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notificações Gerais */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                            Notificações Gerais
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded border border-dark-200 dark:border-dark-700">
                            <input
                                type="checkbox"
                                id="notifications_enabled"
                                checked={formData.notifications_enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notifications_enabled: e.target.checked,
                                    })
                                }
                                className="w-4 h-4 mt-1 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                                <label
                                    htmlFor="notifications_enabled"
                                    className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 cursor-pointer"
                                >
                                    Habilitar notificações
                                </label>
                                <p className="text-xs text-dark-500">
                                    Receba notificações sobre novas mensagens e atualizações
                                </p>
                            </div>
                        </div>

                        {formData.notifications_enabled && (
                            <>
                                <div className="flex items-start gap-4 p-4 rounded border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900">
                                    <Volume2 className="w-5 h-5 text-dark-400 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <label
                                                htmlFor="notification_sound_enabled"
                                                className="text-sm font-medium text-dark-700 dark:text-dark-300 cursor-pointer"
                                            >
                                                Som de notificação
                                            </label>
                                            <input
                                                type="checkbox"
                                                id="notification_sound_enabled"
                                                checked={formData.notification_sound_enabled}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        notification_sound_enabled: e.target.checked,
                                                    })
                                                }
                                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                            />
                                        </div>
                                        <p className="text-xs text-dark-500">
                                            Reproduzir som ao receber novas mensagens
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900">
                                    <Monitor className="w-5 h-5 text-dark-400 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <label
                                                htmlFor="notification_desktop_enabled"
                                                className="text-sm font-medium text-dark-700 dark:text-dark-300 cursor-pointer"
                                            >
                                                Notificações na área de trabalho
                                            </label>
                                            <input
                                                type="checkbox"
                                                id="notification_desktop_enabled"
                                                checked={formData.notification_desktop_enabled}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        notification_desktop_enabled: e.target.checked,
                                                    })
                                                }
                                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                            />
                                        </div>
                                        <p className="text-xs text-dark-500">
                                            Exibir notificações na área de trabalho do seu sistema
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Preferências de Notificação */}
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                        Quando notificar
                    </h3>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded bg-dark-50 dark:bg-dark-900">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                                    Nova mensagem recebida
                                </span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded bg-dark-50 dark:bg-dark-900">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                                    Conversa atribuída para você
                                </span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded bg-dark-50 dark:bg-dark-900">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                                    Menção em mensagem
                                </span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded bg-dark-50 dark:bg-dark-900">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                                    Atualização de status de mensagem
                                </span>
                            </div>
                        </label>
                    </div>
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
