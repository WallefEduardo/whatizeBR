import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import Button from '@/Components/UI/Button'
import Modal from '@/Components/UI/Modal'
import Table from '@/Components/UI/Table/Table'
import TableActions from '@/Components/UI/Table/TableActions'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'
import ColorPicker from '@/Components/UI/ColorPicker'
import { useConfirm } from '@/Hooks/useConfirm'
import { Plus, Building2 } from 'lucide-react'

interface Department {
  id: number
  name: string
  description: string | null
  color: string
  is_active: boolean
  conversations_count: number
  members_count: number
  created_at: string
}

interface Props {
  departments: Department[]
}

export default function DepartmentsIndex({ departments }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { confirm, isOpen, isLoading, options, handleConfirm, handleClose } = useConfirm()

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      is_active: true,
    })
    setErrors({})
    setEditingDepartment(null)
  }

  const handleCreate = () => {
    setIsCreateModalOpen(true)
    resetForm()
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      description: department.description || '',
      color: department.color,
      is_active: department.is_active,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (department: Department) => {
    confirm({
      title: 'Deletar Departamento',
      message: `Tem certeza que deseja deletar o departamento "${department.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        router.delete(`/departments/${department.id}`)
      },
    })
  }

  const handleToggle = (department: Department) => {
    router.post(`/departments/${department.id}/toggle`)
  }

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    router.post('/departments', formData, {
      onSuccess: () => {
        setIsCreateModalOpen(false)
        resetForm()
      },
      onError: (errors) => {
        setErrors(errors)
      },
      onFinish: () => {
        setIsSubmitting(false)
      },
    })
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDepartment) return

    setIsSubmitting(true)

    router.put(`/departments/${editingDepartment.id}`, formData, {
      onSuccess: () => {
        setIsEditModalOpen(false)
        resetForm()
      },
      onError: (errors) => {
        setErrors(errors)
      },
      onFinish: () => {
        setIsSubmitting(false)
      },
    })
  }

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (department: Department) => (
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: department.color }}
          />
          <span className="font-medium text-dark-900 dark:text-dark-50">
            {department.name}
          </span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (department: Department) => (
        <span className="text-dark-600 dark:text-dark-400">
          {department.description || '-'}
        </span>
      ),
    },
    {
      key: 'members_count',
      label: 'Membros',
      width: '100px',
      render: (department: Department) => (
        <span className="text-dark-900 dark:text-dark-50">
          {department.members_count}
        </span>
      ),
    },
    {
      key: 'conversations_count',
      label: 'Conversas',
      width: '100px',
      render: (department: Department) => (
        <span className="text-dark-900 dark:text-dark-50">
          {department.conversations_count}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '100px',
      render: (department: Department) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
            department.is_active
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {department.is_active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      width: '120px',
      render: (department: Department) => (
        <TableActions
          onEdit={() => handleEdit(department)}
          onDelete={() => handleDelete(department)}
          customActions={[
            {
              label: department.is_active ? 'Desativar' : 'Ativar',
              onClick: () => handleToggle(department),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title="Departamentos" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
              Departamentos
            </h1>
            <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
              Gerencie os departamentos do sistema
            </p>
          </div>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Departamento
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700">
          <Table
            columns={columns}
            data={departments}
            keyExtractor={(department) => department.id}
            emptyMessage="Nenhum departamento encontrado"
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        show={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Departamento"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nome do departamento"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descrição do departamento"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
            )}
          </div>

          <ColorPicker
            label="Cor *"
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
            error={errors.color}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_create"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active_create" className="text-sm text-dark-900 dark:text-dark-50">
              Departamento ativo
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Criar Departamento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Departamento"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nome do departamento"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descrição do departamento"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
            )}
          </div>

          <ColorPicker
            label="Cor *"
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
            error={errors.color}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_edit"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active_edit" className="text-sm text-dark-900 dark:text-dark-50">
              Departamento ativo
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Salvar Alterações
            </Button>
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
          variant={options.variant}
          isLoading={isLoading}
        />
      )}
    </AppLayout>
  )
}
