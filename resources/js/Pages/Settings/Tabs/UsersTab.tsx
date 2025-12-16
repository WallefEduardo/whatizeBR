import { useState } from 'react'
import { router } from '@inertiajs/react'
import Button from '@/Components/UI/Button'
import Modal from '@/Components/UI/Modal'
import Table from '@/Components/UI/Table/Table'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'
import { useConfirm } from '@/Hooks/useConfirm'
import { Plus, Edit2, Trash2, Power, Eye, EyeOff } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'supervisor' | 'agent'
  is_active: boolean
  avatar?: string | null
  created_at: string
}

interface Props {
  allUsers: User[]
}

export default function UsersTab({ allUsers }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'agent' as 'admin' | 'supervisor' | 'agent',
    is_active: true,
    avatar: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { confirm, isOpen, isLoading, options, handleConfirm, handleClose } = useConfirm()

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'agent',
      is_active: true,
      avatar: '',
    })
    setErrors({})
    setEditingUser(null)
    setShowPassword(false)
    setShowPasswordConfirmation(false)
  }

  const handleCreate = () => {
    setIsCreateModalOpen(true)
    resetForm()
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.role,
      is_active: user.is_active,
      avatar: user.avatar || '',
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (user: User) => {
    confirm({
      title: 'Deletar Usuário',
      message: `Tem certeza que deseja deletar o usuário "${user.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        router.delete(`/users/${user.id}`)
      },
    })
  }

  const handleToggle = (user: User) => {
    router.post(`/users/${user.id}/toggle`)
  }

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    router.post('/users', formData, {
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
    if (!editingUser) return

    setIsSubmitting(true)

    router.put(`/users/${editingUser.id}`, formData, {
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

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', className: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
      supervisor: { label: 'Supervisor', className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
      agent: { label: 'Agente', className: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.agent

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const columns = [
    {
      key: 'user',
      label: 'Usuário',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium text-dark-900 dark:text-dark-50">
              {user.name}
            </div>
            <div className="text-sm text-dark-600 dark:text-dark-400">
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Função',
      width: '120px',
      render: (user: User) => getRoleBadge(user.role),
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '100px',
      render: (user: User) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
            user.is_active
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {user.is_active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      width: '120px',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(user)}
            className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4 text-dark-500 dark:text-white" />
          </button>
          <button
            onClick={() => handleToggle(user)}
            className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            title={user.is_active ? 'Desativar' : 'Ativar'}
          >
            <Power className="w-4 h-4 text-dark-500 dark:text-white" />
          </button>
          <button
            onClick={() => handleDelete(user)}
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
            Usuários
          </h2>
          <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
            Gerencie os usuários do sistema e suas permissões
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700">
        <Table
          columns={columns}
          data={allUsers}
          keyExtractor={(user) => user.id}
          emptyMessage="Nenhum usuário encontrado"
        />
      </div>

      {/* Create Modal */}
      <Modal
        show={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Usuário"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nome do usuário"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="email@exemplo.com"
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Mínimo 8 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 dark:text-dark-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Confirmar Senha *
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirmation ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Repita a senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 dark:text-dark-400"
              >
                {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Função *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'supervisor' | 'agent' })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="agent">Agente</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.role}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Avatar (URL)
            </label>
            <input
              type="text"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://exemplo.com/avatar.jpg"
            />
            {errors.avatar && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.avatar}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_create"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800"
            />
            <label htmlFor="is_active_create" className="text-sm text-dark-900 dark:text-dark-50">
              Usuário ativo
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
              Criar Usuário
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Usuário"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nome do usuário"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="email@exemplo.com"
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Nova Senha (deixe vazio para manter)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 dark:text-dark-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirmation ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Repita a senha"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 dark:text-dark-400"
              >
                {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Função *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'supervisor' | 'agent' })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="agent">Agente</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.role}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-dark-50 mb-1">
              Avatar (URL)
            </label>
            <input
              type="text"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://exemplo.com/avatar.jpg"
            />
            {errors.avatar && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.avatar}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_edit"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800"
            />
            <label htmlFor="is_active_edit" className="text-sm text-dark-900 dark:text-dark-50">
              Usuário ativo
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
    </div>
  )
}
