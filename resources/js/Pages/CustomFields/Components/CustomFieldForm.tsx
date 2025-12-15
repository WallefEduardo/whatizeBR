import { useState, FormEvent } from 'react'
import { router } from '@inertiajs/react'
import { Plus, X } from 'lucide-react'
import Modal from '@/Components/UI/Modal'
import Button from '@/Components/UI/Button'
import Input from '@/Components/UI/Input'
import Select from '@/Components/UI/Select'
import Switch from '@/Components/UI/Switch'
import Badge from '@/Components/UI/Badge'

interface FieldType {
    value: string
    label: string
}

interface CustomField {
    id?: string
    name: string
    field_type: string
    options: string[] | null
    is_required: boolean
    order_index: number
}

interface CustomFieldFormProps {
    isOpen: boolean
    onClose: () => void
    fieldTypes: FieldType[]
    customField?: CustomField
    mode: 'create' | 'edit'
}

export default function CustomFieldForm({
    isOpen,
    onClose,
    fieldTypes,
    customField,
    mode = 'create'
}: CustomFieldFormProps) {
    const [formData, setFormData] = useState({
        name: customField?.name || '',
        field_type: customField?.field_type || 'text',
        is_required: customField?.is_required || false,
        order_index: customField?.order_index || 0,
    })

    const [options, setOptions] = useState<string[]>(customField?.options || [])
    const [newOption, setNewOption] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAddOption = () => {
        if (newOption.trim()) {
            setOptions([...options, newOption.trim()])
            setNewOption('')
        }
    }

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index))
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'O nome do campo é obrigatório'
        }

        if (!formData.field_type) {
            newErrors.field_type = 'O tipo do campo é obrigatório'
        }

        if (formData.field_type === 'select' && options.length === 0) {
            newErrors.options = 'Campos do tipo "Seleção" precisam ter pelo menos uma opção'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        if (!validate()) {
            return
        }

        setIsSubmitting(true)

        const submitData = {
            ...formData,
            options: formData.field_type === 'select' ? options : null,
        }

        if (mode === 'create') {
            router.post('/custom-fields', submitData, {
                onSuccess: () => {
                    onClose()
                    resetForm()
                },
                onError: (errors) => {
                    setErrors(errors as Record<string, string>)
                },
                onFinish: () => {
                    setIsSubmitting(false)
                },
            })
        } else if (customField?.id) {
            router.put(`/custom-fields/${customField.id}`, submitData, {
                onSuccess: () => {
                    onClose()
                },
                onError: (errors) => {
                    setErrors(errors as Record<string, string>)
                },
                onFinish: () => {
                    setIsSubmitting(false)
                },
            })
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            field_type: 'text',
            is_required: false,
            order_index: 0,
        })
        setOptions([])
        setNewOption('')
        setErrors({})
    }

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm()
            onClose()
        }
    }

    return (
        <Modal
            show={isOpen}
            onClose={handleClose}
            title={mode === 'create' ? 'Novo Campo Personalizado' : 'Editar Campo Personalizado'}
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome do Campo */}
                <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                        Nome do Campo <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: CPF, Data de Nascimento, Empresa..."
                        error={errors.name}
                        disabled={isSubmitting}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                </div>

                {/* Tipo do Campo */}
                <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                        Tipo do Campo <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={formData.field_type}
                        onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                        disabled={isSubmitting}
                    >
                        {fieldTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </Select>
                    {errors.field_type && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.field_type}</p>
                    )}
                    <p className="mt-1 text-xs text-dark-500">
                        Escolha o tipo de dado que este campo irá armazenar
                    </p>
                </div>

                {/* Opções (apenas para tipo select) */}
                {formData.field_type === 'select' && (
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            Opções <span className="text-red-500">*</span>
                        </label>

                        {/* Lista de opções */}
                        {options.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {options.map((option, index) => (
                                    <Badge
                                        key={index}
                                        variant="default"
                                        className="flex items-center gap-2 pr-1"
                                    >
                                        {option}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(index)}
                                            className="ml-1 hover:bg-dark-200 dark:hover:bg-dark-700 rounded p-0.5 transition-colors"
                                            disabled={isSubmitting}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Adicionar nova opção */}
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddOption()
                                    }
                                }}
                                placeholder="Digite uma opção e pressione Enter"
                                disabled={isSubmitting}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleAddOption}
                                disabled={!newOption.trim() || isSubmitting}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {errors.options && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.options}</p>
                        )}
                        <p className="mt-1 text-xs text-dark-500">
                            Adicione as opções que estarão disponíveis no campo de seleção
                        </p>
                    </div>
                )}

                {/* Campo Obrigatório */}
                <div className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-900/50 rounded border border-dark-200 dark:border-dark-700">
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                            Campo Obrigatório
                        </label>
                        <p className="text-xs text-dark-500 mt-1">
                            Quando ativado, este campo deverá ser preenchido obrigatoriamente
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_required}
                        onChange={(checked) => setFormData({ ...formData, is_required: checked })}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Ordem */}
                <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                        Ordem de Exibição
                    </label>
                    <Input
                        type="number"
                        min="0"
                        value={formData.order_index}
                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                        disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-dark-500">
                        Campos com menor número aparecem primeiro
                    </p>
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Salvando...' : mode === 'create' ? 'Criar Campo' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
