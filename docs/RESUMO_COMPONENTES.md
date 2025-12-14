# 📦 Resumo Rápido - Componentes Reutilizáveis

> **Consulta rápida dos componentes mais usados**

## 🎯 Componentes Essenciais

### 1. CurrencyInput (Valores em Real)
```tsx
import CurrencyInput from '@/Components/Financial/CurrencyInput'

<CurrencyInput
  label="Valor"
  value={1240} // centavos = R$ 12,40
  onChange={(cents) => setValor(cents)}
/>
```
- ✅ Funciona como calculadora
- ✅ Digita `1` → `R$ 0,01`
- ✅ Digita `12` → `R$ 0,12`
- ✅ Digita `1240` → `R$ 12,40`

### 2. DateTimePicker (Data e Hora)
```tsx
import DateTimePicker from '@/Components/UI/DateTimePicker'

<DateTimePicker
  label="Data e Hora"
  value={date}
  onChange={setDate}
  showTime={true} // false = só data
/>
```

### 3. SearchableSelect (Dropdown com Busca)
```tsx
import SearchableSelect from '@/Components/UI/SearchableSelect'

<SearchableSelect
  label="Selecione"
  options={[
    { value: 1, label: 'Opção 1' },
    { value: 2, label: 'Opção 2' },
  ]}
  value={selected}
  onChange={setSelected}
/>
```

### 4. MultiSelect (Seleção Múltipla)
```tsx
import MultiSelect from '@/Components/UI/MultiSelect'

<MultiSelect
  label="Tags"
  options={options}
  value={selectedIds}
  onChange={setSelectedIds}
  maxSelected={5} // opcional
/>
```

### 5. ConfirmDialog (NUNCA usar alert!)
```tsx
import { useConfirm } from '@/Hooks/useConfirm'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'

const { confirm, isOpen, options, handleConfirm, handleClose } = useConfirm()

// Usar:
confirm({
  title: 'Deletar Item',
  message: 'Tem certeza?',
  variant: 'danger',
  onConfirm: () => deleteItem()
})

// Renderizar:
{options && (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={handleClose}
    onConfirm={handleConfirm}
    {...options}
  />
)}
```

### 6. Table com Actions (ícones em CINZA)
```tsx
import Table from '@/Components/UI/Table/Table'
import TableActions from '@/Components/UI/Table/TableActions'

<Table
  columns={[
    { key: 'name', label: 'Nome' },
    {
      key: 'actions',
      label: 'Ações',
      render: (item) => (
        <TableActions
          onView={() => view(item.id)}
          onEdit={() => edit(item.id)}
          onDelete={() => confirm({ ... })} // NUNCA alert!
        />
      )
    }
  ]}
  data={items}
  keyExtractor={(item) => item.id}
/>
```

### 7. Breadcrumbs
```tsx
import Breadcrumbs from '@/Components/Layout/Breadcrumbs'

<Breadcrumbs
  items={[
    { label: 'Contatos', href: '/contacts' },
    { label: 'João Silva' }
  ]}
/>
```

## ❌ NUNCA FAZER

```tsx
// ❌ ERRADO - NUNCA usar alert/confirm nativos
if (confirm('Tem certeza?')) {
  deleteItem()
}

alert('Sucesso!')
```

```tsx
// ✅ CORRETO - usar ConfirmDialog
confirm({
  title: 'Deletar Item',
  message: 'Tem certeza que deseja deletar?',
  variant: 'danger',
  onConfirm: () => deleteItem()
})
```

## 📁 Arquivos de Documentação

1. **COMPONENTS.md** → Lista completa de componentes (caminho + nome)
2. **COMPONENTES_ESPECIALIZADOS.md** → Código completo dos componentes avançados
3. **ROADMAP.md** → Roadmap completo do projeto

## 🎨 Regras de Design

- ✅ Border-radius: **4px** (botões, inputs, cards)
- ✅ Ícones de tabela: **CINZA** (#737373)
- ✅ Gráficos: **coloridos** (paleta definida)
- ✅ NUNCA usar alert/confirm/prompt nativos
- ✅ Componentes com máximo **200-300 linhas**
- ✅ Sempre atualizar COMPONENTS.md

## 📦 Instalação de Dependências

```bash
# Date picker
npm install react-day-picker date-fns

# Headless UI (modais, dropdowns)
npm install @headlessui/react

# Utilitário de classes
npm install clsx tailwind-merge

# Ícones
npm install lucide-react
```

## 🔧 Utilitário cn() (classnames)

```tsx
// resources/js/Lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 🚀 Exemplo Completo de Página

```tsx
import AppLayout from '@/Components/Layout/AppLayout'
import Breadcrumbs from '@/Components/Layout/Breadcrumbs'
import Button from '@/Components/UI/Button'
import Table from '@/Components/UI/Table/Table'
import TableActions from '@/Components/UI/Table/TableActions'
import Modal from '@/Components/UI/Modal'
import ConfirmDialog from '@/Components/UI/ConfirmDialog'
import CurrencyInput from '@/Components/Financial/CurrencyInput'
import { useConfirm } from '@/Hooks/useConfirm'
import { useState } from 'react'

export default function MyPage({ items }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [valor, setValor] = useState(0)
  const { confirm, isOpen, options, handleConfirm, handleClose } = useConfirm()

  const handleDelete = (item) => {
    confirm({
      title: 'Deletar Item',
      message: `Deletar "${item.name}"?`,
      variant: 'danger',
      onConfirm: () => router.delete(`/items/${item.id}`)
    })
  }

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: 'Itens' }]} />

      <Button onClick={() => setIsModalOpen(true)}>
        Novo Item
      </Button>

      <Table
        columns={[
          { key: 'name', label: 'Nome' },
          {
            key: 'actions',
            label: 'Ações',
            render: (item) => (
              <TableActions
                onEdit={() => console.log('edit')}
                onDelete={() => handleDelete(item)}
              />
            )
          }
        ]}
        data={items}
        keyExtractor={(item) => item.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Item"
      >
        <CurrencyInput
          label="Valor"
          value={valor}
          onChange={setValor}
        />
      </Modal>

      {options && (
        <ConfirmDialog
          isOpen={isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          {...options}
        />
      )}
    </AppLayout>
  )
}
```

---

**Sempre consultar COMPONENTS.md para lista completa!**
