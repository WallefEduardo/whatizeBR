import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Settings, Wifi, Bell, Code, MessageSquare, Users, Tag, Building2, UserCog } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import Tabs from '@/Components/UI/Tabs'
import Button from '@/Components/UI/Button'
import { SettingsData, WhatsAppInstance, PageProps } from '@/types'
import GeneralTab from './Tabs/GeneralTab'
import WhatsAppTab from './Tabs/WhatsAppTab'
import NotificationsTab from './Tabs/NotificationsTab'
import ApiConfigTab from './Tabs/ApiConfigTab'
import QuickRepliesTab from './Tabs/QuickRepliesTab'
import MembersTab from './Tabs/MembersTab'
import TagsTab from './Tabs/TagsTab'
import DepartmentsTab from './Tabs/DepartmentsTab'
import UsersTab from './Tabs/UsersTab'

interface QuickReply {
    id: string
    shortcut: string
    message: string
    media_url?: string
    media_type?: 'image' | 'video' | 'audio' | 'document'
    created_at: string
    updated_at: string
}

interface User {
    id: number
    name: string
    email: string
}

interface Department {
    id: number
    name: string
    color: string
}

interface Instance {
    id: number
    name: string
}

interface Member {
    id: number
    user: User
    department: Department | null
    instance: Instance | null
    is_active: boolean
    max_concurrent_chats: number
    active_conversations_count: number
    available_slots: number
    created_at: string
}

interface Tag {
    id: number
    name: string
    color: string
    conversations_count: number
    contacts_count: number
}

interface DepartmentWithCounts {
    id: number
    name: string
    description: string | null
    color: string
    is_active: boolean
    members_count: number
    conversations_count: number
}

interface UserFull {
    id: string
    name: string
    email: string
    role: 'admin' | 'supervisor' | 'agent'
    is_active: boolean
    avatar?: string | null
    created_at: string
}

interface SettingsIndexProps extends PageProps {
    settings: SettingsData
    instances: WhatsAppInstance[]
    currentInstanceId: string | null
    quickReplies: {
        data: QuickReply[]
        current_page: number
        last_page: number
        per_page: number
        total: number
    } | null
    members?: Member[]
    users?: User[]
    departments?: Department[]
    tags?: Tag[]
    allDepartments?: DepartmentWithCounts[]
    allUsers?: UserFull[]
}

export default function SettingsIndex() {
    const { settings, instances, currentInstanceId, quickReplies, members = [], users = [], departments = [], tags = [], allDepartments = [], allUsers = [] } = usePage<SettingsIndexProps>().props
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
            <div className="w-full p-6">
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
                    <p className="text-sm text-dark-500 dark:text-dark-400">
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
                        <Tabs.Trigger value="respostasrapidas" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Respostas Rápidas
                        </Tabs.Trigger>
                        <Tabs.Trigger value="membros" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Membros
                        </Tabs.Trigger>
                        <Tabs.Trigger value="tags" className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Tags
                        </Tabs.Trigger>
                        <Tabs.Trigger value="departamentos" className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Departamentos
                        </Tabs.Trigger>
                        <Tabs.Trigger value="usuarios" className="flex items-center gap-2">
                            <UserCog className="w-4 h-4" />
                            Usuários
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
                        <NotificationsTab />
                    </Tabs.Content>

                    <Tabs.Content value="api">
                        <ApiConfigTab settings={settings} onSave={handleSave} isSaving={isSaving} />
                    </Tabs.Content>

                    <Tabs.Content value="respostasrapidas">
                        <QuickRepliesTab quickReplies={quickReplies} />
                    </Tabs.Content>

                    <Tabs.Content value="membros">
                        <MembersTab members={members} users={users} departments={departments} />
                    </Tabs.Content>

                    <Tabs.Content value="tags">
                        <TagsTab tags={tags} />
                    </Tabs.Content>

                    <Tabs.Content value="departamentos">
                        <DepartmentsTab departments={allDepartments} />
                    </Tabs.Content>

                    <Tabs.Content value="usuarios">
                        <UsersTab allUsers={allUsers} />
                    </Tabs.Content>
                </Tabs>
            </div>
        </AppLayout>
    )
}
