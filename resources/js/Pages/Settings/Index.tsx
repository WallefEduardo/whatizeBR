import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Settings, Wifi, Bell, Code } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import Tabs from '@/Components/UI/Tabs'
import Button from '@/Components/UI/Button'
import { SettingsData, WhatsAppInstance } from '@/types'
import GeneralTab from './Tabs/GeneralTab'
import WhatsAppTab from './Tabs/WhatsAppTab'
import NotificationsTab from './Tabs/NotificationsTab'
import ApiConfigTab from './Tabs/ApiConfigTab'

interface SettingsIndexProps {
    settings: SettingsData
    instances: WhatsAppInstance[]
    currentInstanceId: string | null
}

export default function SettingsIndex() {
    const { settings, instances, currentInstanceId } = usePage<SettingsIndexProps>().props
    const [activeTab, setActiveTab] = useState('general')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = (formData: Record<string, any>) => {
        setIsSaving(true)

        const settingsArray = Object.entries(formData).map(([key, value]) => {
            const setting = settings[key as keyof SettingsData]
            return {
                key,
                value,
                type: setting?.type || 'string',
            }
        })

        router.post(
            '/settings/bulk',
            {
                instance_id: currentInstanceId,
                settings: settingsArray,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false)
                },
                onError: () => {
                    setIsSaving(false)
                },
            }
        )
    }

    return (
        <AppLayout title="Configurações">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                            Configurações
                        </h1>
                    </div>
                    <p className="text-sm text-dark-500">
                        Gerencie as configurações do sistema
                    </p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="general" onChange={setActiveTab}>
                    <Tabs.List className="mb-6 w-full flex">
                        <Tabs.Trigger value="general" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Geral
                        </Tabs.Trigger>
                        <Tabs.Trigger value="whatsapp" className="flex items-center gap-2">
                            <Wifi className="w-4 h-4" />
                            WhatsApp
                        </Tabs.Trigger>
                        <Tabs.Trigger value="notifications" className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Notificações
                        </Tabs.Trigger>
                        <Tabs.Trigger value="api" className="flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            API Config
                        </Tabs.Trigger>
                    </Tabs.List>

                    {/* Tab Contents */}
                    <Tabs.Content value="general">
                        <GeneralTab settings={settings} onSave={handleSave} isSaving={isSaving} />
                    </Tabs.Content>

                    <Tabs.Content value="whatsapp">
                        <WhatsAppTab
                            settings={settings}
                            instances={instances}
                            currentInstanceId={currentInstanceId}
                            onSave={handleSave}
                            isSaving={isSaving}
                        />
                    </Tabs.Content>

                    <Tabs.Content value="notifications">
                        <NotificationsTab settings={settings} onSave={handleSave} isSaving={isSaving} />
                    </Tabs.Content>

                    <Tabs.Content value="api">
                        <ApiConfigTab settings={settings} onSave={handleSave} isSaving={isSaving} />
                    </Tabs.Content>
                </Tabs>
            </div>
        </AppLayout>
    )
}
