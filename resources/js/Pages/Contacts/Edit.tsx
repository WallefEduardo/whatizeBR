import { useState, FormEvent } from 'react'
import { router } from '@inertiajs/react'
import { ArrowLeft, Save } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import Button from '@/Components/UI/Button'
import Badge from '@/Components/UI/Badge'
import DynamicFieldRenderer, { CustomFieldDefinition } from '@/Components/CustomFields/DynamicFieldRenderer'
import { validateCustomFields, hasValidationErrors } from '@/Components/CustomFields/customFieldValidation'

interface Tag {
    id: string
    name: string
    color: string
}

interface Contact {
    id: string
    name: string | null
    phone: string
    email: string | null
    notes: string | null
    is_blocked: boolean
    tags: Tag[]
    custom_fields?: Record<string, any>
}

interface Props {
    contact: Contact
    tags: Tag[]
    customFields: CustomFieldDefinition[]
}

export default function ContactsEdit({ contact, tags, customFields }: Props) {
    const [formData, setFormData] = useState({
        name: contact.name || '',
        email: contact.email || '',
        notes: contact.notes || '',
        is_blocked: contact.is_blocked,
        tag_ids: contact.tags.map(t => t.id),
        custom_fields: contact.custom_fields || {} as Record<string, any>,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        // Validate custom fields on client-side
        const customFieldErrors = validateCustomFields(customFields, formData.custom_fields)

        if (hasValidationErrors(customFieldErrors)) {
            setErrors(customFieldErrors)
            setIsSubmitting(false)
            return
        }

        router.patch(`/contacts/${contact.id}`, formData, {
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

    const handleCustomFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            custom_fields: {
                ...prev.custom_fields,
                [fieldId]: value
            }
        }))
    }

    return (
        <AppLayout title={`Editar Contato - ${contact.name || contact.phone}`}>
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

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                                Editar Contato
                            </h1>
                            <p className="mt-1 text-sm text-dark-500">
                                {contact.phone}
                            </p>
                        </div>
                        <Badge variant={contact.is_blocked ? 'danger' : 'success'}>
                            {contact.is_blocked ? 'Bloqueado' : 'Ativo'}
                        </Badge>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                        <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                            Informações Básicas
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Phone (readonly) */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    Telefone
                                </label>
                                <input
                                    type="text"
                                    value={contact.phone}
                                    disabled
                                    className="w-full px-4 py-2 rounded border border-dark-300 dark:border-dark-600 bg-dark-50 dark:bg-dark-900 text-dark-500 cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-dark-500">
                                    O número de telefone não pode ser alterado
                                </p>
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

                            {/* Blocked Status */}
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_blocked}
                                        onChange={(e) => setFormData({ ...formData, is_blocked: e.target.checked })}
                                        className="w-4 h-4 rounded border-dark-300 dark:border-dark-600 text-primary-500 focus:ring-2 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                                        Bloquear este contato
                                    </span>
                                </label>
                                <p className="mt-1 ml-7 text-xs text-dark-500">
                                    Contatos bloqueados não receberão mensagens automáticas
                                </p>
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

                    {/* Custom Fields */}
                    {customFields.length > 0 && (
                        <DynamicFieldRenderer
                            fields={customFields}
                            values={formData.custom_fields}
                            onChange={handleCustomFieldChange}
                            errors={errors}
                            disabled={isSubmitting}
                        />
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
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
