# 🚀 ROADMAP - Sistema de Atendimento WhatsApp Moderno

## 📋 Visão Geral do Projeto

Sistema de atendimento omnichannel via WhatsApp usando API Meow (whatsmeow), com arquitetura escalável baseada em microserviços, filas e Kubernetes.

### Stack Tecnológica

**Frontend:**
- React 18.3+ (última versão estável)
- Inertia.js 1.0+
- TailwindCSS 3.4+
- Lucide React (ícones)
- TypeScript
- Vite

**Backend:**
- Laravel 11.x (última versão estável)
- PHP 8.3+
- PostgreSQL 16+
- Redis 7+ (cache e filas)
- Laravel Echo + Pusher/Soketi (WebSockets)

**Infraestrutura:**
- Docker + Docker Compose
- Kubernetes (K8s) para orquestração
- **API WhatsApp Custom em Go** (nossa própria implementação com private-meow)
- MinIO/S3 (armazenamento de mídias)
- RabbitMQ (filas assíncronas para comunicação)
- Nginx (proxy reverso)

**Microserviços:**
1. **API Gateway** (Laravel)
2. **WhatsApp Service Custom** (Go + private-meow + RabbitMQ)
3. **Queue Worker Service** (Laravel Workers)
4. **WebSocket Service** (Laravel Echo Server)
5. **Storage Service** (MinIO/S3)

**Arquitetura de Comunicação (Baseada em Produção Real):**
```
                    Exchange: whatsapp.direct (tipo: direct)
                                    ↓
Laravel (PHP) → Publica com Routing Keys → RabbitMQ Exchange
                                                  ↓
                        ┌────────────────────────┼────────────────────────┐
                        ↓                        ↓                        ↓
              whatsapp.replica.1      whatsapp.replica.2      whatsapp.replica.N
              (send.text,             (send.text,             (send.text,
               send.media,             send.media,             send.media,
               send.button,            send.button,            send.button,
               send.list)              send.list)              send.list)
                        ↓                        ↓                        ↓
                   API Go (Réplica 1)      API Go (Réplica 2)      API Go (Réplica N)
                        ↓                        ↓                        ↓
                   private-meow            private-meow            private-meow
                        ↓                        ↓                        ↓
                   WhatsApp                WhatsApp                WhatsApp
                   (~1000 clientes)        (~1000 clientes)        (~1000 clientes)

                        ↓ (eventos recebidos)
                   Serviço Receptivo (Go)
                        ↓
                   Publica webhook.incoming / webhook.status
                        ↓
                   whatsapp.webhook queue
                        ↓
                   Laravel (consome webhooks)

✅ 100% entrega garantida via filas RabbitMQ
✅ Exchange + Routing Keys para roteamento inteligente
✅ 1 fila por réplica (~1000 clientes por réplica)
✅ Worker pools internos com Go channels
✅ Balanceamento automático entre réplicas
```

---

## 🎨 Design System

### Filosofia de Design
- **Minimalista e Clean** - sem excessos visuais
- **Tons neutros predominantes** - cinzas para interface
- **Cores apenas para dados e status** - gráficos, métricas, alertas
- **Ícones de ações em cinza** - sem cores vibrantes nos botões de tabela
- **Border-radius consistente** - 4px padrão para manter aspecto mais quadrado e profissional

### Paleta de Cores

**Cores Principais:** Preto, Verde e Branco

```css
/* Light Mode */
--primary: #22c55e        /* Verde 500 - Green (WhatsApp-like) */
--primary-dark: #16a34a   /* Verde 600 */
--primary-light: #4ade80  /* Verde 400 */

--secondary: #171717      /* Preto/Neutro 900 */
--secondary-dark: #0a0a0a /* Preto mais escuro */
--secondary-light: #404040/* Neutro 700 */

--accent: #10b981         /* Verde Esmeralda (destaque) */

--background: #ffffff     /* Branco puro */
--surface: #fafafa        /* Neutro 50 */
--surface-2: #f5f5f5      /* Neutro 100 */

--text-primary: #171717   /* Preto (Neutro 900) */
--text-secondary: #737373 /* Neutro 500 */
--text-tertiary: #a3a3a3  /* Neutro 400 */

--border: #e5e5e5         /* Neutro 200 */
--divider: #f5f5f5        /* Neutro 100 */

--success: #22c55e        /* Verde */
--warning: #f59e0b        /* Laranja */
--error: #ef4444          /* Vermelho */
--info: #3b82f6           /* Azul */

/* Dark Mode */
--primary: #22c55e        /* Verde 500 (mantém) */
--primary-dark: #16a34a   /* Verde 600 */
--primary-light: #4ade80  /* Verde 400 */

--secondary: #fafafa      /* Branco/Neutro 50 */
--secondary-dark: #ffffff /* Branco puro */
--secondary-light: #d4d4d4/* Neutro 300 */

--accent: #34d399         /* Verde Esmeralda claro */

--background: #0a0a0a     /* Preto profundo */
--surface: #171717        /* Neutro 900 */
--surface-2: #262626      /* Neutro 800 */

--text-primary: #fafafa   /* Branco (Neutro 50) */
--text-secondary: #a3a3a3 /* Neutro 400 */
--text-tertiary: #737373  /* Neutro 500 */

--border: #262626         /* Neutro 800 */
--divider: #171717        /* Neutro 900 */

--success: #22c55e        /* Verde */
--warning: #f59e0b        /* Laranja */
--error: #ef4444          /* Vermelho */
--info: #3b82f6           /* Azul */
```

### Uso de Cores - Regras de Ouro

**✅ USAR CORES:**
- Gráficos e charts (seguir paleta)
- Badges de status (success, warning, error, info)
- Métricas e KPIs
- Alertas e notificações
- Botões de ação primária (verde)

**❌ NÃO USAR CORES:**
- Ícones de ações em tabelas (usar cinza: #737373 ou #a3a3a3)
- Botões secundários (usar cinza)
- Ícones de navegação (usar cinza)
- Elementos decorativos (manter neutro)

**TailwindCSS Config:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22c55e',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        dark: {
          DEFAULT: '#171717',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
    },
  },
}
```

### Tipografia

```css
Font Family: 'Inter Variable' (Google Fonts)
Font Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

Heading 1: 2.25rem (36px) - font-bold
Heading 2: 1.875rem (30px) - font-semibold
Heading 3: 1.5rem (24px) - font-semibold
Heading 4: 1.25rem (20px) - font-medium
Body: 0.875rem (14px) - font-normal
Small: 0.75rem (12px) - font-normal
```

### Ícones
- Biblioteca: **Lucide React**
- Tamanho padrão: 20px
- Stroke width: 2

### Espaçamento
- Base: 4px (0.25rem)
- Sistema: 4, 8, 12, 16, 24, 32, 48, 64px

### Border Radius
- **Padrão (Botões, Inputs, Cards): 4px** - aspecto mais profissional e menos arredondado
- Pequeno (Badges): 3px
- Modal/Dropdown: 6px
- Avatar: 50% (circular)

### Sombras

```css
/* Light Mode */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)

/* Dark Mode */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.5)
```

---

## 📦 Organização de Componentes e Código

### Princípios de Organização
1. **Componentes pequenos e focados** - máximo 200-300 linhas por arquivo
2. **Reutilização máxima** - criar componentes base e compor
3. **Separação de responsabilidades** - lógica separada de apresentação
4. **Nomenclatura clara** - nomes descritivos e consistentes
5. **Co-location** - agrupar arquivos relacionados
6. **NUNCA usar alert() nativo** - sempre usar modais customizados para confirmações
7. **Documentar componentes** - manter arquivo COMPONENTS.md atualizado com lista limpa de todos os componentes

### Arquivo de Documentação de Componentes

**IMPORTANTE:** Criar e manter sempre atualizado o arquivo `COMPONENTS.md` na raiz do projeto.

**Formato (sem poluição, só o essencial):**
```markdown
# Componentes Reutilizáveis

## UI Base
- `resources/js/Components/UI/Button.tsx` - Button
- `resources/js/Components/UI/Input.tsx` - Input
- `resources/js/Components/UI/Select.tsx` - Select
- `resources/js/Components/UI/Modal.tsx` - Modal
- `resources/js/Components/UI/ConfirmDialog.tsx` - ConfirmDialog
- `resources/js/Components/UI/Badge.tsx` - Badge
- `resources/js/Components/UI/DatePicker.tsx` - DatePicker

## Table
- `resources/js/Components/UI/Table/Table.tsx` - Table
- `resources/js/Components/UI/Table/TableActions.tsx` - TableActions

## Layout
- `resources/js/Components/Layout/AppLayout.tsx` - AppLayout
- `resources/js/Components/Layout/Sidebar.tsx` - Sidebar
```

### Estrutura de Componentes UI Base

Todos os componentes UI devem seguir este padrão:

```tsx
// resources/js/Components/UI/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/Lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'rounded', // 4px border-radius

          // Variants
          {
            'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500': variant === 'primary',
            'bg-dark-200 text-dark-900 hover:bg-dark-300 focus:ring-dark-400 dark:bg-dark-700 dark:text-dark-50': variant === 'secondary',
            'hover:bg-dark-100 text-dark-700 dark:hover:bg-dark-800 dark:text-dark-300': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500': variant === 'danger',
          },

          // Sizes
          {
            'text-sm px-3 py-1.5 h-8': size === 'sm',
            'text-sm px-4 py-2 h-10': size === 'md',
            'text-base px-6 py-3 h-12': size === 'lg',
          },

          className
        )}
        {...props}
      >
        {isLoading && <LoadingSpinner className="mr-2" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
```

### Componente Table com Ações em Cinza

```tsx
// resources/js/Components/UI/Table/TableActions.tsx
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react'
import Dropdown from '@/Components/UI/Dropdown'
import Button from '@/Components/UI/Button'

interface TableActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  customActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'danger'
  }>
}

