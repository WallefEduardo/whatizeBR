import { useState } from 'react'
import { router } from '@inertiajs/react'
import Button from '@/Components/UI/Button'
import Modal from '@/Components/UI/Modal'
import Table from '@/Components/UI/Table/Table'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'
import ColorPicker from '@/Components/UI/ColorPicker'
import { useConfirm } from '@/Hooks/useConfirm'
import { Plus, Edit2, Trash2, Power } from 'lucide-react'

interface Department {
  id: number
  name: string
  description?: string | null
  color: string
  is_active: boolean
  conversations_count?: number
  members_count?: number
  created_at?: string
}

interface Props {
  departments: Department[]
}

export default function DepartmentsTab({ departments }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { confirm, isOpen, isLoading, options, handleConfirm, handleClose } = useConfirm()

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#6366f1',
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
      color: department.color,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (department: Department) => {
    confirm({
      title: 'Deletar Departamento',
      message: `Tem certeza que deseja deletar a department "${department.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        router.delete(`/departments/${department.id}`)
      },
    })
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
      label: 'Department',
      render: (department: Department) => (
        <div className="flex items-center gap-3">
          <div
            className="px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: department.color }}
          >
            {department.name}
          </div>
        </div>
      ),
    },
    {
      key: 'color',
      label: 'Cor',
      width: '150px',
      render: (department: Department) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-dark-200 dark:border-dark-700"
            style={{ backgroundColor: department.color }}
          />
          <span className="text-sm text-dark-600 dark:text-dark-400 font-mono">
            {department.color}
          </span>
        </div>
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
      key: 'contacts_count',
      label: 'Contatos',
      width: '100px',
      render: (department: Department) => (
        <span className="text-dark-900 dark:text-dark-50">
          {department.contacts_count}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      width: '100px',
      render: (department: Department) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(department)}
            className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4 text-dark-500 dark:text-white" />
          </button>
          <button
            onClick={() => handleDelete(department)}
            className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            title="Deletar"
          >
            <Trash2 className="w-4 h-4 text-dark-500 dark:text-white" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
            Departments
          </h2>
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
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          <ColorPicker
            label="Cor *"
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
            error={errors.color}
          />

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
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          <ColorPicker
            label="Cor *"
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
            error={errors.color}
          />

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
    </div>
  )
}
