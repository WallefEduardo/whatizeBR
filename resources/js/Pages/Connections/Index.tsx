import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Plus, RefreshCw, Wifi, WifiOff, Loader2 } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import Button from '@/Components/UI/Button'
import Table from '@/Components/UI/Table/Table'
import TableActions from '@/Components/UI/Table/TableActions'
import Badge from '@/Components/UI/Badge'
import Modal from '@/Components/UI/Modal'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'
import { useConfirm } from '@/Hooks/useConfirm'

interface WhatsAppInstance {
    id: string
    name: string
    phone_number: string | null
    token: string
    status: 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'failed'
    connected_at: string | null
    last_seen_at: string | null
    created_at: string
}

interface Props {
    instances: WhatsAppInstance[]
}

export default function ConnectionsIndex({ instances }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { confirm, isOpen, isLoading, options, handleConfirm, handleClose } = useConfirm()

    const getStatusBadge = (status: WhatsAppInstance['status']) => {
        const variants = {
            disconnected: { variant: 'default' as const, label: 'Desconectado', icon: <WifiOff className="w-3 h-3" /> },
            connecting: { variant: 'warning' as const, label: 'Conectando', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
            connected: { variant: 'success' as const, label: 'Conectado', icon: <Wifi className="w-3 h-3" /> },
            authenticated: { variant: 'success' as const, label: 'Autenticado', icon: <Wifi className="w-3 h-3" /> },
            failed: { variant: 'danger' as const, label: 'Falhou', icon: <WifiOff className="w-3 h-3" /> },
        }

        const config = variants[status]

        return (
            <Badge variant={config.variant} className="flex items-center gap-1.5">
                {config.icon}
                {config.label}
            </Badge>
        )
    }

    const handleCreateInstance = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            return
        }

        setIsSubmitting(true)

        router.post('/api/whatsapp/instances', formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false)
                setFormData({ name: '' })
            },
            onFinish: () => {
                setIsSubmitting(false)
            },
        })
    }

    const handleViewQR = (instance: WhatsAppInstance) => {
        router.visit(`/connections/${instance.token}/qr`)
    }

    const handleDisconnect = (instance: WhatsAppInstance) => {
        confirm({
            title: 'Desconectar Instância',
            message: `Tem certeza que deseja desconectar a instância "${instance.name}"? Você precisará escanear o QR Code novamente para reconectar.`,
            confirmText: 'Desconectar',
            cancelText: 'Cancelar',
            variant: 'warning',
            onConfirm: async () => {
                router.delete(`/api/whatsapp/instances/${instance.token}`)
            },
        })
    }

    const handleDelete = (instance: WhatsAppInstance) => {
        confirm({
            title: 'Deletar Instância',
            message: `Tem certeza que deseja deletar a instância "${instance.name}"? Esta ação não pode ser desfeita.`,
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            variant: 'danger',
            onConfirm: async () => {
                router.delete(`/api/whatsapp/instances/${instance.token}`)
            },
        })
    }

    const columns = [
        {
            key: 'name',
            label: 'Nome',
            render: (instance: WhatsAppInstance) => (
                <div>
                    <p className="font-medium text-dark-900 dark:text-dark-50">{instance.name}</p>
                    {instance.phone_number && (
                        <p className="text-xs text-dark-500">{instance.phone_number}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (instance: WhatsAppInstance) => getStatusBadge(instance.status),
        },
        {
            key: 'connected_at',
            label: 'Conectado em',
            render: (instance: WhatsAppInstance) => (
                <span className="text-sm text-dark-600 dark:text-dark-400">
                    {instance.connected_at
                        ? new Date(instance.connected_at).toLocaleString('pt-BR')
                        : '-'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Ações',
            width: '150px',
            render: (instance: WhatsAppInstance) => (
                <TableActions
                    onView={instance.status === 'disconnected' || instance.status === 'connecting'
                        ? () => handleViewQR(instance)
                        : undefined}
                    onDelete={() => handleDelete(instance)}
                    customActions={[
                        ...(instance.status === 'connected' || instance.status === 'authenticated' ? [{
                            label: 'Desconectar',
                            icon: <WifiOff className="w-4 h-4" />,
                            onClick: () => handleDisconnect(instance),
                            variant: 'default' as const,
                        }] : []),
                        ...(instance.status === 'disconnected' || instance.status === 'failed' ? [{
                            label: 'Ver QR Code',
                            icon: <RefreshCw className="w-4 h-4" />,
                            onClick: () => handleViewQR(instance),
                            variant: 'default' as const,
                        }] : []),
                    ]}
                />
            ),
        },
    ]

    return (
        <AppLayout title="Conexões WhatsApp">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                            Conexões WhatsApp
                        </h1>
                        <p className="mt-1 text-sm text-dark-500">
                            Gerencie suas instâncias do WhatsApp
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Conexão
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-dark-500">Total</p>
                                <p className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                                    {instances.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-dark-500">Conectadas</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {instances.filter(i => i.status === 'connected' || i.status === 'authenticated').length}
                                </p>
                            </div>
                            <Wifi className="w-8 h-8 text-green-500 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-dark-500">Desconectadas</p>
                                <p className="text-2xl font-bold text-dark-600">
                                    {instances.filter(i => i.status === 'disconnected').length}
                                </p>
                            </div>
                            <WifiOff className="w-8 h-8 text-dark-400 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-dark-500">Com Falha</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {instances.filter(i => i.status === 'failed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700">
                    <Table
                        columns={columns}
                        data={instances}
                        keyExtractor={(instance) => instance.id}
                        emptyMessage="Nenhuma conexão cadastrada. Clique em 'Nova Conexão' para começar."
                    />
                </div>
            </div>

            {/* Create Modal */}
            <Modal
                show={isCreateModalOpen}
                onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
                title="Nova Conexão WhatsApp"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateInstance}
                            isLoading={isSubmitting}
                        >
                            Criar Conexão
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleCreateInstance} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            Nome da Conexão
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ name: e.target.value })}
                            className="w-full px-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Ex: Atendimento Principal"
                            required
                            disabled={isSubmitting}
                        />
                        <p className="mt-1 text-xs text-dark-500">
                            Escolha um nome descritivo para identificar esta conexão
                        </p>
                    </div>
                </form>
            </Modal>

            {/* Confirm Dialog */}
            {options && (
                <ConfirmDialog
                    show={isOpen}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    title={options.title}
                    message={options.message}
                    confirmText={options.confirmText}
                    cancelText={options.cancelText}
                    type={options.variant}
                    isLoading={isLoading}
                />
            )}
        </AppLayout>
    )
}
