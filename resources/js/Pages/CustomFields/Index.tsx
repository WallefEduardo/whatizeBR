import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Plus, Type, Hash, Calendar, List, CheckSquare, FileText, GripVertical } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import Button from '@/Components/UI/Button'
import Table from '@/Components/UI/Table/Table'
import TableActions from '@/Components/UI/Table/TableActions'
import Badge from '@/Components/UI/Badge'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'
import { useConfirm } from '@/Hooks/useConfirm'
import CustomFieldForm from './Components/CustomFieldForm'

interface CustomField {
    id: string
    name: string
    field_type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox'
    options: string[] | null
    is_required: boolean
    order_index: number
    created_at: string
}

interface FieldType {
    value: string
    label: string
}

interface Props {
    customFields: CustomField[]
    fieldTypes: FieldType[]
}

const fieldTypeIcons: Record<string, React.ReactNode> = {
    text: <Type className="w-4 h-4" />,
    textarea: <FileText className="w-4 h-4" />,
    number: <Hash className="w-4 h-4" />,
    date: <Calendar className="w-4 h-4" />,
    select: <List className="w-4 h-4" />,
    checkbox: <CheckSquare className="w-4 h-4" />,
}

export default function CustomFieldsIndex({ customFields, fieldTypes }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedField, setSelectedField] = useState<CustomField | undefined>(undefined)
    const { confirm, isOpen, isLoading, options, handleConfirm, handleClose } = useConfirm()

    const handleEdit = (field: CustomField) => {
        setSelectedField(field)
        setIsEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
        setSelectedField(undefined)
    }

    const handleDelete = (field: CustomField) => {
        confirm({
            title: 'Deletar Campo',
            message: `Tem certeza que deseja deletar o campo "${field.name}"? Esta ação não pode ser desfeita e os dados deste campo serão perdidos.`,
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            variant: 'danger',
            onConfirm: async () => {
                router.delete(`/custom-fields/${field.id}`)
            },
        })
    }

    const getFieldTypeLabel = (type: string): string => {
        const fieldType = fieldTypes.find(ft => ft.value === type)
        return fieldType?.label || type
    }

    const columns = [
        {
            key: 'order',
            label: '',
            width: '40px',
            render: (field: CustomField) => (
                <div className="cursor-move text-dark-400 hover:text-dark-600">
                    <GripVertical className="w-5 h-5" />
                </div>
            ),
        },
        {
            key: 'name',
            label: 'Nome do Campo',
            render: (field: CustomField) => (
                <div className="flex items-center gap-2">
                    <div className="text-dark-400">
                        {fieldTypeIcons[field.field_type]}
                    </div>
                    <div>
                        <p className="font-medium text-dark-900 dark:text-dark-50">
                            {field.name}
                        </p>
                        <p className="text-xs text-dark-500">
                            {getFieldTypeLabel(field.field_type)}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'field_type',
            label: 'Tipo',
            render: (field: CustomField) => (
                <Badge variant="default" size="sm">
                    {getFieldTypeLabel(field.field_type)}
                </Badge>
            ),
        },
        {
            key: 'options',
            label: 'Opções',
            render: (field: CustomField) => (
                <span className="text-sm text-dark-600 dark:text-dark-400">
                    {field.field_type === 'select' && field.options
                        ? `${field.options.length} opções`
                        : '-'}
                </span>
            ),
        },
        {
            key: 'is_required',
            label: 'Obrigatório',
            render: (field: CustomField) => (
                field.is_required ? (
                    <Badge variant="warning" size="sm">Sim</Badge>
                ) : (
                    <Badge variant="default" size="sm">Não</Badge>
                )
            ),
        },
        {
            key: 'created_at',
            label: 'Criado em',
            render: (field: CustomField) => (
                <span className="text-sm text-dark-600 dark:text-dark-400">
                    {new Date(field.created_at).toLocaleDateString('pt-BR')}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Ações',
            width: '120px',
            render: (field: CustomField) => (
                <TableActions
                    onEdit={() => handleEdit(field)}
                    onDelete={() => handleDelete(field)}
                />
            ),
        },
    ]

    return (
        <AppLayout title="Campos Personalizados">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">Campos Personalizados</h1>
                        <p className="mt-1 text-sm text-dark-500">
                            Configure campos adicionais para enriquecer os dados dos seus contatos
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Campo
                    </Button>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Dica:</strong> Os campos personalizados criados aqui aparecerão automaticamente nos formulários de contato.
                        Arraste os campos para reordenar.
                    </p>
                </div>

                {/* Stats Card */}
                <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-500">Total de Campos</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                                {customFields.length}
                            </p>
                        </div>
                        <FileText className="w-8 h-8 text-dark-400 opacity-20" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700">
                    <Table
                        columns={columns}
                        data={customFields}
                        keyExtractor={(field) => field.id}
                        emptyMessage="Nenhum campo personalizado criado. Clique em 'Novo Campo' para adicionar."
                    />
                </div>
            </div>

            {/* Create Modal */}
            <CustomFieldForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                fieldTypes={fieldTypes}
                mode="create"
            />

            {/* Edit Modal */}
            <CustomFieldForm
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                fieldTypes={fieldTypes}
                customField={selectedField}
                mode="edit"
            />

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
