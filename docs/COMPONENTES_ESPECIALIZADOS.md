# Componentes Especializados

> Componentes customizados avançados para casos específicos

## 📦 Componentes Disponíveis

### Specialized (Componentes Avançados)
- `resources/js/Components/Specialized/CurrencyInput.tsx` - CurrencyInput ✅
- `resources/js/Components/Specialized/DateTimePicker.tsx` - DateTimePicker ✅
- `resources/js/Components/Specialized/SearchableSelect.tsx` - SearchableSelect ✅
- `resources/js/Components/Specialized/MultiSelect.tsx` - MultiSelect ✅
- `resources/js/Components/Specialized/Breadcrumbs.tsx` - Breadcrumbs ✅

---

## 💰 CurrencyInput

**Funciona como calculadora - trabalha com centavos**

```tsx
import { CurrencyInput } from '@/Components/Specialized'

<CurrencyInput
  label="Valor"
  value={valorEmCentavos} // 1240 = R$ 12,40
  onChange={(cents) => setValorEmCentavos(cents)}
/>
```

**Como funciona:**
- Digita `1` → mostra `R$ 0,01`
- Digita `2` → mostra `R$ 0,12`
- Digita `4` → mostra `R$ 1,24`
- Digita `0` → mostra `R$ 12,40`

**Código completo:**

```tsx
// resources/js/Components/Financial/CurrencyInput.tsx
import { forwardRef, useState } from 'react'
import { cn } from '@/Lib/utils'

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number // valor em centavos
  onChange?: (value: number) => void // retorna valor em centavos
  label?: string
  error?: string
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = 0, onChange, label, error, className, disabled, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => formatCurrency(value))

    function formatCurrency(cents: number): string {
      const reais = cents / 100
      return reais.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const input = e.target.value.replace(/\D/g, '') // apenas números
      const cents = input === '' ? 0 : parseInt(input, 10)

      setDisplayValue(formatCurrency(cents))
      onChange?.(cents)
    }

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      e.target.select() // seleciona tudo ao focar
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-2 rounded border transition-colors',
            'bg-white dark:bg-dark-800',
            'border-dark-200 dark:border-dark-700',
            'text-dark-900 dark:text-dark-50',
            'placeholder:text-dark-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'
export default CurrencyInput
```

---

## 📅 DateTimePicker

**Seletor de data e hora bonito e customizado**

```tsx
import DateTimePicker from '@/Components/UI/DateTimePicker'

// Com data e hora
<DateTimePicker
  label="Data e Hora"
  value={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  showTime={true}
/>

// Apenas data
<DateTimePicker
  label="Data"
  value={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  showTime={false}
/>
```

**Código base:**

```tsx
// resources/js/Components/UI/DateTimePicker.tsx
import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { cn } from '@/Lib/utils'

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | null) => void
  label?: string
  error?: string
  showTime?: boolean
  disabled?: boolean
  className?: string
}

export default function DateTimePicker({
  value,
  onChange,
  label,
  error,
  showTime = true,
  disabled,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null)
  const [hours, setHours] = useState(value ? value.getHours() : 12)
  const [minutes, setMinutes] = useState(value ? value.getMinutes() : 0)

  const displayValue = selectedDate
    ? format(selectedDate, showTime ? "dd/MM/yyyy 'às' HH:mm" : 'dd/MM/yyyy', { locale: ptBR })
    : ''

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    if (showTime) {
      date.setHours(hours)
      date.setMinutes(minutes)
    }

    setSelectedDate(date)
    onChange?.(date)

    if (!showTime) {
      setIsOpen(false)
    }
  }

  const handleTimeChange = () => {
    if (!selectedDate) return

    const newDate = new Date(selectedDate)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)

    setSelectedDate(newDate)
    onChange?.(newDate)
  }

  return (
    <div className={cn('relative w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          readOnly
          disabled={disabled}
          placeholder={showTime ? 'Selecione data e hora' : 'Selecione data'}
          className={cn(
            'w-full px-4 py-2 pr-10 rounded border cursor-pointer transition-colors',
            'bg-white dark:bg-dark-800',
            'border-dark-200 dark:border-dark-700',
            'text-dark-900 dark:text-dark-50',
            'placeholder:text-dark-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500'
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {showTime ? (
            <Clock className="w-5 h-5 text-dark-400" />
          ) : (
            <Calendar className="w-5 h-5 text-dark-400" />
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-md shadow-lg p-4">
          <DayPicker
            mode="single"
            selected={selectedDate || undefined}
            onSelect={handleDateSelect}
            locale={ptBR}
          />

          {showTime && (
            <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  onBlur={handleTimeChange}
                  className="w-16 px-2 py-1 text-center rounded border border-dark-200 dark:border-dark-700"
                />
                <span>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value))}
                  onBlur={handleTimeChange}
                  className="w-16 px-2 py-1 text-center rounded border border-dark-200 dark:border-dark-700"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  )
}
```

**Dependências necessárias:**
```bash
npm install react-day-picker date-fns
```

---

## 🔍 SearchableSelect

**Dropdown com campo de busca**

```tsx
import SearchableSelect from '@/Components/UI/SearchableSelect'

const options = [
  { value: 1, label: 'Opção 1' },
  { value: 2, label: 'Opção 2' },
  { value: 3, label: 'Opção 3' },
]

<SearchableSelect
  label="Selecione uma opção"
  options={options}
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
  placeholder="Buscar opção..."
/>
```

**Ver código completo no ROADMAP.md**

---

## ☑️ MultiSelect

**Seleção múltipla com busca e badges**

```tsx
import MultiSelect from '@/Components/UI/MultiSelect'

const options = [
  { value: 1, label: 'Tag 1' },
  { value: 2, label: 'Tag 2' },
  { value: 3, label: 'Tag 3' },
]

<MultiSelect
  label="Tags"
  options={options}
  value={selectedTags}
  onChange={(values) => setSelectedTags(values)}
  placeholder="Selecione tags..."
  maxSelected={5} // opcional - limite máximo
/>
```

**Features:**
- ✅ Busca em tempo real
- ✅ Badges com X para remover
- ✅ Botão "Limpar tudo"
- ✅ Contador de selecionados
- ✅ Limite máximo opcional
- ✅ Checkbox visual

**Ver código completo no ROADMAP.md**

---

## 🍞 Breadcrumbs

```tsx
// resources/js/Components/Layout/Breadcrumbs.tsx
import { ChevronRight, Home } from 'lucide-react'
import { Link } from '@inertiajs/react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link
        href="/"
        className="flex items-center text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-dark-400" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-dark-900 dark:text-dark-50 font-medium">
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

// Uso:
// <Breadcrumbs
//   items={[
//     { label: 'Contatos', href: '/contacts' },
//     { label: 'João Silva' },
//   ]}
// />
```

---

## 📝 Regras de Uso

1. **CurrencyInput** - sempre trabalhar com centavos (inteiros)
2. **DateTimePicker** - usar `date-fns` para formatação
3. **SearchableSelect** - para listas grandes (>10 itens)
4. **MultiSelect** - para seleções múltiplas com busca
5. **Breadcrumbs** - manter no máximo 4 níveis

Todos os componentes seguem o design system:
- ✅ Border-radius: 4px
- ✅ Cores neutras (cinza)
- ✅ Suporte dark mode
- ✅ Acessibilidade (keyboard navigation)
- ✅ Estados de erro/loading/disabled