export default function TableActions({ onView, onEdit, onDelete, customActions }: TableActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Ícones em CINZA - não coloridos */}
      {onView && (
        <button
          onClick={onView}
          className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
          title="Visualizar"
        >
          <Eye className="w-4 h-4 text-dark-500" /> {/* CINZA */}
        </button>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
          title="Editar"
        >
          <Edit className="w-4 h-4 text-dark-500" /> {/* CINZA */}
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Deletar"
        >
          <Trash2 className="w-4 h-4 text-dark-500 hover:text-red-600" /> {/* CINZA com hover vermelho */}
        </button>
      )}

      {customActions && customActions.length > 0 && (
        <Dropdown>
          <Dropdown.Trigger>
            <button className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
              <MoreVertical className="w-4 h-4 text-dark-500" /> {/* CINZA */}
            </button>
          </Dropdown.Trigger>
          <Dropdown.Content>
            {customActions.map((action, idx) => (
              <Dropdown.Item key={idx} onClick={action.onClick}>
                {action.icon}
                <span>{action.label}</span>
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>
      )}
    </div>
  )
}
```

### Componente Table Reutilizável

```tsx
// resources/js/Components/UI/Table/Table.tsx
import { ReactNode } from 'react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  onSort?: (key: string) => void
  isLoading?: boolean
  emptyMessage?: string
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  onSort,
  isLoading,
  emptyMessage = 'Nenhum registro encontrado'
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-dark-500">
                Carregando...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-dark-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-dark-900 dark:text-dark-100">
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
```

### Componente Modal Reutilizável

```tsx
// resources/js/Components/UI/Modal.tsx
import { Fragment, ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'
import Button from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-md bg-white dark:bg-dark-800 shadow-xl transition-all`}
              >
                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-dark-200 dark:border-dark-700">
                    <Dialog.Title className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                    >
                      <X className="w-5 h-5 text-dark-500" />
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="px-6 py-4">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="px-6 py-4 bg-dark-50 dark:bg-dark-900 border-t border-dark-200 dark:border-dark-700">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
```

### Componente ConfirmDialog (Substituir alert())

**REGRA: NUNCA usar `alert()`, `confirm()` ou `prompt()` nativos do JavaScript!**

```tsx
// resources/js/Components/UI/ConfirmDialog.tsx
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import Button from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const icons = {
    danger: <XCircle className="w-6 h-6 text-red-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-orange-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />,
    success: <CheckCircle className="w-6 h-6 text-green-600" />,
  }

  const bgColors = {
    danger: 'bg-red-50 dark:bg-red-900/10',
    warning: 'bg-orange-50 dark:bg-orange-900/10',
    info: 'bg-blue-50 dark:bg-blue-900/10',
    success: 'bg-green-50 dark:bg-green-900/10',
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-white dark:bg-dark-800 shadow-xl transition-all">
                <div className="p-6">
                  {/* Icon + Title */}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 rounded-full p-2 ${bgColors[variant]}`}>
                      {icons[variant]}
                    </div>
                    <div className="flex-1">
                      <Dialog.Title className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2">
                        {title}
                      </Dialog.Title>
                      <p className="text-sm text-dark-600 dark:text-dark-400">
                        {message}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      {cancelText}
                    </Button>
                    <Button
                      variant={variant === 'danger' ? 'danger' : 'primary'}
                      onClick={onConfirm}
                      isLoading={isLoading}
                    >
                      {confirmText}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
```

### Hook useConfirm para facilitar o uso

```tsx
// resources/js/Hooks/useConfirm.ts
import { useState } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  onConfirm: () => void | Promise<void>
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts)
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    if (!options) return

    setIsLoading(true)
    try {
      await options.onConfirm()
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false)
    }
  }

  return {
    confirm,
    isOpen,
    isLoading,
    options,
    handleConfirm,
    handleClose,
  }
}
```

### Exemplo de Uso em uma Página

```tsx
// resources/js/Pages/Contacts/Index.tsx
import AppLayout from '@/Components/Layout/AppLayout'
import Table from '@/Components/UI/Table/Table'
import TableActions from '@/Components/UI/Table/TableActions'
import Button from '@/Components/UI/Button'
import Modal from '@/Components/UI/Modal'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'
import { useConfirm } from '@/Hooks/useConfirm'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { router } from '@inertiajs/react'

interface Contact {
  id: number
  name: string
  phone: string
  email: string
}

