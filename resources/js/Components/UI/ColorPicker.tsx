import { useState } from 'react'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  error?: string
}

const PRESET_COLORS = [
  '#22c55e', // Verde (primary)
  '#3b82f6', // Azul
  '#f59e0b', // Laranja
  '#ef4444', // Vermelho
  '#8b5cf6', // Roxo
  '#ec4899', // Pink
  '#10b981', // Verde esmeralda
  '#f97316', // Laranja escuro
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e', // Rosa
  '#a855f7', // Roxo claro
]

export default function ColorPicker({ value, onChange, label, error }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value)

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    onChange(newColor)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-dark-900 dark:text-dark-50">
          {label}
        </label>
      )}

      {/* Preset Colors Grid */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="relative w-10 h-10 rounded border-2 transition-all hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor: value === color ? '#171717' : '#e5e5e5',
            }}
            title={color}
          >
            {value === color && (
              <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow" />
            )}
          </button>
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={handleCustomColorChange}
          className="w-12 h-10 rounded border border-dark-200 dark:border-dark-700 cursor-pointer"
        />
        <input
          type="text"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value)
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              onChange(e.target.value)
            }
          }}
          placeholder="#000000"
          className="flex-1 px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
