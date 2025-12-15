import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import Button from '@/Components/UI/Button'
import Modal from '@/Components/UI/Modal'
import Table from '@/Components/UI/Table/Table'
import TableActions from '@/Components/UI/Table/TableActions'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'
import { useConfirm } from '@/Hooks/useConfirm'
import { Plus, Users } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
}

interface Department {
  id: number
  name: string
  color: string
}

interface Instance {
  id: number
  name: string
}

interface Member {
  id: number
  user: User
  department: Department | null
  instance: Instance | null
  is_active: boolean
  max_concurrent_chats: number
  active_conversations_count: number
  available_slots: number
  created_at: string
}

interface Props {
  members: Member[]
  users: User[]
  departments: Department[]
}

export default function MembersIndex({ members, users, departments }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    user_id: '',
    department_id: '',
    is_active: true,
    max_concurrent_chats: 5,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { confirm, isOpen, isLoading, options, handleConfirm, handleClose } = useConfirm()

  const resetForm = () => {
    setFormData({
      user_id: '',
      department_id: '',
      is_active: true,
      max_concurrent_chats: 5,
    })
    setErrors({})
    setEditingMember(null)
  }

  const handleCreate = () => {
    setIsCreateModalOpen(true)
    resetForm()
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      user_id: member.user.id.toString(),
      department_id: member.department?.id.toString() || '',
      is_active: member.is_active,
      max_concurrent_chats: member.max_concurrent_chats,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (member: Member) => {
    confirm({
      title: 'Remover Membro',
      message: `Tem certeza que deseja remover "${member.user.name}" dos membros? Esta ação não pode ser desfeita.`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        router.delete(`/members/${member.id}`)
      },
    })
  }

  const handleToggle = (member: Member) => {
    router.post(`/members/${member.id}/toggle`)
  }

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    router.post('/members', formData, {
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
    if (!editingMember) return

    setIsSubmitting(true)

    router.put(`/members/${editingMember.id}`, formData, {
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

  const getUtilizationRate = (member: Member) => {
    if (member.max_concurrent_chats === 0) return 0
    return Math.round((member.active_conversations_count / member.max_concurrent_chats) * 100)
  }

  const columns = [
    {
      key: 'user',
      label: 'Membro',
      render: (member: Member) => (
        <div>
          <div className="font-medium text-dark-900 dark:text-dark-50">
            {member.user.name}
          </div>
          <div className="text-sm text-dark-600 dark:text-dark-400">
            {member.user.email}
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Departamento',
      render: (member: Member) => (
        member.department ? (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: member.department.color }}
            />
            <span className="text-dark-900 dark:text-dark-50">
              {member.department.name}
            </span>
          </div>
        ) : (
          <span className="text-dark-500 dark:text-dark-500">-</span>
        )
      ),
    },
    {
      key: 'conversations',
      label: 'Conversas',
      width: '150px',
      render: (member: Member) => (
        <div className="space-y-1">
          <div className="text-sm text-dark-900 dark:text-dark-50">
            {member.active_conversations_count} / {member.max_concurrent_chats}
          </div>
          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${getUtilizationRate(member)}%`,
                backgroundColor: getUtilizationRate(member) > 80 ? '#ef4444' : '#22c55e',
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'available_slots',
      label: 'Slots Disponíveis',
      width: '120px',
      render: (member: Member) => (
        <span className="text-dark-900 dark:text-dark-50">
          {member.available_slots}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '100px',
      render: (member: Member) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
            member.is_active
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {member.is_active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      width: '120px',
      render: (member: Member) => (
        <TableActions
          onEdit={() => handleEdit(member)}
          onDelete={() => handleDelete(member)}
          customActions={[
            {
              label: member.is_active ? 'Desativar' : 'Ativar',
              onClick: () => handleToggle(member),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title="Membros" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
              Membros
            </h1>
            <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
              Gerencie os atendentes do sistema
            </p>
          </div>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Membro
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700">
          <Table
            columns={columns}
            data={members}
            keyExtractor={(member) => member.id}
            emptyMessage="Nenhum membro encontrado"
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Adicionar Membro"
        size="md"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Usuário *
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecione um usuário</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.user_id && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.user_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Departamento
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sem departamento</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.department_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Máx. Conversas Simultâneas *
            </label>
            <input
              type="number"
              value={formData.max_concurrent_chats}
              onChange={(e) => setFormData({ ...formData, max_concurrent_chats: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              min={1}
              max={50}
              required
            />
            {errors.max_concurrent_chats && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.max_concurrent_chats}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_create"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active_create" className="text-sm text-dark-900 dark:text-dark-50">
              Membro ativo
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
              Adicionar Membro
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Membro"
        size="md"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Departamento
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sem departamento</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.department_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Máx. Conversas Simultâneas *
            </label>
            <input
              type="number"
              value={formData.max_concurrent_chats}
              onChange={(e) => setFormData({ ...formData, max_concurrent_chats: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              min={1}
              max={50}
              required
            />
            {errors.max_concurrent_chats && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.max_concurrent_chats}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_edit"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active_edit" className="text-sm text-dark-900 dark:text-dark-50">
              Membro ativo
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
          isOpen={isOpen}
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