export default function ContactsIndex({ contacts }: { contacts: Contact[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { confirm, isOpen, isLoading, options, handleConfirm, handleClose } = useConfirm()

  const handleDelete = (contact: Contact) => {
    // NUNCA usar alert() ou confirm() nativo!
    // ❌ ERRADO: if (confirm('Tem certeza?')) { ... }

    // ✅ CORRETO: usar ConfirmDialog
    confirm({
      title: 'Deletar Contato',
      message: `Tem certeza que deseja deletar o contato "${contact.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        router.delete(`/contacts/${contact.id}`)
      },
    })
  }

  const columns = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'E-mail' },
    {
      key: 'actions',
      label: 'Ações',
      width: '120px',
      render: (contact: Contact) => (
        <TableActions
          onView={() => router.visit(`/contacts/${contact.id}`)}
          onEdit={() => router.visit(`/contacts/${contact.id}/edit`)}
          onDelete={() => handleDelete(contact)}
        />
      ),
    },
  ]

  return (
    <AppLayout title="Contatos">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">Contatos</h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Contato
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700">
          <Table
            columns={columns}
            data={contacts}
            keyExtractor={(contact) => contact.id}
          />
        </div>
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Contato"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary">Salvar</Button>
          </div>
        }
      >
        <p className="text-dark-600 dark:text-dark-400">Conteúdo do formulário...</p>
      </Modal>

      {/* ConfirmDialog Reutilizável */}
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
```

### Exemplo de Uso Direto (sem hook)

```tsx
// resources/js/Pages/Contacts/Index.tsx
import AppLayout from '@/Components/Layout/AppLayout'
import Table from '@/Components/UI/Table/Table'
import TableActions from '@/Components/UI/Table/TableActions'
import Button from '@/Components/UI/Button'
import Modal from '@/Components/UI/Modal'
import { useState } from 'react'
import { Plus } from 'lucide-react'

interface Contact {
  id: number
  name: string
  phone: string
  email: string
}

export default function ContactsIndex({ contacts }: { contacts: Contact[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const columns = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'E-mail' },
    {
      key: 'actions',
      label: 'Ações',
      width: '120px',
      render: (contact: Contact) => (
        <TableActions
          onView={() => console.log('View', contact.id)}
          onEdit={() => console.log('Edit', contact.id)}
          onDelete={() => console.log('Delete', contact.id)}
        />
      ),
    },
  ]

  return (
    <AppLayout title="Contatos">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">Contatos</h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Contato
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700">
          <Table
            columns={columns}
            data={contacts}
            keyExtractor={(contact) => contact.id}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Contato"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary">Salvar</Button>
          </div>
        }
      >
        {/* Form content here */}
        <p className="text-dark-600 dark:text-dark-400">Conteúdo do formulário...</p>
      </Modal>
    </AppLayout>
  )
}
```

---

## 📁 Estrutura de Pastas

### Backend (Laravel)

```
whatizeBr/
├── app/
│   ├── Broadcasting/
│   │   └── Channels/
│   │       └── ConversationChannel.php
│   ├── Console/
│   │   └── Commands/
│   │       ├── WhatsAppConnectCommand.php
│   │       └── WhatsAppSyncCommand.php
│   ├── Events/
│   │   ├── MessageReceived.php
│   │   ├── MessageSent.php
│   │   ├── MessageRead.php
│   │   └── TypingIndicator.php
│   ├── Exceptions/
│   │   ├── WhatsAppConnectionException.php
│   │   └── RateLimitException.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   └── WhatsAppWebhookController.php
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php
│   │   │   │   └── RegisterController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── ChatController.php
│   │   │   ├── ContactController.php
│   │   │   ├── ConversationController.php
│   │   │   ├── DepartmentController.php
│   │   │   ├── TagController.php
│   │   │   ├── MemberController.php
│   │   │   ├── ConnectionController.php
│   │   │   ├── ScheduleController.php
│   │   │   ├── BroadcastController.php
│   │   │   ├── ChatbotController.php
│   │   │   ├── FlowBuilderController.php
│   │   │   ├── CustomFieldController.php
│   │   │   ├── SettingsController.php
│   │   │   └── ApiConfigController.php
│   │   ├── Middleware/
│   │   │   ├── CheckInstanceActive.php
│   │   │   ├── RateLimitMiddleware.php
│   │   │   └── VerifyWebhookSignature.php
│   │   └── Resources/
│   │       ├── ConversationResource.php
│   │       ├── MessageResource.php
│   │       └── ContactResource.php
│   ├── Jobs/
│   │   ├── SendWhatsAppTextMessage.php
│   │   ├── SendWhatsAppMediaMessage.php
│   │   ├── SendWhatsAppButtonMessage.php
│   │   ├── SendWhatsAppListMessage.php
│   │   ├── SendBroadcastMessage.php
│   │   ├── ProcessIncomingMessage.php
│   │   ├── ProcessChatbotFlow.php
│   │   ├── SyncWhatsAppContacts.php
│   │   └── MarkMessageAsRead.php
│   ├── Listeners/
│   │   ├── BroadcastMessageToWebSocket.php
│   │   └── NotifyAgentNewMessage.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── WhatsAppInstance.php
│   │   ├── Conversation.php
│   │   ├── Message.php
│   │   ├── Contact.php
│   │   ├── Department.php
│   │   ├── Tag.php
│   │   ├── Member.php
│   │   ├── Schedule.php
│   │   ├── Broadcast.php
│   │   ├── Chatbot.php
│   │   ├── ChatbotFlow.php
│   │   ├── ChatbotNode.php
│   │   ├── CustomField.php
│   │   └── Setting.php
│   ├── Notifications/
│   │   └── NewMessageNotification.php
│   ├── Policies/
│   │   ├── ConversationPolicy.php
│   │   └── MessagePolicy.php
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   ├── BroadcastServiceProvider.php
│   │   └── EventServiceProvider.php
│   ├── Services/
│   │   ├── WhatsAppService.php
│   │   ├── ChatbotService.php
│   │   ├── BroadcastService.php
│   │   ├── MediaService.php
│   │   └── RateLimiterService.php
│   └── Traits/
│       ├── HasWhatsAppInstance.php
│       └── Searchable.php
├── bootstrap/
├── config/
│   ├── whatsapp.php
│   ├── broadcasting.php
│   ├── queue.php
│   └── filesystems.php
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_users_table.php
│   │   ├── 2024_01_01_000002_create_whatsapp_instances_table.php
│   │   ├── 2024_01_01_000003_create_contacts_table.php
│   │   ├── 2024_01_01_000004_create_conversations_table.php
│   │   ├── 2024_01_01_000005_create_messages_table.php
│   │   ├── 2024_01_01_000006_create_departments_table.php
│   │   ├── 2024_01_01_000007_create_tags_table.php
│   │   ├── 2024_01_01_000008_create_members_table.php
│   │   ├── 2024_01_01_000009_create_schedules_table.php
│   │   ├── 2024_01_01_000010_create_broadcasts_table.php
│   │   ├── 2024_01_01_000011_create_chatbots_table.php
│   │   ├── 2024_01_01_000012_create_chatbot_flows_table.php
│   │   ├── 2024_01_01_000013_create_chatbot_nodes_table.php
│   │   ├── 2024_01_01_000014_create_custom_fields_table.php
│   │   ├── 2024_01_01_000015_create_settings_table.php
│   │   ├── 2024_01_01_000016_create_jobs_table.php
│   │   └── 2024_01_01_000017_create_cache_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       └── SettingsSeeder.php
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   ├── php/
│   │   └── Dockerfile
│   └── worker/
│       └── Dockerfile
├── public/
├── resources/
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   ├── Components/
│   │   │   ├── Layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Breadcrumbs.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   ├── UI/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Dropdown.tsx
│   │   │   │   ├── Tooltip.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── Switch.tsx
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Radio.tsx
│   │   │   │   ├── Textarea.tsx
│   │   │   │   ├── DatePicker.tsx
│   │   │   │   ├── ColorPicker.tsx
│   │   │   │   └── FileUpload.tsx
│   │   │   ├── Chat/
│   │   │   │   ├── ChatList.tsx
│   │   │   │   ├── ConversationItem.tsx
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   ├── AttachmentMenu.tsx
│   │   │   │   ├── EmojiPicker.tsx
│   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   ├── MediaPreview.tsx
│   │   │   │   └── QuickReplies.tsx
│   │   │   ├── Chatbot/
│   │   │   │   ├── FlowBuilder.tsx
│   │   │   │   ├── FlowCanvas.tsx
│   │   │   │   ├── NodePalette.tsx
│   │   │   │   ├── NodeEditor.tsx
│   │   │   │   ├── Nodes/
│   │   │   │   │   ├── StartNode.tsx
│   │   │   │   │   ├── TextNode.tsx
│   │   │   │   │   ├── ButtonNode.tsx
│   │   │   │   │   ├── ListNode.tsx
│   │   │   │   │   ├── MediaNode.tsx
│   │   │   │   │   ├── DelayNode.tsx
│   │   │   │   │   ├── ConditionNode.tsx
│   │   │   │   │   ├── ApiNode.tsx
│   │   │   │   │   ├── TransferNode.tsx
│   │   │   │   │   └── EndNode.tsx
│   │   │   │   └── FlowSimulator.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── ConversationsChart.tsx
│   │   │   │   ├── ResponseTimeChart.tsx
│   │   │   │   ├── AgentPerformance.tsx
│   │   │   │   └── RecentActivity.tsx
│   │   │   └── Common/
│   │   │       ├── SearchBar.tsx
│   │   │       ├── FilterPanel.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       └── ErrorBoundary.tsx
│   │   ├── Hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useTheme.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useToast.ts
│   │   │   └── useMediaQuery.ts
│   │   ├── Lib/
│   │   │   ├── api.ts
│   │   │   ├── websocket.ts
│   │   │   ├── utils.ts
│   │   │   ├── constants.ts
│   │   │   └── validators.ts
│   │   ├── Pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Chat/
│   │   │   │   ├── Index.tsx
│   │   │   │   └── Show.tsx
│   │   │   ├── Contacts/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   ├── Edit.tsx
│   │   │   │   └── Show.tsx
│   │   │   ├── Departments/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   └── Edit.tsx
│   │   │   ├── Tags/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   └── Edit.tsx
│   │   │   ├── Members/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   └── Edit.tsx
│   │   │   ├── Connections/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   └── QRCode.tsx
│   │   │   ├── Schedules/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   └── Edit.tsx
│   │   │   ├── Broadcasts/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   └── Show.tsx
│   │   │   ├── Chatbots/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   ├── Edit.tsx
│   │   │   │   └── Builder.tsx
│   │   │   ├── CustomFields/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   └── Edit.tsx
│   │   │   └── Settings/
│   │   │       ├── Index.tsx
│   │   │       ├── General.tsx
│   │   │       ├── WhatsApp.tsx
│   │   │       ├── Notifications.tsx
│   │   │       └── ApiConfig.tsx
│   │   ├── Types/
│   │   │   ├── index.d.ts
│   │   │   ├── models.d.ts
│   │   │   └── inertia.d.ts
│   │   ├── app.tsx
│   │   └── bootstrap.ts
│   └── views/
│       └── app.blade.php
├── routes/
│   ├── web.php
│   ├── api.php
│   ├── channels.php
│   └── console.php
├── storage/
├── tests/
│   ├── Feature/
│   └── Unit/
├── .env.example
├── .gitignore
├── composer.json
├── package.json
├── docker-compose.yml
├── kubernetes/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   └── hpa.yaml (Horizontal Pod Autoscaler)
└── README.md
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role ENUM('admin', 'agent', 'supervisor') DEFAULT 'agent',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### 2. whatsapp_instances
```sql
CREATE TABLE whatsapp_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    token VARCHAR(255) UNIQUE NOT NULL,
    webhook_secret VARCHAR(255),
    status ENUM('disconnected', 'connecting', 'connected', 'authenticated', 'failed') DEFAULT 'disconnected',
    qr_code TEXT,
    connected_at TIMESTAMP,
    last_seen_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instances_user_id ON whatsapp_instances(user_id);
CREATE INDEX idx_instances_status ON whatsapp_instances(status);
CREATE INDEX idx_instances_phone ON whatsapp_instances(phone_number);
```

#### 3. contacts
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    email VARCHAR(255),
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    is_blocked BOOLEAN DEFAULT FALSE,
    last_interaction_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(instance_id, phone)
);

CREATE INDEX idx_contacts_instance ON contacts(instance_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE FULLTEXT INDEX idx_contacts_search ON contacts(name, phone, email);
```

#### 4. departments
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_departments_instance ON departments(instance_id);
```

#### 5. tags
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(instance_id, name)
);

CREATE INDEX idx_tags_instance ON tags(instance_id);
```

#### 6. members
```sql
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_concurrent_chats INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, instance_id)
);

CREATE INDEX idx_members_user ON members(user_id);
CREATE INDEX idx_members_instance ON members(instance_id);
CREATE INDEX idx_members_department ON members(department_id);
```

#### 7. conversations
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    status ENUM('open', 'pending', 'closed') DEFAULT 'open',
    is_group BOOLEAN DEFAULT FALSE,
    group_name VARCHAR(255),
    group_avatar_url VARCHAR(500),
    unread_count INT DEFAULT 0,
    last_message_id UUID,
    last_message_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_instance ON conversations(instance_id);
CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_conversations_assigned ON conversations(assigned_to);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

#### 8. conversation_tags
```sql
CREATE TABLE conversation_tags (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (conversation_id, tag_id)
);

CREATE INDEX idx_conversation_tags_conversation ON conversation_tags(conversation_id);
CREATE INDEX idx_conversation_tags_tag ON conversation_tags(tag_id);
```

#### 9. messages
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id VARCHAR(255) UNIQUE,
    direction ENUM('inbound', 'outbound') NOT NULL,
    from_phone VARCHAR(20) NOT NULL,
    to_phone VARCHAR(20) NOT NULL,
    type ENUM('text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'button', 'list', 'reaction', 'sticker') NOT NULL,
    content TEXT,
    media_url VARCHAR(500),
    media_type VARCHAR(50),
    media_size BIGINT,
    thumbnail_url VARCHAR(500),
    caption TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    replied_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    status ENUM('pending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_instance ON messages(instance_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_message_id ON messages(message_id);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE FULLTEXT INDEX idx_messages_search ON messages(content);
```

#### 10. schedules
```sql
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type ENUM('daily', 'weekly', 'monthly', 'once') NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    recipients JSONB NOT NULL, -- Array de telefones
    message_type ENUM('text', 'image', 'video', 'document') NOT NULL,
    message_content TEXT,
    media_url VARCHAR(500),
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedules_instance ON schedules(instance_id);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_scheduled_at ON schedules(scheduled_at);
```

#### 11. broadcasts
```sql
CREATE TABLE broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB DEFAULT '{}', -- Filtros de contatos (tags, department, etc)
    message_type ENUM('text', 'image', 'video', 'document', 'button', 'list') NOT NULL,
    message_content TEXT,
    media_url VARCHAR(500),
    buttons JSONB,
    list_options JSONB,
    status ENUM('draft', 'scheduled', 'processing', 'completed', 'failed') DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    read_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_broadcasts_instance ON broadcasts(instance_id);
CREATE INDEX idx_broadcasts_status ON broadcasts(status);
```

#### 12. chatbots
```sql
CREATE TABLE chatbots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type ENUM('keyword', 'always', 'business_hours', 'custom') DEFAULT 'keyword',
    trigger_value VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chatbots_instance ON chatbots(instance_id);
CREATE INDEX idx_chatbots_active ON chatbots(is_active);
```

#### 13. chatbot_flows
```sql
CREATE TABLE chatbot_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    nodes JSONB NOT NULL, -- Array de nodes do flow
    edges JSONB NOT NULL, -- Array de connections entre nodes
    start_node_id VARCHAR(255) NOT NULL,
    variables JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chatbot_flows_chatbot ON chatbot_flows(chatbot_id);
```

#### 14. chatbot_sessions
```sql
CREATE TABLE chatbot_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
    flow_id UUID REFERENCES chatbot_flows(id) ON DELETE CASCADE,
    current_node_id VARCHAR(255),
    variables JSONB DEFAULT '{}',
    status ENUM('active', 'completed', 'failed', 'cancelled') DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chatbot_sessions_conversation ON chatbot_sessions(conversation_id);
CREATE INDEX idx_chatbot_sessions_status ON chatbot_sessions(status);
```

#### 15. custom_fields
```sql
CREATE TABLE custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'number', 'date', 'select', 'checkbox', 'textarea') NOT NULL,
    options JSONB, -- Para tipo select
    is_required BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_custom_fields_instance ON custom_fields(instance_id);
```

#### 16. settings
```sql
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(instance_id, key)
);

CREATE INDEX idx_settings_instance ON settings(instance_id);
CREATE INDEX idx_settings_key ON settings(key);
```

#### 17. quick_replies
```sql
CREATE TABLE quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    shortcut VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    media_url VARCHAR(500),
    media_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(instance_id, shortcut)
);

CREATE INDEX idx_quick_replies_instance ON quick_replies(instance_id);
CREATE INDEX idx_quick_replies_shortcut ON quick_replies(shortcut);
```

#### 18. jobs (Laravel Queue)
```sql
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    reserved_at INT,
    available_at INT NOT NULL,
    created_at INT NOT NULL
);

CREATE INDEX idx_jobs_queue ON jobs(queue);
```

#### 19. failed_jobs
```sql
CREATE TABLE failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_failed_jobs_uuid ON failed_jobs(uuid);
```

---

## 🔧 Configurações de Ambiente

### .env.example

```bash
# App
APP_NAME="WhatizeBr"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://app.whatize.com.br

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=whatize
DB_USERNAME=postgres
DB_PASSWORD=

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1

# Queue
QUEUE_CONNECTION=redis
QUEUE_FAILED_DRIVER=database

# Broadcasting
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=
RABBITMQ_VHOST=/
RABBITMQ_EXCHANGE=whatsapp.direct
RABBITMQ_WEBHOOK_QUEUE=whatsapp.webhook

# WhatsApp API Custom (Go Connection Service)
WHATSAPP_CONNECTION_SERVICE_URL=http://connection-service:8082
WHATSAPP_ADMIN_TOKEN=
WHATSAPP_WEBHOOK_SECRET=

# Storage (MinIO/S3)
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=whatize-media
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true

# Mail
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="${APP_NAME}"

# Rate Limiting
RATE_LIMIT_PER_CONTACT=10 # mensagens por minuto por contato
RATE_LIMIT_GLOBAL=1000 # mensagens por minuto global

# Session
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# Cache
CACHE_DRIVER=redis

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=info
```

---

## 🐳 Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Laravel App
  app:
    build:
      context: ./docker/php
      dockerfile: Dockerfile
    container_name: whatize_app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
      - ./docker/php/php.ini:/usr/local/etc/php/php.ini
    networks:
      - whatize_network
    depends_on:
      - postgres
      - redis
      - rabbitmq
    environment:
      - APP_ENV=production
      - CONTAINER_ROLE=app

  # Nginx
  nginx:
    image: nginx:alpine
    container_name: whatize_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./:/var/www
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./storage/logs/nginx:/var/log/nginx
    networks:
      - whatize_network
    depends_on:
      - app

  # Queue Worker
  queue:
    build:
      context: ./docker/worker
      dockerfile: Dockerfile
    container_name: whatize_queue
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
    networks:
      - whatize_network
    depends_on:
      - postgres
      - redis
    command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600

  # Scheduler
  scheduler:
    build:
      context: ./docker/php
      dockerfile: Dockerfile
    container_name: whatize_scheduler
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
    networks:
      - whatize_network
    depends_on:
      - postgres
      - redis
    command: sh -c "while true; do php artisan schedule:run --verbose --no-interaction & sleep 60; done"

  # PostgreSQL
  postgres:
    image: postgres:16-alpine
    container_name: whatize_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: whatize
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - whatize_network

  # Redis
  redis:
    image: redis:7-alpine
    container_name: whatize_redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - whatize_network

  # RabbitMQ (Message Broker)
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: whatize_rabbitmq
    restart: unless-stopped
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "5672:5672"   # AMQP
      - "15672:15672" # Management UI
    networks:
      - whatize_network

  # WhatsApp Connection Service (Go)
  connection-service:
    build:
      context: ../whatsapp-api-go
      dockerfile: deployments/docker/Dockerfile.connection
    container_name: whatize_connection_service
    restart: unless-stopped
    env_file:
      - ../whatsapp-api-go/.env.connection
    ports:
      - "8082:8082" # HTTP API
      - "8083:8083" # WebSocket
    networks:
      - whatize_network
    depends_on:
      - postgres
      - rabbitmq

  # WhatsApp Receptive Service (Go)
  receptive-service:
    build:
      context: ../whatsapp-api-go
      dockerfile: deployments/docker/Dockerfile.receptive
    container_name: whatize_receptive_service
    restart: unless-stopped
    env_file:
      - ../whatsapp-api-go/.env.receptive
    networks:
      - whatize_network
    depends_on:
      - postgres
      - rabbitmq

  # WhatsApp Replica Services (Go) - 3 replicas
  replica-service-1:
    build:
      context: ../whatsapp-api-go
      dockerfile: deployments/docker/Dockerfile.replica
    container_name: whatize_replica_service_1
    restart: unless-stopped
    env_file:
      - ../whatsapp-api-go/.env.replica
    environment:
      - REPLICA_NUMBER=1
    networks:
      - whatize_network
    depends_on:
      - postgres
      - rabbitmq
      - minio

  replica-service-2:
    build:
      context: ../whatsapp-api-go
      dockerfile: deployments/docker/Dockerfile.replica
    container_name: whatize_replica_service_2
    restart: unless-stopped
    env_file:
      - ../whatsapp-api-go/.env.replica
    environment:
      - REPLICA_NUMBER=2
    networks:
      - whatize_network
    depends_on:
      - postgres
      - rabbitmq
      - minio

  replica-service-3:
    build:
      context: ../whatsapp-api-go
      dockerfile: deployments/docker/Dockerfile.replica
    container_name: whatize_replica_service_3
    restart: unless-stopped
    env_file:
      - ../whatsapp-api-go/.env.replica
    environment:
      - REPLICA_NUMBER=3
    networks:
      - whatize_network
    depends_on:
      - postgres
      - rabbitmq
      - minio

  # MinIO (S3-compatible storage)
  minio:
    image: minio/minio:latest
    container_name: whatize_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${AWS_ACCESS_KEY_ID}
      MINIO_ROOT_PASSWORD: ${AWS_SECRET_ACCESS_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - whatize_network

networks:
  whatize_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  minio_data:
```

---

## ☸️ Kubernetes Deployment

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whatize-app
  labels:
    app: whatize
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: whatize
      tier: backend
  template:
    metadata:
      labels:
        app: whatize
        tier: backend
    spec:
      containers:
      - name: app
        image: registry.example.com/whatize:latest
        ports:
        - containerPort: 9000
        env:
        - name: APP_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: whatize-config
              key: db_host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: whatize-secrets
              key: db_password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 9000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 9000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whatize-queue
spec:
  replicas: 2
  selector:
    matchLabels:
      app: whatize
      tier: queue
  template:
    metadata:
      labels:
        app: whatize
        tier: queue
    spec:
      containers:
      - name: queue-worker
        image: registry.example.com/whatize:latest
        command: ["php", "artisan", "queue:work"]
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
# Nota: Os deployments dos serviços Go WhatsApp (receptive, connection, replica)
# estão documentados em ROADMAP_API_GO.md
```

### hpa.yaml (Auto Scaling)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: whatize-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: whatize-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: whatize-queue-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: whatize-queue
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Pods
    pods:
      metric:
        name: queue_length
      target:
        type: AverageValue
        averageValue: "100"
```

---

## 📝 ROADMAP DE DESENVOLVIMENTO

### FASE 1: Setup Inicial e Infraestrutura (Semana 1-2)

#### 1.1 Configuração Base
- [x] Instalar Laravel 11 com configuração inicial
- [x] Configurar Inertia.js + React + TypeScript + Vite
- [x] Setup TailwindCSS com configuração de tema (light/dark)
- [x] Configurar ESLint + Prettier
- [x] Configurar Git + Gitflow
- [x] Criar estrutura de pastas completa

#### 1.2 Docker & Infraestrutura
- [x] Criar Dockerfile para PHP/Laravel
- [x] Configurar docker-compose.yml (Laravel + PostgreSQL + Redis + RabbitMQ)
- [x] Setup PostgreSQL + Redis
- [x] Setup RabbitMQ para filas
- [x] Setup MinIO para storage de mídias (depois com a API Go)
- [x] Configurar Nginx reverse proxy

#### 1.3 Design System Base
- [x] Instalar Lucide React
- [x] Instalar e configurar Inter Variable font
- [x] Criar arquivo de configuração de cores (Tailwind)
- [x] Implementar ThemeProvider (Context API)
- [x] **Criar arquivo COMPONENTS.md** na raiz do projeto (lista limpa de componentes)
- [x] Criar componentes UI base:
  - [x] Button (border-radius: 4px, variantes: primary, secondary, ghost, danger)
  - [x] Input
  - [x] Select
  - [x] Modal (border-radius: 6px)
  - [x] **ConfirmDialog** (substituir alert/confirm nativos)
  - [x] Card (border-radius: 4px)
  - [x] Badge (border-radius: 3px)
  - [x] Avatar (circular)
  - [x] Dropdown
  - [x] Tooltip
  - [x] Toast
  - [x] Switch
  - [x] Checkbox
  - [x] Radio
  - [x] Textarea
  - [x] DatePicker
  - [x] FileUpload
- [x] Criar Table components:
  - [x] Table (genérico e reutilizável)
  - [x] TableActions (ícones em CINZA #737373)
  - [x] Pagination
- [x] **Criar componentes especializados avançados:**
  - [x] **CurrencyInput** (calculadora: 1→R$0,01, 12→R$0,12, trabalha com centavos)
  - [x] **DateTimePicker** (data + hora, bonito e customizado)
  - [x] **SearchableSelect** (dropdown com busca em cima)
  - [x] **MultiSelect** (seleção múltipla com busca e badges)
  - [x] **Breadcrumbs** (navegação com ícones)
- [x] Criar Hook useConfirm para facilitar uso de ConfirmDialog
- [x] **Atualizar COMPONENTS.md** com todos os componentes criados
- [x] **Criar arquivo COMPONENTES_ESPECIALIZADOS.md** com código completo

---

### FASE 2: Autenticação e Layout (Semana 3)

#### 2.1 Sistema de Autenticação
- [x] Criar migrations de users
- [x] Implementar Login/Register com Laravel Breeze
- [x] Criar páginas de autenticação (React)
- [x] Implementar multi-tenancy (por instância)
- [x] Sistema de roles (admin, supervisor, agent)

#### 2.2 Layout Principal
- [x] Criar AppLayout com Sidebar + Navbar
- [x] Implementar Sidebar responsivo
- [x] Criar Navbar com search, notificações, user menu
- [x] Implementar Breadcrumbs dinâmico
- [x] Criar Toggle de tema (light/dark)
- [x] Menu mobile (hamburger)

---

### FASE 3: Integração WhatsApp com RabbitMQ (Semana 4-5)

#### 3.1 Backend - RabbitMQ Integration
- [x] Instalar pacote php-amqplib (composer require php-amqplib/php-amqplib)
- [x] Criar RabbitMQService (app/Services/RabbitMQ/RabbitMQService.php)
- [x] Implementar método publishToExchange(routingKey, payload)
- [x] Configurar Exchange "whatsapp.direct" (tipo: direct)
- [x] Configurar conexão RabbitMQ no .env

**Exemplo de RabbitMQService.php:**
```php
<?php
namespace App\Services\RabbitMQ;

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQService
{
    private $connection;
    private $channel;
    private $exchange = 'whatsapp.direct';

    public function __construct()
    {
        $this->connection = new AMQPStreamConnection(
            config('rabbitmq.host'),
            config('rabbitmq.port'),
            config('rabbitmq.user'),
            config('rabbitmq.password')
        );
        $this->channel = $this->connection->channel();

        // Declarar exchange (idempotente)
        $this->channel->exchange_declare(
            $this->exchange,
            'direct',
            false,
            true,  // durable
            false
        );
    }

    public function publishWithRoutingKey(string $routingKey, array $payload): void
    {
        $message = new AMQPMessage(
            json_encode($payload),
            ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]
        );

        $this->channel->basic_publish($message, $this->exchange, $routingKey);
    }

    public function __destruct()
    {
        $this->channel->close();
        $this->connection->close();
    }
}
```

#### 3.2 Backend - WhatsApp Service (Laravel)
- [x] Criar migrations para whatsapp_instances
- [x] Criar Model WhatsAppInstance
- [x] Implementar WhatsAppService que publica no RabbitMQ
- [x] Criar Jobs para enviar mensagens via RabbitMQ:
  - [x] SendTextMessageJob (routing key: send.text)
  - [x] SendMediaMessageJob (routing key: send.media)
  - [x] SendButtonMessageJob (routing key: send.button)
  - [x] SendListMessageJob (routing key: send.list)

**Exemplo de SendTextMessageJob.php:**
```php
<?php
namespace App\Jobs\WhatsApp;

use App\Services\RabbitMQ\RabbitMQService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendTextMessageJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable;

    public function __construct(
        public string $instanceToken,
        public string $recipient,
        public string $message,
        public ?array $metadata = null
    ) {}

    public function handle(RabbitMQService $rabbitmq): void
    {
        $payload = [
            'instance_token' => $this->instanceToken,
            'recipient' => $this->recipient,
            'message' => $this->message,
            'metadata' => $this->metadata ?? [],
        ];

        $rabbitmq->publishWithRoutingKey('send.text', $payload);
    }
}
```

#### 3.3 Backend - Webhook Consumer (Laravel)
- [x] Criar Command para consumir fila webhook (php artisan rabbitmq:consume-webhooks)
- [x] Criar WhatsAppWebhookHandler
- [x] Implementar verificação HMAC signature
- [x] Criar Events para cada tipo de webhook:
  - [x] MessageReceived
  - [x] MessageSent
  - [x] MessageRead
  - [x] TypingIndicator
  - [x] PresenceUpdate
- [x]Criar Listeners para broadcast via WebSocket

**Exemplo de ConsumeWebhooksCommand.php:**
```php
<?php
namespace App\Console\Commands;

use App\Services\RabbitMQ\RabbitMQService;
use PhpAmqpLib\Message\AMQPMessage;
use Illuminate\Console\Command;

class ConsumeWebhooksCommand extends Command
{
    protected $signature = 'rabbitmq:consume-webhooks';
    protected $description = 'Consume webhooks from RabbitMQ';

    public function handle(RabbitMQService $rabbitmq): void
    {
        $channel = $rabbitmq->getChannel();
        $queueName = 'whatsapp.webhook';

        $callback = function (AMQPMessage $msg) {
            $payload = json_decode($msg->body, true);

            // Processar webhook
            match($payload['type']) {
                'message' => event(new MessageReceived($payload)),
                'message_status' => event(new MessageStatusUpdated($payload)),
                default => $this->warn("Unknown webhook type: {$payload['type']}")
            };

            $msg->ack(); // Acknowledge message
        };

        $channel->basic_consume($queueName, '', false, false, false, false, $callback);

        while ($channel->is_consuming()) {
            $channel->wait();
        }
    }
}
```

#### 3.4 Backend - HTTP Endpoints (para Connection Service)
- [x] Criar endpoints REST para comunicação com Connection Service (Go):
  - [x] POST /api/whatsapp/instances - criar instância
  - [x] GET /api/whatsapp/instances/{token}/qr - obter QR Code
  - [x] GET /api/whatsapp/instances/{token}/status - obter status
  - [x] DELETE /api/whatsapp/instances/{token} - desconectar/deletar
- [x] Implementar rate limiting por contato

#### 3.3 Frontend - Conexão WhatsApp
- [x] Página de listagem de instâncias
- [x] Modal de criação de instância
- [x] Página de exibição de QR Code
- [x] Status de conexão em tempo real
- [x] Indicador visual de conexão (badge)

---

### FASE 4: Contatos e Conversas (Semana 6-7)

#### 4.1 Backend - Contatos
- [x] Criar migrations para contacts
- [x] Criar Model Contact com relacionamentos
- [x] Criar ContactController (CRUD)
- [x] Implementar busca full-text
- [x] Implementar filtros (tags, departamento)
- [x] Job para sincronizar contatos do WhatsApp

#### 4.2 Backend - Conversas
- [x] Criar migrations para conversations
- [x] Criar Model Conversation
- [x] Criar ConversationController
- [x] Implementar listagem com paginação
- [x] Filtros (status, atendente, departamento, tags)
- [x] Contador de não lidas

#### 4.3 Backend - Mensagens
- [x] Criar migrations para messages
- [x] Criar Model Message
- [x] Jobs para envio de mensagens:
  - [x] SendWhatsAppTextMessage
  - [x] SendWhatsAppMediaMessage
  - [x] SendWhatsAppButtonMessage
  - [x] SendWhatsAppListMessage
- [x] Job ProcessIncomingMessage
- [x] Job MarkMessageAsRead

#### 4.4 Frontend - Contatos
- [x] Página de listagem de contatos
- [x] Barra de busca e filtros
- [x] Modal de criação/edição de contato
- [x] Página de detalhes do contato
- [x] Integração com custom fields

#### 4.5 Frontend - Chat ao Vivo
- [x] Layout split: Lista de conversas + Janela de chat
- [x] ConversationItem component (preview da conversa)
- [x] ChatWindow component
- [x] MessageBubble component (suporte a todos os tipos)
- [x] MessageInput com:
  - [x] Input de texto
  - [x] Botão de emoji picker
  - [x] Botão de anexo (menu)
  - [x] Botão de áudio
  - [x] Quick replies
- [x] Indicador de digitação (typing)
- [x] Status de leitura (checkmarks)
- [x] Upload de arquivos (drag & drop)
- [x] Preview de mídias
- [x] Reply/Quote mensagem

---

### FASE 5: WebSockets e Tempo Real (Semana 8) ✅

#### 5.1 Laravel Echo + Pusher/Soketi
- [x] Configurar Laravel Broadcasting
- [x] Configurar Soketi (self-hosted, gratuito)
- [x] Adicionar Soketi ao docker-compose.yml
- [x] Configurar .env com credenciais do Soketi
- [x] Instalar pusher-php-server (backend)
- [x] Instalar laravel-echo + pusher-js (frontend)
- [x] Criar Private Channels para conversas (ConversationChannel)
- [x] Registrar channels em routes/channels.php
- [x] Broadcast de eventos:
  - [x] MessageReceived
  - [x] MessageSent
  - [x] MessageRead
  - [x] TypingIndicator
  - [ ] ConversationAssigned (opcional)

#### 5.2 Frontend - WebSocket Client
- [x] Configurar Laravel Echo no bootstrap.ts
- [x] Adicionar types TypeScript para Echo/Pusher
- [x] Criar useWebSocket hook
- [x] Conectar ao Laravel Echo
- [x] Listen em eventos de mensagem
- [x] Criar guia de integração (docs/WEBSOCKET_INTEGRATION_GUIDE.md)
- [x] Atualizar UI em tempo real (implementar no Chat/Index.tsx)
  - [x] Estado local de mensagens (localMessages)
  - [x] Recebimento de mensagens ao vivo
  - [x] Atualização de status (read/delivered/sent)
  - [x] Typing indicator (contato digitando...)
  - [x] Auto-scroll para novas mensagens
  - [x] Envio de typing indicator ao digitar
- [ ] Notificações de áudio para novas mensagens
- [ ] Desktop notifications (se permitido)

---

### FASE 6: Departamentos, Tags e Membros (Semana 9)

#### 6.1 Backend - Departamentos
- [x] Criar migrations para departments
- [x] Model Department
- [x] DepartmentController (CRUD)
- [x] Relacionamento com conversas

#### 6.2 Backend - Tags
- [x] Criar migrations para tags
- [x] Model Tag
- [x] TagController (CRUD)
- [x] Pivot table conversation_tags

#### 6.3 Backend - Membros/Atendentes
- [x] Criar migrations para members
- [x] Model Member
- [x] MemberController
- [x] Lógica de distribuição automática de conversas
- [x] Max concurrent chats por atendente

#### 6.4 Frontend - CRUD
- [x] Página de Departamentos (lista + modal create/edit)
- [x] Página de Tags (lista + modal create/edit)
- [x] Página de Membros (lista + modal create/edit)
- [x] Color picker para tags e departamentos
- [x] Formulários de atribuição

---

### FASE 7: Agendamentos (Semana 10)

#### 7.1 Backend
- [x] Criar migrations para schedules
- [x] Model Schedule
- [x] ScheduleController
- [x] Job ProcessScheduledMessages
- [x] Command no scheduler do Laravel
- [x] Suporte a recorrência (daily, weekly, monthly, once)

#### 7.2 Frontend
- [x] Página de listagem de agendamentos
- [x] Modal de criação de agendamento
- [x] Seletor de data/hora
- [x] Seletor de recorrência
- [x] Preview de mensagem
- [x] Status de envio (progresso)

---

### FASE 8: Transmissão/Broadcast (Semana 11)

#### 8.1 Backend
- [x] Criar migrations para broadcasts
- [x] Model Broadcast
- [x] BroadcastController
- [x] BroadcastService (lógica de filtros)
- [x] Job SendBroadcastMessage
- [x] Respeitar rate limits (1 msg/6s por contato)
- [x] Tracking de envios/leituras

#### 8.2 Frontend
- [x] Página de listagem de broadcasts
- [x] Modal de criação de broadcast
- [x] Seletor de filtros (tags, departamento, etc)
- [x] Preview de destinatários
- [x] Estatísticas de envio
- [x] Gráfico de progressão

---

### FASE 9: Chatbot com Flow Builder (Semana 12-14)

#### 9.1 Backend - Chatbots
- [x] Criar migrations para chatbots
- [x] Model Chatbot
- [x] ChatbotController
- [x] Criar migrations para chatbot_flows
- [x] Model ChatbotFlow
- [x] Criar migrations para chatbot_sessions
- [x] Model ChatbotSession

#### 9.2 Backend - ChatbotService
- [x] ChatbotService (engine de execução)
- [x] Suporte a nodes:
  - [x] Start Node
  - [x] Text Node
  - [x] Button Node
  - [x] List Node
  - [x] Media Node (image, video, document)
  - [x] Delay Node
  - [x] Condition Node (if/else)
  - [x] API Node (webhook externo)
  - [x] Transfer Node (transferir para atendente)
  - [x] End Node
- [x] Variáveis dinâmicas ({{name}}, {{phone}}, etc)
- [x] Job ProcessChatbotFlow

#### 9.3 Frontend - Flow Builder
- [x] Instalar react-flow ou xyflow
- [x] FlowBuilder component (canvas drag & drop)
- [x] NodePalette (lista de nodes disponíveis)
- [x] NodeEditor (sidebar para editar node selecionado)
- [x] Implementar cada tipo de node:
  - [x] StartNode
  - [x] TextNode
  - [x] ButtonNode
  - [x] ListNode
  - [x] MediaNode
  - [x] DelayNode
  - [x] ConditionNode
  - [x] ApiNode
  - [x] TransferNode
  - [x] EndNode
- [x] Validação de flow (start node obrigatório, etc)
- [x] Salvar/Carregar flow
- [x] FlowSimulator (teste de flow)

#### 9.4 Frontend - Chatbot Management
- [ ] Página de listagem de chatbots
- [ ] Modal de criação de chatbot
- [ ] Configuração de triggers (keyword, always, etc)
- [ ] Toggle ativo/inativo
- [ ] Prioridade de execução

---

### FASE 10: Campos Personalizados (Semana 15)

#### 10.1 Backend ✅
- [x] Criar migrations para custom_fields
- [x] Model CustomField
- [x] CustomFieldController
- [x] Validação dinâmica por tipo de campo

#### 10.2 Frontend ✅
- [x] Página de gerenciamento de campos
- [x] Modal de criação/edição
- [x] Renderização dinâmica de campos no formulário de contato
- [x] Validação client-side

---

### FASE 11: Dashboard e Relatórios (Semana 16)

#### 11.1 Backend - Analytics
- [x] Criar queries otimizadas para estatísticas:
  - [x] Total de conversas (hoje, semana, mês)
  - [x] Taxa de resposta
  - [x] Tempo médio de primeira resposta
  - [x] Tempo médio de resolução
  - [x] Conversas por atendente
  - [x] Conversas por departamento
  - [x] Horários de pico
  - [x] Mensagens enviadas vs recebidas
- [x] Cache de estatísticas (Redis)

#### 11.2 Frontend - Dashboard
- [ ] Layout de dashboard com grid responsivo
- [ ] StatsCard component (cards de métricas)
- [ ] ConversationsChart (gráfico de conversas por hora/dia)
- [ ] ResponseTimeChart
- [ ] AgentPerformance (tabela/gráfico)
- [ ] RecentActivity (feed)
- [ ] Filtro por período (hoje, 7 dias, 30 dias, custom)

---

### FASE 12: Configurações e API Config (Semana 17)

#### 12.1 Backend
- [ ] Criar migrations para settings
- [ ] Model Setting
- [ ] SettingsController
- [ ] Configurações:
  - [ ] Nome da empresa
  - [ ] Logo
  - [ ] Timezone
  - [ ] Horário comercial
  - [ ] Mensagem de boas-vindas
  - [ ] Mensagem de ausência
  - [ ] Auto-assign
  - [ ] Max concurrent chats
  - [ ] Webhook URLs

#### 12.2 Frontend - Settings
- [ ] Página de configurações com Tabs
- [ ] Tab General (nome, logo, etc)
- [ ] Tab WhatsApp (instâncias, webhooks)
- [ ] Tab Notificações
- [ ] Tab API Config
- [ ] Formulários de atualização

---

### FASE 13: Quick Replies (Semana 18)

#### 13.1 Backend
- [ ] Criar migrations para quick_replies
- [ ] Model QuickReply
- [ ] QuickReplyController

#### 13.2 Frontend
- [ ] Página de gerenciamento de respostas rápidas
- [ ] Modal de criação/edição
- [ ] Atalho no input (/ para abrir menu)
- [ ] Busca por shortcut
- [ ] Preview de mensagem

---

### FASE 14: Busca Global e Filtros Avançados (Semana 19)

#### 14.1 Backend
- [ ] Implementar busca full-text em mensagens
- [ ] Implementar busca em contatos
- [ ] Filtros combinados (AND/OR)
- [ ] Highlight de resultados

#### 14.2 Frontend
- [ ] SearchBar global (Navbar)
- [ ] Modal de resultados com tabs (conversas, contatos, mensagens)
- [ ] FilterPanel avançado
- [ ] Highlight de texto buscado

---

### FASE 15: Notificações (Semana 20)

#### 15.1 Backend
- [ ] Laravel Notifications
- [ ] Notificação de nova mensagem
- [ ] Notificação de conversa atribuída
- [ ] Configuração de preferências por usuário

#### 15.2 Frontend
- [ ] Dropdown de notificações (Navbar)
- [ ] Badge de contador
- [ ] Marcar como lida
- [ ] Desktop notifications
- [ ] Áudio de notificação

---

### FASE 16: Testes e Otimização (Semana 21-22)

#### 16.1 Testes Backend
- [ ] Unit tests para Services
- [ ] Feature tests para Controllers
- [ ] Testes de Jobs
- [ ] Testes de Webhooks
- [ ] Testes de rate limiting

#### 16.2 Testes Frontend
- [ ] Testes de componentes (Vitest + React Testing Library)
- [ ] Testes E2E (Playwright)

#### 16.3 Otimização
- [ ] Lazy loading de rotas
- [ ] Code splitting
- [ ] Otimização de queries (N+1)
- [ ] Eager loading
- [ ] Índices de banco
- [ ] Cache de queries pesadas
- [ ] Compressão de assets
- [ ] CDN para arquivos estáticos

---

### FASE 17: Deploy e DevOps (Semana 23-24)

#### 17.1 CI/CD
- [ ] Configurar GitHub Actions
- [ ] Pipeline de testes
- [ ] Build de imagens Docker
- [ ] Push para registry

#### 17.2 Kubernetes
- [ ] Configurar cluster K8s
- [ ] Deployments
- [ ] Services
- [ ] Ingress (NGINX)
- [ ] ConfigMaps
- [ ] Secrets
- [ ] HPA (Horizontal Pod Autoscaler)
- [ ] PersistentVolumes

#### 17.3 Monitoring
- [ ] Logs centralizados (ELK ou Loki)
- [ ] Métricas (Prometheus + Grafana)
- [ ] Alertas
- [ ] Health checks

---

## 🎯 Features Extras (Backlog Futuro)

### Prioridade Média
- [ ] Integração com API oficial do WhatsApp Business
- [ ] Integração com Baileys
- [ ] Relatórios exportáveis (PDF, Excel)
- [ ] Gravação de áudio direto do navegador
- [ ] Chamadas de voz/vídeo (se suportado pela API)
- [ ] Templates de mensagem
- [ ] Multi-idioma (i18n)
- [ ] Modo de alta performance (virtualização de listas)
- [ ] PWA (Progressive Web App)

### Prioridade Baixa
- [ ] Integração com CRM externo (API REST)
- [ ] SDK/API pública para terceiros
- [ ] Marketplace de plugins
- [ ] Sistema de tickets
- [ ] Integrações com Zapier/Make
- [ ] IA para sugestões de resposta
- [ ] Análise de sentimento
- [ ] Chatbot com NLP

---

## 🔒 Segurança e Boas Práticas

### Checklist de Segurança

- [ ] Validação de inputs (client + server)
- [ ] Sanitização de dados
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] SQL injection prevention (prepared statements)
- [ ] Rate limiting em todas as rotas públicas
- [ ] Autenticação de webhooks (HMAC)
- [ ] Criptografia de dados sensíveis
- [ ] HTTPS obrigatório
- [ ] Headers de segurança (CSP, HSTS, etc)
- [ ] Logs de auditoria
- [ ] Backup automático de banco
- [ ] Rotação de secrets
- [ ] Princípio do menor privilégio

---

## 📚 Documentação

### A ser criado
- [ ] README.md detalhado
- [ ] Documentação de API (Swagger/OpenAPI)
- [ ] Guia de instalação
- [ ] Guia de desenvolvimento
- [ ] Guia de deploy
- [ ] Troubleshooting
- [ ] Changelog

---

## 🚀 Próximos Passos Imediatos

1. **Aprovar este roadmap** e ajustar se necessário
2. **Criar 2 repositórios Git**:
   - `whatize-laravel` (Laravel + React)
   - `whatsapp-api-go` (API Go com 3 serviços)
3. **Instalar Laravel 11** + dependências (incluindo php-amqplib)
4. **Configurar Inertia.js + React + TypeScript**
5. **Setup Docker Compose**:
   - Laravel (PHP-FPM + Nginx)
   - PostgreSQL 16
   - Redis 7
   - RabbitMQ (com Management UI)
   - MinIO/S3
   - 3 Serviços Go (Connection, Receptive, Replica × 3)
6. **Setup RabbitMQ Exchange** (whatsapp.direct)
7. **Criar design system base** (componentes UI)
8. **Iniciar desenvolvimento em paralelo**:
   - Laravel: FASE 1-2 (autenticação, estrutura base)
   - API Go: FASE 1-3 (setup, private-meow, RabbitMQ)
9. **Integrar Laravel ↔ RabbitMQ ↔ Go** (FASE 3 Laravel)

---

## 📞 Referências Técnicas

### API WhatsApp Custom
- **private-meow** (biblioteca Go): https://github.com/renatokeys/private-meow
- **Nosso roadmap da API Go**: ver ROADMAP_API_GO.md
- **RabbitMQ Go Client**: https://github.com/rabbitmq/amqp091-go
- **php-amqplib** (Laravel): https://github.com/php-amqplib/php-amqplib

### Stack
- Laravel: https://laravel.com/docs/11.x
- React: https://react.dev
- Inertia.js: https://inertiajs.com
- TailwindCSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev
- React Flow: https://reactflow.dev
- Laravel Echo: https://laravel.com/docs/11.x/broadcasting

---

---

## 🏗️ Resumo da Arquitetura Final

### Componentes Principais

**Laravel (Backend Principal):**
- API REST para frontend React
- Autenticação e autorização
- Regras de negócio
- Gerenciamento de dados (PostgreSQL)
- Publica mensagens no RabbitMQ com routing keys
- Consome webhooks do RabbitMQ

**API Go (3 Serviços Independentes):**

1. **Connection Service** (8082/8083)
   - Gerencia conexões WhatsApp
   - Gera QR Codes
   - HTTP API para Laravel
   - WebSocket para status real-time

2. **Receptive Service** (8081)
   - Processa mensagens recebidas do WhatsApp
   - Publica webhooks no RabbitMQ
   - Worker pool interno (Go channels)

3. **Replica Services** (8084 × N)
   - Consome filas de réplica (whatsapp.replica.N)
   - Envia mensagens para WhatsApp
   - Worker pool interno (Go channels)
   - Auto-scaling via Kubernetes HPA

**RabbitMQ (Message Broker):**
- Exchange: whatsapp.direct (tipo: direct)
- Routing Keys: send.text, send.media, send.button, send.list, webhook.incoming, webhook.status
- Queues: whatsapp.replica.1, .2, .N + whatsapp.webhook
- 100% garantia de entrega

**PostgreSQL:**
- Banco compartilhado entre Laravel e serviços Go
- Schemas separados se necessário

**MinIO/S3:**
- Armazenamento de mídias (imagens, vídeos, documentos)

### Fluxo de Envio de Mensagem

```
1. Frontend (React) → Laravel Controller
2. Laravel → dispatch(SendTextMessageJob)
3. Job → RabbitMQService->publishWithRoutingKey('send.text', payload)
4. RabbitMQ Exchange → Distribui para whatsapp.replica.1, .2, .N
5. Replica Service (Go) → Consome da sua fila
6. Go Worker Pool → Processa mensagem
7. private-meow → Envia para WhatsApp
8. Replica Service → Publica status no RabbitMQ (webhook.status)
9. Laravel Consumer → Recebe status e atualiza banco
10. Laravel → Broadcast via WebSocket
11. Frontend → Atualiza UI em tempo real
```

### Fluxo de Recebimento de Mensagem

```
1. WhatsApp → private-meow
2. Receptive Service (Go) → Processa evento
3. Go Worker Pool → Organiza por tipo
4. Receptive Service → Publica no RabbitMQ (webhook.incoming)
5. Laravel Consumer → Recebe webhook
6. Laravel → Salva no banco + dispara eventos
7. Laravel → Broadcast via WebSocket
8. Frontend → Atualiza UI em tempo real
```

---

## 👑 SUPERADMIN (Opcional - Gerenciamento Global)

> **IMPORTANTE:** Superadmin é OPCIONAL. O sistema funciona perfeitamente sem ele!
> Cada usuário cria sua conta e gerencia suas próprias instâncias normalmente.

### O que é o Superadmin?

É uma **área administrativa global** para **gerenciar TODO o sistema** (todas as contas, todas as instâncias).

**Diferenças:**

| Aspecto | Usuário Normal | Superadmin |
|---------|---------------|------------|
| Rota | `/dashboard` | `/superadmin` |
| Acesso | Vê APENAS suas instâncias | Vê TODAS as instâncias |
| Permissões | Gerencia sua conta | Gerencia todas as contas |
| Middleware | `auth` | `auth, superadmin` |
| Database | Filtra por `user_id` | Acessa tudo (sem filtro) |

---

### Estrutura de Banco (Superadmin)

**NÃO precisa de banco separado!** Usa o mesmo banco, mesmas tabelas.

#### Modificação na tabela `users`:

```sql
ALTER TABLE users ADD COLUMN is_superadmin BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_users_superadmin ON users(is_superadmin);
```

**Seed inicial do superadmin:**

```php
// database/seeders/SuperadminSeeder.php
DB::table('users')->insert([
    'name' => 'Super Admin',
    'email' => 'admin@whatize.com.br',
    'password' => Hash::make('senha-super-segura'),
    'is_superadmin' => true,
    'role' => 'admin',
    'created_at' => now(),
    'updated_at' => now(),
]);
```

---

### Middleware Superadmin

```php
// app/Http/Middleware/CheckSuperadmin.php
<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckSuperadmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || !auth()->user()->is_superadmin) {
            abort(403, 'Acesso negado. Apenas superadmins podem acessar esta área.');
        }

        return $next($request);
    }
}
```

**Registrar no `bootstrap/app.php`:**

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'superadmin' => \App\Http\Middleware\CheckSuperadmin::class,
    ]);
})
```

---

### Rotas Superadmin

```php
// routes/web.php

