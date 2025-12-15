import { ChangeEvent } from 'react'
import Input from '@/Components/UI/Input'
import Textarea from '@/Components/UI/Textarea'
import Select from '@/Components/UI/Select'
import Checkbox from '@/Components/UI/Checkbox'
import DatePicker from '@/Components/UI/DatePicker'

export interface CustomFieldDefinition {
    id: string
    name: string
    field_type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox'
    options: string[] | null
    is_required: boolean
    order_index: number
}

interface DynamicFieldRendererProps {
    fields: CustomFieldDefinition[]
    values: Record<string, any>
    onChange: (fieldId: string, value: any) => void
    errors?: Record<string, string>
    disabled?: boolean
}

export default function DynamicFieldRenderer({
    fields,
    values,
    onChange,
    errors = {},
    disabled = false
}: DynamicFieldRendererProps) {
    if (fields.length === 0) {
        return null
    }

    const renderField = (field: CustomFieldDefinition) => {
        const value = values[field.id] || ''
        const error = errors[`custom_fields.${field.id}`] || errors[field.id]

        const commonProps = {
            disabled,
        }

        switch (field.field_type) {
            case 'text':
                return (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(field.id, e.target.value)}
                        placeholder={`Digite ${field.name.toLowerCase()}`}
                        error={error}
                        {...commonProps}
                    />
                )

            case 'textarea':
                return (
                    <Textarea
                        value={value}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(field.id, e.target.value)}
                        placeholder={`Digite ${field.name.toLowerCase()}`}
                        rows={3}
                        error={error}
                        {...commonProps}
                    />
                )

            case 'number':
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(field.id, e.target.value)}
                        placeholder={`Digite ${field.name.toLowerCase()}`}
                        error={error}
                        {...commonProps}
                    />
                )

            case 'date':
                return (
                    <Input
                        type="date"
                        value={value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(field.id, e.target.value)}
                        error={error}
                        {...commonProps}
                    />
                )

            case 'select':
                return (
                    <Select
                        value={value}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(field.id, e.target.value)}
                        error={error}
                        {...commonProps}
                    >
                        <option value="">Selecione uma opção</option>
                        {field.options?.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </Select>
                )

            case 'checkbox':
                return (
                    <div className="flex items-center">
                        <Checkbox
                            checked={value === true || value === '1' || value === 1}
                            onChange={(checked) => onChange(field.id, checked)}
                            {...commonProps}
                        />
                        <span className="ml-2 text-sm text-dark-600 dark:text-dark-400">
                            Marcar como verdadeiro
                        </span>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                Campos Personalizados
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div
                        key={field.id}
                        className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}
                    >
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            {field.name}
                            {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                        {errors[`custom_fields.${field.id}`] && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors[`custom_fields.${field.id}`]}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
