import { CustomFieldDefinition } from './DynamicFieldRenderer'

interface ValidationErrors {
    [key: string]: string
}

/**
 * Validates custom field values against their definitions
 * Returns an object with field IDs as keys and error messages as values
 */
export function validateCustomFields(
    fields: CustomFieldDefinition[],
    values: Record<string, any>
): ValidationErrors {
    const errors: ValidationErrors = {}

    fields.forEach(field => {
        const value = values[field.id]
        const fieldErrors = validateField(field, value)

        if (fieldErrors.length > 0) {
            errors[`custom_fields.${field.id}`] = fieldErrors[0]
        }
    })

    return errors
}

/**
 * Validates a single custom field value
 * Returns an array of error messages
 */
export function validateField(field: CustomFieldDefinition, value: any): string[] {
    const errors: string[] = []

    // Required validation
    if (field.is_required && (value === null || value === undefined || value === '')) {
        errors.push(`O campo "${field.name}" é obrigatório`)
        return errors // Don't check other validations if required field is empty
    }

    // Skip type validation if field is not required and empty
    if (!field.is_required && (value === null || value === undefined || value === '')) {
        return errors
    }

    // Type-specific validation
    switch (field.field_type) {
        case 'text':
        case 'textarea':
            if (typeof value !== 'string') {
                errors.push(`O campo "${field.name}" deve ser um texto`)
            } else if (value.length > 1000) {
                errors.push(`O campo "${field.name}" não pode ter mais de 1000 caracteres`)
            }
            break

        case 'number':
            if (isNaN(Number(value))) {
                errors.push(`O campo "${field.name}" deve ser um número válido`)
            }
            break

        case 'date':
            // Validate YYYY-MM-DD format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            if (!dateRegex.test(value)) {
                errors.push(`O campo "${field.name}" deve estar no formato AAAA-MM-DD`)
            } else {
                // Validate actual date
                const date = new Date(value)
                if (isNaN(date.getTime())) {
                    errors.push(`O campo "${field.name}" não é uma data válida`)
                }
            }
            break

        case 'select':
            if (field.options && !field.options.includes(value)) {
                errors.push(`O valor selecionado para "${field.name}" é inválido`)
            }
            break

        case 'checkbox':
            if (typeof value !== 'boolean' && value !== '1' && value !== '0' && value !== 1 && value !== 0) {
                errors.push(`O campo "${field.name}" deve ser verdadeiro ou falso`)
            }
            break

        default:
            break
    }

    return errors
}

/**
 * Checks if there are any validation errors
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).length > 0
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ValidationErrors): string[] {
    return Object.values(errors)
}