// Área do Superadmin (protegida)
Route::prefix('superadmin')
    ->middleware(['auth', 'superadmin'])
    ->group(function () {
        // Dashboard Global
        Route::get('/', [SuperadminController::class, 'index'])->name('superadmin.index');

        // Gestão de Usuários
        Route::resource('users', SuperadminUserController::class)->names([
            'index' => 'superadmin.users.index',
            'create' => 'superadmin.users.create',
            'store' => 'superadmin.users.store',
            'edit' => 'superadmin.users.edit',
            'update' => 'superadmin.users.update',
            'destroy' => 'superadmin.users.destroy',
        ]);

        // Gestão de Instâncias (Todas)
        Route::get('/instances', [SuperadminInstanceController::class, 'index'])->name('superadmin.instances.index');
        Route::delete('/instances/{instance}', [SuperadminInstanceController::class, 'destroy'])->name('superadmin.instances.destroy');
        Route::post('/instances/{instance}/disconnect', [SuperadminInstanceController::class, 'disconnect'])->name('superadmin.instances.disconnect');

        // Métricas Globais
        Route::get('/metrics', [SuperadminMetricsController::class, 'index'])->name('superadmin.metrics');

        // Configurações do Sistema
        Route::get('/settings', [SuperadminSettingsController::class, 'index'])->name('superadmin.settings.index');
        Route::put('/settings', [SuperadminSettingsController::class, 'update'])->name('superadmin.settings.update');

        // Logs e Auditoria
        Route::get('/logs', [SuperadminLogsController::class, 'index'])->name('superadmin.logs');

        // Health Check de Serviços
        Route::get('/health', [SuperadminHealthController::class, 'index'])->name('superadmin.health');
    });
