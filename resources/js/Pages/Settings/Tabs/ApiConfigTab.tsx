import { useState } from 'react'
import { Code, Clock, TrendingUp, Copy, Check } from 'lucide-react'
import Button from '@/Components/UI/Button'
import Input from '@/Components/UI/Input'
import { Card } from '@/Components/UI/Card'
import Badge from '@/Components/UI/Badge'
import { SettingsData } from '@/types'

interface ApiConfigTabProps {
    settings: SettingsData
    onSave: (data: Record<string, any>) => void
    isSaving: boolean
}

export default function ApiConfigTab({ settings, onSave, isSaving }: ApiConfigTabProps) {
    const [formData, setFormData] = useState({
        api_rate_limit: settings.api_rate_limit?.value || 60,
        api_timeout: settings.api_timeout?.value || 30,
    })

    const [copiedToken, setCopiedToken] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const handleCopyToken = () => {
        // Simular cópia de token (em produção isso viria do backend)
        const fakeToken = 'sk_live_' + Math.random().toString(36).substring(2, 15)
        navigator.clipboard.writeText(fakeToken)
        setCopiedToken(true)
        setTimeout(() => setCopiedToken(false), 2000)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Credentials */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Code className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                            Credenciais da API
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-dark-700 dark:text-dark-300">
                                    API Token
                                </label>
                                <Badge variant="info">Ativo</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 rounded bg-dark-900 dark:bg-dark-950 text-primary-400 text-xs font-mono">
                                    sk_live_************************
                                </code>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleCopyToken}
                                >
                                    {copiedToken ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            Copiado
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            Copiar
                                        </>
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-dark-500 mt-2">
                                Use este token para autenticar suas requisições à API
                            </p>
                        </div>

                        <div className="p-4 rounded bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/20">
                            <p className="text-sm text-orange-700 dark:text-orange-400">
                                ⚠️ Mantenha seu token em segurança. Não compartilhe com terceiros.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Rate Limiting */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                            Rate Limiting
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Requisições por minuto
                            </label>
                            <Input
                                type="number"
                                min="10"
                                max="1000"
                                value={formData.api_rate_limit}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        api_rate_limit: parseInt(e.target.value),
                                    })
                                }
                            />
                            <p className="text-xs text-dark-500 mt-2">
                                Número máximo de requisições permitidas por minuto
                            </p>
                        </div>

                        <div className="p-4 rounded bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                                        Uso atual da API
                                    </h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-blue-700 dark:text-blue-400">
                                                Última hora:
                                            </span>
                                            <span className="font-medium text-blue-900 dark:text-blue-300">
                                                45 / {formData.api_rate_limit}
                                            </span>
                                        </div>
                                        <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full"
                                                style={{
                                                    width: `${(45 / formData.api_rate_limit) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Timeout Configuration */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                            Timeout
                        </h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            Timeout de requisição (segundos)
                        </label>
                        <Input
                            type="number"
                            min="5"
                            max="300"
                            value={formData.api_timeout}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    api_timeout: parseInt(e.target.value),
                                })
                            }
                        />
                        <p className="text-xs text-dark-500 mt-2">
                            Tempo máximo de espera por uma resposta da API
                        </p>
                    </div>
                </div>
            </Card>

            {/* API Documentation Link */}
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                        Documentação da API
                    </h3>
                    <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">
                        Acesse nossa documentação completa para integrar sua aplicação com a API.
                    </p>
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" size="sm">
                            Ver Documentação
                        </Button>
                        <Button type="button" variant="secondary" size="sm">
                            Exemplos de Código
                        </Button>
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
