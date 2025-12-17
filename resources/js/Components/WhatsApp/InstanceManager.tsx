import { useState, useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
import { QrCode, Smartphone, Loader2, X, RefreshCw, Trash2 } from 'lucide-react'
import Button from '@/Components/UI/Button'
import Input from '@/Components/UI/Input'
import Badge from '@/Components/UI/Badge'
import { Card } from '@/Components/UI/Card'
import { WhatsAppInstance } from '@/types'
import { useToast } from '@/Components/UI/Toast'

interface InstanceManagerProps {
    instances: WhatsAppInstance[]
}

interface QRCodeData {
    qr_code: string
    generated_at: string
    expires_at: string
    is_expired: boolean
}

export default function InstanceManager({ instances: initialInstances }: InstanceManagerProps) {
    const { showToast } = useToast()
    const [instances, setInstances] = useState<WhatsAppInstance[]>(initialInstances)
    const [showNewInstanceModal, setShowNewInstanceModal] = useState(false)
    const [showQRModal, setShowQRModal] = useState(false)
    const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null)
    const [newInstanceName, setNewInstanceName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [qrData, setQrData] = useState<QRCodeData | null>(null)
    const [isLoadingQR, setIsLoadingQR] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [instanceToDelete, setInstanceToDelete] = useState<WhatsAppInstance | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const wsRef = useRef<WebSocket | null>(null)

    // WebSocket connection
    useEffect(() => {
        if (showQRModal && selectedInstance) {
            connectWebSocket()
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }
        }
    }, [showQRModal, selectedInstance])

    const connectWebSocket = () => {
        const ws = new WebSocket('ws://localhost:8083/ws')
        wsRef.current = ws

        ws.onopen = () => {
            console.log('WebSocket connected')

            // Subscribe to instance updates
            if (selectedInstance) {
                ws.send(
                    JSON.stringify({
                        type: 'subscribe',
                        instance_token: selectedInstance.instance_key,
                    })
                )
            }
        }

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data)

            console.log('WebSocket message:', msg.type)

            switch (msg.type) {
                case 'qr_code':
                    setQrData(msg.data)
                    setIsLoadingQR(false)
                    break

                case 'connection_status':
                    if (msg.data.status === 'authenticated') {
                        setShowQRModal(false)
                        setQrData(null)
                        refreshInstances()
                    }
                    break

                case 'session_update':
                    // Update instance status in list
                    setInstances((prev) =>
                        prev.map((inst) =>
                            inst.instance_key === msg.instance_token
                                ? { ...inst, status: msg.data.status }
                                : inst
                        )
                    )

                    // ✅ Fechar modal automaticamente quando conectar
                    if (msg.data.status === 'authenticated' || msg.data.status === 'connected') {
                        if (selectedInstance?.instance_key === msg.instance_token) {
                            setTimeout(() => {
                                setShowQRModal(false)
                                setSelectedInstance(null)
                                showToast('success', 'WhatsApp Conectado!', 'Sua instância foi autenticada com sucesso')
                            }, 1000) // Aguardar 1s para dar tempo de ver a confirmação
                        }
                    }
                    break
            }
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        ws.onclose = () => {
            console.log('WebSocket disconnected')
        }
    }

    const createInstance = async () => {
        if (!newInstanceName.trim()) return

        setIsCreating(true)

        try {
            const response = await fetch('/api/whatsapp/instances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: newInstanceName,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setInstances([...instances, data.data])
                setNewInstanceName('')
                setShowNewInstanceModal(false)

                showToast('success', 'Instância criada!', 'Agora você pode conectar o WhatsApp')

                // Auto-open QR modal
                setTimeout(() => connectToInstance(data.data), 500)
            } else {
                showToast('error', 'Erro ao criar instância', data.message || data.error || 'Erro desconhecido')
            }
        } catch (error) {
            console.error('Error creating instance:', error)
            showToast('error', 'Erro ao criar instância', error instanceof Error ? error.message : 'Erro de conexão')
        } finally {
            setIsCreating(false)
        }
    }

    const connectToInstance = async (instance: WhatsAppInstance) => {
        setSelectedInstance(instance)
        setShowQRModal(true)
        setIsLoadingQR(true)
        setQrData(null)

        try {
            // First, always disconnect any existing session to ensure clean state
            console.log('Disconnecting any existing session before connecting...')
            await disconnectInstance(instance)

            // Wait a bit for the disconnect to complete
            await new Promise(resolve => setTimeout(resolve, 500))

            // Check status
            const statusResponse = await fetch(`/api/whatsapp/instances/${instance.instance_key}/status`)
            const statusData = await statusResponse.json()

            // If already authenticated after disconnect attempt, inform user
            if (statusData.data?.status === 'authenticated' || statusData.data?.status === 'connected') {
                showToast('info', 'Já conectado', 'Esta instância já está autenticada')
                setShowQRModal(false)
                setInstances(instances.map(i => i.id === instance.id ? { ...i, status: 'authenticated' } : i))
                setIsLoadingQR(false)
                return
            }

            // Generate QR
            await generateQR(instance)
        } catch (error) {
            console.error('Error connecting:', error)
            showToast('error', 'Erro ao conectar', 'Não foi possível iniciar a conexão')
            setShowQRModal(false)
            setIsLoadingQR(false)
        }
    }

    const generateQR = async (instance: WhatsAppInstance) => {
        setIsLoadingQR(true)
        setQrData(null)

        try {
            const response = await fetch(`/api/whatsapp/instances/${instance.instance_key}/qr`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                },
            })

            const data = await response.json()

            if (data.success) {
                setQrData(data.data)
            } else {
                // Handle "already connected" error specifically
                const errorMsg = data.message || data.error || 'Erro desconhecido'
                if (errorMsg.toLowerCase().includes('already connected') || errorMsg.toLowerCase().includes('já conectado')) {
                    showToast('info', 'Já conectado', 'Esta instância já está autenticada')
                    setInstances(instances.map(i => i.id === instance.id ? { ...i, status: 'authenticated' } : i))
                } else {
                    showToast('error', 'Erro ao gerar QR Code', errorMsg)
                }
                setShowQRModal(false)
            }
        } catch (error) {
            console.error('Error generating QR:', error)
            showToast('error', 'Erro ao gerar QR Code', error instanceof Error ? error.message : 'Erro de conexão')
            setShowQRModal(false)
        } finally {
            setIsLoadingQR(false)
        }
    }

    const confirmDelete = (instance: WhatsAppInstance) => {
        setInstanceToDelete(instance)
        setShowDeleteModal(true)
    }

    const deleteInstance = async () => {
        if (!instanceToDelete) return

        // Validar se tem instance_key
        if (!instanceToDelete.instance_key) {
            showToast('error', 'Erro ao deletar', 'Chave da instância não encontrada')
            setShowDeleteModal(false)
            setInstanceToDelete(null)
            return
        }

        setIsDeleting(true)

        try {
            const response = await fetch(`/api/whatsapp/instances/${instanceToDelete.instance_key}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                },
            })

            if (!response.ok) {
                throw new Error('Falha ao deletar instância')
            }

            const data = await response.json()

            if (data.success) {
                setInstances(instances.filter((inst) => inst.id !== instanceToDelete.id))
                setShowDeleteModal(false)
                setInstanceToDelete(null)
                showToast('success', 'Instância deletada', 'A instância foi removida com sucesso')
            } else {
                showToast('error', 'Erro ao deletar', data.message || 'Não foi possível deletar a instância')
            }
        } catch (error) {
            console.error('Error deleting instance:', error)
            const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar com o servidor'
            showToast('error', 'Erro ao deletar instância', errorMessage)
        } finally {
            setIsDeleting(false)
        }
    }

    const refreshInstances = () => {
        router.reload({ only: ['instances'] })
    }

    const disconnectInstance = async (instance: WhatsAppInstance | null) => {
        if (!instance?.instance_key) return

        try {
            const response = await fetch(`/api/whatsapp/instances/${instance.instance_key}/disconnect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                },
            })

            if (response.ok) {
                console.log('Instance disconnected successfully')
                // Update local state to disconnected
                setInstances((prev) =>
                    prev.map((inst) =>
                        inst.id === instance.id ? { ...inst, status: 'disconnected' } : inst
                    )
                )
            } else {
                console.warn('Failed to disconnect instance, but continuing...')
            }
        } catch (error) {
            console.error('Error disconnecting instance:', error)
            // Don't show error toast - this is a background cleanup operation
        }
    }

    const handleCloseQRModal = () => {
        // Disconnect the session when closing modal
        disconnectInstance(selectedInstance)

        // Close modal and reset state
        setShowQRModal(false)
        setQrData(null)
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
            connected: 'success',
            authenticated: 'success',
            connecting: 'warning',
            disconnected: 'danger',
            failed: 'danger',
        }

        const labels: Record<string, string> = {
            connected: 'Conectado',
            authenticated: 'Autenticado',
            connecting: 'Conectando',
            disconnected: 'Desconectado',
            failed: 'Falhou',
        }

        return <Badge variant={variants[status] || 'info'}>{labels[status] || status}</Badge>
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                        Instâncias WhatsApp
                    </h3>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowNewInstanceModal(true)}
                    >
                        <Smartphone className="w-4 h-4 mr-2" />
                        Nova Instância
                    </Button>
                </div>

                <div className="space-y-3">
                    {instances.length === 0 ? (
                        <div className="text-center py-12 text-dark-500 bg-dark-50 dark:bg-dark-900 rounded-lg border border-dashed border-dark-300 dark:border-dark-700">
                            <Smartphone className="w-12 h-12 mx-auto mb-3 text-dark-400" />
                            <p>Nenhuma instância conectada</p>
                            <p className="text-sm mt-1">
                                Clique em "Nova Instância" para começar
                            </p>
                        </div>
                    ) : (
                        instances.map((instance) => (
                            <div
                                key={instance.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                        <Smartphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-dark-900 dark:text-dark-50">
                                            {instance.name}
                                        </h4>
                                        <p className="text-sm text-dark-500">
                                            {instance.phone || 'Aguardando conexão'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {getStatusBadge(instance.status)}

                                    {instance.status === 'connecting' ||
                                    instance.status === 'disconnected' ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => connectToInstance(instance)}
                                        >
                                            <QrCode className="w-4 h-4 mr-2" />
                                            Conectar
                                        </Button>
                                    ) : null}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => confirmDelete(instance)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Nova Instância */}
            {showNewInstanceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                    Nova Instância WhatsApp
                                </h3>
                                <button
                                    onClick={() => setShowNewInstanceModal(false)}
                                    className="text-dark-500 hover:text-dark-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        Nome da Instância
                                    </label>
                                    <Input
                                        value={newInstanceName}
                                        onChange={(e) => setNewInstanceName(e.target.value)}
                                        placeholder="Ex: Atendimento Principal"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowNewInstanceModal(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={createInstance}
                                        isLoading={isCreating}
                                        disabled={!newInstanceName.trim()}
                                    >
                                        Criar Instância
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modal QR Code */}
            {showQRModal && selectedInstance && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-4xl bg-white dark:bg-dark-800 shadow-2xl">
                        <div className="relative">
                            {/* Header com gradiente */}
                            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">
                                            Escaneie o QR Code
                                        </h3>
                                        <p className="text-green-100 text-sm mt-1">
                                            Use a câmera do seu celular para conectar o WhatsApp
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCloseQRModal}
                                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* QR Code Section */}
                                    <div className="flex flex-col items-center justify-center">
                                        {isLoadingQR ? (
                                            <div className="flex flex-col items-center justify-center h-80">
                                                <Loader2 className="w-16 h-16 animate-spin text-green-600" />
                                                <p className="mt-4 text-dark-600 dark:text-dark-400 font-medium">
                                                    Gerando QR Code...
                                                </p>
                                            </div>
                                        ) : qrData ? (
                                            <div className="relative">
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-8 rounded-2xl border-4 border-green-500 shadow-xl">
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrData.qr_code)}`}
                                                        alt="QR Code"
                                                        className="w-70 h-70 rounded-lg"
                                                    />
                                                </div>
                                                <div className="mt-4 flex items-center justify-center gap-2">
                                                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                        Aguardando leitura do QR Code...
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-80">
                                                <QrCode className="w-16 h-16 text-dark-400 mb-4" />
                                                <p className="text-dark-600 dark:text-dark-400">
                                                    QR Code não disponível
                                                </p>
                                                <Button
                                                    variant="primary"
                                                    className="mt-4"
                                                    onClick={() => generateQR(selectedInstance)}
                                                >
                                                    Gerar QR Code
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Instructions Section */}
                                    <div className="flex flex-col justify-center">
                                        <div className="space-y-5">
                                            {/* Step 1 */}
                                            <div className="flex gap-4 items-start">
                                                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                                                    1
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-dark-900 dark:text-dark-50">
                                                        Abra o WhatsApp no seu celular
                                                    </h4>
                                                    <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                                                        Certifique-se de que está usando a versão mais recente
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step 2 */}
                                            <div className="flex gap-4 items-start">
                                                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                                                    2
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-dark-900 dark:text-dark-50">
                                                        Vá em Menu → Dispositivos conectados
                                                    </h4>
                                                    <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                                                        Encontre a opção no menu principal do app
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step 3 */}
                                            <div className="flex gap-4 items-start">
                                                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                                                    3
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-dark-900 dark:text-dark-50">
                                                        Toque em "Conectar um dispositivo"
                                                    </h4>
                                                    <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                                                        Isso abrirá a câmera do seu celular
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step 4 */}
                                            <div className="flex gap-4 items-start">
                                                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                                                    4
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-dark-900 dark:text-dark-50">
                                                        Aponte a câmera para este QR Code
                                                    </h4>
                                                    <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                                                        A conexão será feita automaticamente
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expired Warning */}
                                        {qrData?.is_expired && (
                                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="danger">QR Code Expirado</Badge>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => generateQR(selectedInstance)}
                                                    className="w-full"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Gerar Novo QR Code
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modal Confirmar Delete */}
            {showDeleteModal && instanceToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                    Confirmar Exclusão
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setInstanceToDelete(null)
                                    }}
                                    className="text-dark-500 hover:text-dark-700 dark:hover:text-dark-300"
                                    disabled={isDeleting}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <p className="text-sm text-red-800 dark:text-red-200">
                                        Tem certeza que deseja deletar a instância{' '}
                                        <strong>"{instanceToDelete.name}"</strong>?
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-300 mt-2">
                                        Esta ação não pode ser desfeita. Todas as conversas e configurações
                                        serão perdidas.
                                    </p>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteModal(false)
                                            setInstanceToDelete(null)
                                        }}
                                        disabled={isDeleting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={deleteInstance}
                                        isLoading={isDeleting}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Deletar Instância
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    )
}