```

---

### Controllers Superadmin

#### SuperadminController.php (Dashboard Global)

```php
// app/Http/Controllers/Superadmin/SuperadminController.php
<?php
namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WhatsAppInstance;
use App\Models\Message;
use App\Models\Conversation;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SuperadminController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::count(),
            'total_instances' => WhatsAppInstance::count(),
            'active_instances' => WhatsAppInstance::where('status', 'authenticated')->count(),
            'total_messages_today' => Message::whereDate('created_at', today())->count(),
            'total_conversations' => Conversation::count(),
            'active_conversations' => Conversation::where('status', 'open')->count(),
        ];

        // Top 10 usuários com mais instâncias
        $topUsers = User::withCount('whatsappInstances')
            ->orderByDesc('whatsapp_instances_count')
            ->limit(10)
            ->get();

        // Instâncias recentes
        $recentInstances = WhatsAppInstance::with('user')
            ->latest()
            ->limit(10)
            ->get();

        // Mensagens por dia (últimos 30 dias)
        $messagesPerDay = Message::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Superadmin/Dashboard', [
            'stats' => $stats,
            'topUsers' => $topUsers,
            'recentInstances' => $recentInstances,
            'messagesPerDay' => $messagesPerDay,
        ]);
    }
}
```

#### SuperadminUserController.php (Gestão de Usuários)

```php
// app/Http/Controllers/Superadmin/SuperadminUserController.php
<?php
namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class SuperadminUserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::withCount(['whatsappInstances', 'conversations'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('Superadmin/Users/Index', [
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function destroy(User $user)
    {
        // Prevenir deletar o próprio superadmin
        if ($user->is_superadmin) {
            return back()->with('error', 'Não é possível deletar um superadmin.');
        }

        $user->delete(); // Cascade deleta instâncias, conversas, etc

        return back()->with('success', 'Usuário deletado com sucesso.');
    }
}
```

#### SuperadminInstanceController.php (Gestão de Instâncias)

```php
// app/Http/Controllers/Superadmin/SuperadminInstanceController.php
<?php
namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppInstance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperadminInstanceController extends Controller
{
    public function index(Request $request)
    {
        $instances = WhatsAppInstance::with('user')
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('name', 'like', "%{$search}%")
                ->orWhere('phone_number', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('Superadmin/Instances/Index', [
            'instances' => $instances,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function destroy(WhatsAppInstance $instance)
    {
        $instance->delete();
        return back()->with('success', 'Instância deletada com sucesso.');
    }

    public function disconnect(WhatsAppInstance $instance)
    {
        // Chamar API Go para desconectar
        $instance->update(['status' => 'disconnected']);
        return back()->with('success', 'Instância desconectada com sucesso.');
    }
}
```

---

### Frontend Superadmin (React)

#### Páginas

```
resources/js/Pages/Superadmin/
├── Dashboard.tsx                 # Dashboard global
├── Users/
│   ├── Index.tsx                 # Lista de usuários
│   ├── Create.tsx                # Criar usuário
│   └── Edit.tsx                  # Editar usuário
├── Instances/
│   └── Index.tsx                 # Lista de TODAS as instâncias
├── Metrics.tsx                   # Métricas globais
├── Settings.tsx                  # Configurações do sistema
├── Logs.tsx                      # Logs e auditoria
└── Health.tsx                    # Health check de serviços
```

#### Exemplo: Dashboard.tsx

```tsx
// resources/js/Pages/Superadmin/Dashboard.tsx
import AppLayout from '@/Components/Layout/AppLayout'
import { Head } from '@inertiajs/react'
import StatsCard from '@/Components/Dashboard/StatsCard'
import { Users, Smartphone, MessageSquare, Activity } from 'lucide-react'

export default function SuperadminDashboard({ stats, topUsers, recentInstances, messagesPerDay }) {
  return (
    <AppLayout title="Superadmin Dashboard">
      <Head title="Superadmin Dashboard" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
            Dashboard Global
          </h1>
          <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm font-medium">
            Superadmin
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Usuários"
            value={stats.total_users}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Instâncias Conectadas"
            value={`${stats.active_instances}/${stats.total_instances}`}
            icon={Smartphone}
            color="green"
          />
          <StatsCard
            title="Mensagens Hoje"
            value={stats.total_messages_today}
            icon={MessageSquare}
            color="purple"
          />
          <StatsCard
            title="Conversas Ativas"
            value={stats.active_conversations}
            icon={Activity}
            color="orange"
          />
        </div>

        {/* Top Usuários */}
        <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Top 10 Usuários (Mais Instâncias)</h2>
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Instâncias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
              {topUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-dark-500">{user.email}</td>
                  <td className="px-4 py-3 text-sm font-medium">{user.whatsapp_instances_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gráfico de Mensagens */}
        <div className="bg-white dark:bg-dark-800 rounded shadow-sm border border-dark-200 dark:border-dark-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Mensagens (Últimos 30 Dias)</h2>
          {/* Adicionar gráfico aqui (Chart.js ou Recharts) */}
        </div>
      </div>
    </AppLayout>
  )
}
```

---

### Menu Sidebar (Superadmin)

**Modificar `Sidebar.tsx` para mostrar link do Superadmin:**

```tsx
// resources/js/Components/Layout/Sidebar.tsx
import { Link, usePage } from '@inertiajs/react'
import { Shield } from 'lucide-react'

export default function Sidebar() {
  const { auth } = usePage().props

  return (
    <aside className="...">
      {/* Menu normal */}
      <nav>...</nav>

      {/* Link para Superadmin (só aparece se for superadmin) */}
      {auth.user.is_superadmin && (
        <div className="mt-auto pt-4 border-t border-dark-200 dark:border-dark-700">
          <Link
            href="/superadmin"
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Superadmin</span>
          </Link>
        </div>
      )}
    </aside>
  )
}
```

---

### Funcionalidades do Superadmin

#### Dashboard Global
- ✅ Total de usuários cadastrados
- ✅ Total de instâncias (ativas/inativas)
- ✅ Mensagens enviadas (hoje, semana, mês)
- ✅ Conversas ativas globalmente
- ✅ Gráficos de uso
- ✅ Top usuários (mais instâncias, mais mensagens)

#### Gestão de Usuários
- ✅ Listar TODOS os usuários
- ✅ Criar novos usuários
- ✅ Editar usuários
- ✅ Deletar usuários (com cascade)
- ✅ Ver instâncias de cada usuário
- ✅ Ver métricas de cada usuário
- ✅ **Logar como usuário (Impersonate)** - para dar suporte

#### Gestão de Instâncias
- ✅ Listar TODAS as instâncias (de todos os usuários)
- ✅ Ver qual usuário é dono
- ✅ Desconectar instância
- ✅ Deletar instância
- ✅ Ver status em tempo real
- ✅ Filtrar por status (conectado, desconectado, etc)

#### Métricas Globais
- ✅ Métricas de uso por período
- ✅ Taxa de entrega de mensagens
- ✅ Tempo médio de resposta global
- ✅ Horários de pico
- ✅ Uso de storage (mídias)

#### Configurações do Sistema
- ✅ Configurações globais
- ✅ Limites (max instâncias por usuário)
- ✅ Rate limits globais
- ✅ Configuração de RabbitMQ
- ✅ Configuração de Storage (MinIO/S3)

#### Logs e Auditoria
- ✅ Logs de ações de usuários
- ✅ Logs de erros
- ✅ Histórico de mudanças
- ✅ Tentativas de login

#### Health Check
- ✅ Status de serviços (PostgreSQL, Redis, RabbitMQ, MinIO)
- ✅ Status dos serviços Go (Connection, Receptive, Replicas)
- ✅ Latência de APIs
- ✅ Uso de recursos (CPU, memória)

---

### 🎭 Funcionalidade: Logar como Usuário (Impersonate)

> **Para dar suporte:** Superadmin pode "logar" temporariamente como qualquer usuário para ver exatamente o que ele vê.

#### Backend - Rota de Impersonate

```php
// routes/web.php

Route::prefix('superadmin')
    ->middleware(['auth', 'superadmin'])
    ->group(function () {
        // ... outras rotas ...

        // Impersonate (Logar como usuário)
        Route::post('/users/{user}/impersonate', [SuperadminUserController::class, 'impersonate'])
            ->name('superadmin.users.impersonate');

        // Voltar para superadmin
        Route::post('/leave-impersonate', [SuperadminUserController::class, 'leaveImpersonate'])
            ->name('superadmin.leave-impersonate');
    });
```

#### Backend - Controller (Impersonate)

```php
// app/Http/Controllers/Superadmin/SuperadminUserController.php

public function impersonate(User $user)
{
    // Prevenir impersonate de outro superadmin
    if ($user->is_superadmin) {
        return back()->with('error', 'Não é possível impersonar outro superadmin.');
    }

    // Salvar ID do superadmin original na sessão
    session(['impersonate_original_user' => auth()->id()]);

    // Logar como o usuário
    auth()->login($user);

    return redirect()->route('dashboard')->with('success', "Você agora está logado como {$user->name}");
}

public function leaveImpersonate()
{
    // Verificar se está impersonando
    if (!session()->has('impersonate_original_user')) {
        return redirect()->route('dashboard');
    }

    // Recuperar superadmin original
    $originalUserId = session('impersonate_original_user');
    $originalUser = User::findOrFail($originalUserId);

    // Limpar sessão
    session()->forget('impersonate_original_user');

    // Voltar para superadmin
    auth()->login($originalUser);

    return redirect()->route('superadmin.index')->with('success', 'Você voltou para sua conta de superadmin.');
}
```

#### Backend - Middleware (Prevenir Impersonate Access)

```php
// app/Http/Middleware/PreventImpersonateAccess.php
<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PreventImpersonateAccess
{
    public function handle(Request $request, Closure $next)
    {
        // Se está impersonando, não pode acessar área de superadmin
        if (session()->has('impersonate_original_user')) {
            abort(403, 'Não é possível acessar área de superadmin enquanto impersona um usuário.');
        }

        return $next($request);
    }
}
```

**Adicionar ao middleware superadmin:**

```php
// app/Http/Middleware/CheckSuperadmin.php

public function handle(Request $request, Closure $next)
{
    // Prevenir acesso se estiver impersonando
    if (session()->has('impersonate_original_user')) {
        abort(403, 'Não é possível acessar área de superadmin enquanto impersona um usuário.');
    }

    if (!auth()->check() || !auth()->user()->is_superadmin) {
        abort(403, 'Acesso negado. Apenas superadmins podem acessar esta área.');
    }

    return $next($request);
}
```

#### Frontend - Botão Impersonate (Tabela de Usuários)

```tsx
// resources/js/Pages/Superadmin/Users/Index.tsx

import { router } from '@inertiajs/react'
import { Eye, Edit, Trash2, UserCog } from 'lucide-react'
import TableActions from '@/Components/UI/Table/TableActions'

export default function UsersIndex({ users }) {
  const handleImpersonate = (user) => {
    router.post(`/superadmin/users/${user.id}/impersonate`)
  }

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    {
      key: 'actions',
      label: 'Ações',
      render: (user) => (
        <div className="flex items-center gap-2">
          <TableActions
            onView={() => router.visit(`/superadmin/users/${user.id}`)}
            onEdit={() => router.visit(`/superadmin/users/${user.id}/edit`)}
            onDelete={() => handleDelete(user)}
          />

          {/* Botão Impersonate */}
          <button
            onClick={() => handleImpersonate(user)}
            className="p-1.5 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title="Logar como este usuário"
          >
            <UserCog className="w-4 h-4 text-primary-600" />
          </button>
        </div>
      ),
    },
  ]

  return (
    // ...
  )
}
```

#### Frontend - Banner de Aviso (Quando está Impersonando)

```tsx
// resources/js/Components/Layout/ImpersonateBanner.tsx

import { router, usePage } from '@inertiajs/react'
import { AlertTriangle, LogOut } from 'lucide-react'

export default function ImpersonateBanner() {
  const { auth, impersonating } = usePage().props

  if (!impersonating) return null

  const handleLeaveImpersonate = () => {
    router.post('/superadmin/leave-impersonate')
  }

  return (
    <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">
            Você está logado como <strong>{auth.user.name}</strong> (suporte)
          </span>
        </div>

        <button
          onClick={handleLeaveImpersonate}
          className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Voltar para Superadmin
        </button>
      </div>
    </div>
  )
}
```

**Adicionar no AppLayout:**

```tsx
// resources/js/Components/Layout/AppLayout.tsx

import ImpersonateBanner from './ImpersonateBanner'

export default function AppLayout({ children }) {
  return (
    <div>
      <ImpersonateBanner />

      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Navbar />
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### Backend - Compartilhar props com Inertia

```php
// app/Http/Middleware/HandleInertiaRequests.php

public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user(),
        ],
        'impersonating' => session()->has('impersonate_original_user'),
    ]);
}
```

#### Logs de Auditoria (Impersonate)

```php
// app/Models/ImpersonateLog.php (Opcional - para rastrear)

// Migration
Schema::create('impersonate_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignUuid('superadmin_id')->constrained('users')->cascadeOnDelete();
    $table->foreignUuid('impersonated_user_id')->constrained('users')->cascadeOnDelete();
    $table->timestamp('started_at');
    $table->timestamp('ended_at')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->timestamps();
});

// No controller:
public function impersonate(User $user)
{
    // ... código anterior ...

    // Registrar log
    ImpersonateLog::create([
        'superadmin_id' => auth()->id(),
        'impersonated_user_id' => $user->id,
        'started_at' => now(),
        'ip_address' => request()->ip(),
    ]);

    // Logar como o usuário
    auth()->login($user);

    return redirect()->route('dashboard');
}

public function leaveImpersonate()
{
    // ... código anterior ...

    // Atualizar log (ended_at)
    ImpersonateLog::where('superadmin_id', $originalUserId)
        ->whereNull('ended_at')
        ->latest()
        ->first()
        ->update(['ended_at' => now()]);

    // Voltar para superadmin
    auth()->login($originalUser);

    return redirect()->route('superadmin.index');
}
```

#### Segurança - Regras

✅ **Prevenir:**
- Superadmin NÃO pode impersonar outro superadmin
- Usuário impersonado NÃO pode acessar área de superadmin
- Apenas superadmins podem usar impersonate

✅ **Rastreabilidade:**
- Logs de quando/quem foi impersonado
- IP address registrado
- Duração da sessão

✅ **Visual:**
- Banner vermelho visível quando está impersonando
- Botão "Voltar para Superadmin" sempre visível
- Ícone especial na tabela de usuários

---

### Quando Implementar Superadmin?

**DEPOIS de tudo funcionar!**

Ordem de prioridade:
1. ✅ Sistema base funcionando (chat, contatos, etc)
2. ✅ Multi-tenancy funcionando (cada usuário vê apenas suas instâncias)
3. ✅ Produção estável
4. 🔜 **Aí sim criar Superadmin** (se precisar)

**Você NÃO precisa de Superadmin para:**
- Desenvolvimento
- MVP
- Testes
- Primeiros usuários (até ~100 usuários)

**Você PRECISA de Superadmin quando:**
- Tiver muitos usuários (100+)
- Precisar de visão global do sistema
- Precisar fazer suporte (ver instâncias de usuários)
- Precisar de métricas agregadas

---

### Alternativa Simples ao Superadmin

**Se não quiser criar Superadmin agora:**

Use **PostgreSQL direto** ou **PgAdmin** para:
- Ver todos os usuários
- Ver todas as instâncias
- Executar queries agregadas

**Exemplo de queries úteis:**

```sql
-- Total de usuários
SELECT COUNT(*) FROM users;

-- Total de instâncias por status
SELECT status, COUNT(*)
FROM whatsapp_instances
GROUP BY status;

-- Top 10 usuários com mais mensagens
SELECT u.name, u.email, COUNT(m.id) as total_messages
FROM users u
LEFT JOIN whatsapp_instances i ON i.user_id = u.id
LEFT JOIN messages m ON m.instance_id = i.id
GROUP BY u.id
ORDER BY total_messages DESC
LIMIT 10;
```

---

## 📝 Resumo Superadmin

**O que é?**
- Área administrativa global (`/superadmin`)
- Vê TODOS os usuários e instâncias
- Métricas globais do sistema

**Como funciona?**
- Mesmo código Laravel
- Mesmas tabelas (PostgreSQL)
- Middleware `superadmin`
- Coluna `is_superadmin` na tabela `users`

**Quando criar?**
- DEPOIS do sistema base funcionar
- OPCIONAL (não é obrigatório)

**Alternativa:**
- Usar PgAdmin ou queries SQL diretas

---

**Desenvolvido com arquitetura de microserviços robusta, escalável e 100% de entrega garantida via RabbitMQ Exchange + Routing Keys. Design moderno sem cara de IA.**
