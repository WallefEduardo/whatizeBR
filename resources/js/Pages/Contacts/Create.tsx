import { useState, FormEvent } from 'react'
import { router } from '@inertiajs/react'
import { ArrowLeft, Save } from 'lucide-react'
import AppLayout from '@/Components/Layout/AppLayout'
import Button from '@/Components/UI/Button'

interface Tag {
    id: string
    name: string
    color: string
}

interface Instance {
    id: string
    name: string
}

interface Props {
    instances: Instance[]
    tags: Tag[]
}

export default function ContactsCreate({ instances, tags }: Props) {
    const [formData, setFormData] = useState({
        instance_id: instances[0]?.id || '',
        phone: '',
        name: '',
        email: '',
        notes: '',
        tag_ids: [] as string[],
        custom_fields: {},
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        router.post('/contacts', formData, {
            onSuccess: () => {
                router.visit('/contacts')
            },
            onError: (errors) => {
                setErrors(errors as Record<string, string>)
                setIsSubmitting(false)
            },
            onFinish: () => {
                setIsSubmitting(false)
            },
        })
    }

    const toggleTag = (tagId: string) => {
        setFormData(prev => ({
            ...prev,
            tag_ids: prev.tag_ids.includes(tagId)
                ? prev.tag_ids.filter(id => id !== tagId)
                : [...prev.tag_ids, tagId]
        }))
    }

    return (
        <AppLayout title="Novo Contato">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/contacts')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Contatos
                    </Button>

                    <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                        Novo Contato
                    </h1>
                    <p className="mt-1 text-sm text-dark-500">
                        Adicione um novo contato ao sistema
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                        <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                            Informações Básicas
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Instance */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    Instância <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.instance_id}
                                    onChange={(e) => setFormData({ ...formData, instance_id: e.target.value })}
                                    className="w-full px-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    required
                                >
                                    {instances.map(instance => (
                                        <option key={instance.id} value={instance.id}>
                                            {instance.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.instance_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.instance_id}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    Telefone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Ex: 5511999999999"
                                    className="w-full px-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    required
                                />
                                <p className="mt-1 text-xs text-dark-500">
                                    Digite o número no formato internacional (código do país + DDD + número)
                                </p>
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nome do contato"
                                    className="w-full px-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@exemplo.com"
                                    className="w-full px-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    Observações
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Adicione observações sobre este contato"
                                    rows={4}
                                    className="w-full px-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tags Card */}
                    {tags.length > 0 && (
                        <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                                Tags
                            </h2>

                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                            formData.tag_ids.includes(tag.id)
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.visit('/contacts')}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Contato
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
