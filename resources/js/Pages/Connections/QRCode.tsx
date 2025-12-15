import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import Button from '@/Components/UI/Button'
import Badge from '@/Components/UI/Badge'

interface WhatsAppInstance {
    id: string
    name: string
    phone_number: string | null
    token: string
    status: 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'failed'
    qr_code: string | null
    connected_at: string | null
}

interface Props {
    instance: WhatsAppInstance
}

export default function QRCodePage({ instance: initialInstance }: Props) {
    const [instance, setInstance] = useState(initialInstance)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Poll status every 3 seconds
    useEffect(() => {
        if (instance.status === 'connected' || instance.status === 'authenticated') {
            return
        }

        const interval = setInterval(() => {
            fetch(`/api/whatsapp/instances/${instance.token}/status`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setInstance(prev => ({
                            ...prev,
                            status: data.data.status,
                            phone_number: data.data.phone_number,
                            connected_at: data.data.connected_at,
                        }))

                        // Redirect to connections list if connected
                        if (data.data.status === 'connected' || data.data.status === 'authenticated') {
                            setTimeout(() => {
                                router.visit('/connections')
                            }, 2000)
                        }
                    }
                })
                .catch(err => console.error('Failed to fetch status:', err))
        }, 3000)

        return () => clearInterval(interval)
    }, [instance.status, instance.token])

    const handleRefreshQR = async () => {
        setIsRefreshing(true)

        try {
            const response = await fetch(`/api/whatsapp/instances/${instance.token}/qr`)
            const data = await response.json()

            if (data.success) {
                setInstance(prev => ({
                    ...prev,
                    qr_code: data.data.qr_code,
                    status: data.data.status,
                }))
            }
        } catch (error) {
            console.error('Failed to refresh QR Code:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    const getStatusConfig = () => {
        switch (instance.status) {
            case 'connected':
            case 'authenticated':
                return {
                    variant: 'success' as const,
                    icon: <CheckCircle className="w-5 h-5" />,
                    title: 'Conectado com Sucesso!',
                    message: 'Sua instância do WhatsApp foi conectada com sucesso.',
                }
            case 'connecting':
                return {
                    variant: 'warning' as const,
                    icon: <Loader2 className="w-5 h-5 animate-spin" />,
                    title: 'Conectando...',
                    message: 'Aguarde enquanto estabelecemos a conexão.',
                }
            case 'failed':
                return {
                    variant: 'danger' as const,
                    icon: <AlertCircle className="w-5 h-5" />,
                    title: 'Falha na Conexão',
                    message: 'Não foi possível conectar. Tente gerar um novo QR Code.',
                }
            default:
                return {
                    variant: 'default' as const,
                    icon: <RefreshCw className="w-5 h-5" />,
                    title: 'Aguardando Leitura do QR Code',
                    message: 'Escaneie o QR Code com seu WhatsApp para conectar.',
                }
        }
    }

    const statusConfig = getStatusConfig()

    return (
        <AppLayout title={`QR Code - ${instance.name}`}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/connections')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Conexões
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                                {instance.name}
                            </h1>
                            <p className="mt-1 text-sm text-dark-500">
                                Token: {instance.token}
                            </p>
                        </div>
                        <Badge variant={statusConfig.variant} className="flex items-center gap-2" maxWidth="md">
                            {statusConfig.icon}
                            {statusConfig.title}
                        </Badge>
                    </div>
                </div>

                {/* QR Code Card */}
                <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-dark-200 dark:border-dark-700 p-8">
                    <div className="text-center">
                        {/* Status Message */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-2">
                                {statusConfig.title}
                            </h2>
                            <p className="text-dark-600 dark:text-dark-400">
                                {statusConfig.message}
                            </p>
                        </div>

                        {/* QR Code Display */}
                        {instance.status !== 'connected' && instance.status !== 'authenticated' && (
                            <div className="flex justify-center mb-6">
                                {instance.qr_code ? (
                                    <div className="bg-white p-4 rounded-lg border-2 border-dark-200 inline-block">
                                        <img
                                            src={instance.qr_code}
                                            alt="QR Code"
                                            className="w-64 h-64"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-64 h-64 bg-dark-100 dark:bg-dark-700 rounded-lg flex items-center justify-center">
                                        <Loader2 className="w-12 h-12 text-dark-400 animate-spin" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Success State */}
                        {(instance.status === 'connected' || instance.status === 'authenticated') && (
                            <div className="mb-6">
                                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                                {instance.phone_number && (
                                    <p className="text-lg font-medium text-dark-900 dark:text-dark-50">
                                        {instance.phone_number}
                                    </p>
                                )}
                                <p className="text-sm text-dark-500 mt-2">
                                    Redirecionando para a lista de conexões...
                                </p>
                            </div>
                        )}

                        {/* Instructions */}
                        {instance.status === 'disconnected' && (
                            <div className="bg-dark-50 dark:bg-dark-900 rounded-lg p-6 text-left">
                                <h3 className="font-semibold text-dark-900 dark:text-dark-50 mb-3">
                                    Como conectar:
                                </h3>
                                <ol className="space-y-2 text-sm text-dark-600 dark:text-dark-400">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary-500">1.</span>
                                        <span>Abra o WhatsApp no seu celular</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary-500">2.</span>
                                        <span>Toque em <strong>Menu</strong> ou <strong>Configurações</strong> e selecione <strong>Aparelhos conectados</strong></span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary-500">3.</span>
                                        <span>Toque em <strong>Conectar um aparelho</strong></span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary-500">4.</span>
                                        <span>Aponte seu celular para esta tela para escanear o código QR</span>
                                    </li>
                                </ol>
                            </div>
                        )}

                        {/* Actions */}
                        {instance.status !== 'connected' && instance.status !== 'authenticated' && (
                            <div className="mt-6 flex justify-center gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => router.visit('/connections')}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleRefreshQR}
                                    isLoading={isRefreshing}
                                    disabled={instance.status === 'connecting'}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Gerar Novo QR Code
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Alert */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-200">
                            <p className="font-medium mb-1">Importante:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
                                <li>O QR Code expira após 2 minutos. Clique em "Gerar Novo QR Code" se necessário.</li>
                                <li>Mantenha esta aba aberta até a conexão ser estabelecida.</li>
                                <li>A conexão será estabelecida automaticamente após escanear o QR Code.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
