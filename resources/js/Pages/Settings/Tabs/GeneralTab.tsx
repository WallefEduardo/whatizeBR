import { useState, useEffect } from 'react'
import { Building2, Upload, Clock } from 'lucide-react'
import Button from '@/Components/UI/Button'
import Input from '@/Components/UI/Input'
import Select from '@/Components/UI/Select'
import { Card } from '@/Components/UI/Card'
import { SettingsData, BusinessHours } from '@/types'

interface GeneralTabProps {
    settings: SettingsData
    onSave: (data: Record<string, any>) => void
    isSaving: boolean
}

const timezones = [
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
    { value: 'America/Manaus', label: 'Manaus (AMT)' },
    { value: 'America/Recife', label: 'Recife (BRT)' },
    { value: 'America/Fortaleza', label: 'Fortaleza (BRT)' },
    { value: 'America/Noronha', label: 'Fernando de Noronha (FNT)' },
]

const weekDays = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
]

export default function GeneralTab({ settings, onSave, isSaving }: GeneralTabProps) {
    const [formData, setFormData] = useState({
        company_name: settings.company_name?.value || '',
        company_logo: settings.company_logo?.value || '',
        timezone: settings.timezone?.value || 'America/Sao_Paulo',
        business_hours_enabled: settings.business_hours_enabled?.value || false,
        business_hours: (settings.business_hours?.value as BusinessHours) || {
            monday: { start: '09:00', end: '18:00', enabled: true },
            tuesday: { start: '09:00', end: '18:00', enabled: true },
            wednesday: { start: '09:00', end: '18:00', enabled: true },
            thursday: { start: '09:00', end: '18:00', enabled: true },
            friday: { start: '09:00', end: '18:00', enabled: true },
            saturday: { start: '09:00', end: '13:00', enabled: false },
            sunday: { start: '09:00', end: '13:00', enabled: false },
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const handleBusinessHourChange = (
        day: keyof BusinessHours,
        field: 'start' | 'end' | 'enabled',
        value: string | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            business_hours: {
                ...prev.business_hours,
                [day]: {
                    ...prev.business_hours[day],
                    [field]: value,
                },
            },
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações da Empresa */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                            Informações da Empresa
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Nome da Empresa
                            </label>
                            <Input
                                type="text"
                                value={formData.company_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, company_name: e.target.value })
                                }
                                placeholder="Digite o nome da empresa"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Logo da Empresa
                            </label>
                            <div className="flex items-center gap-4">
                                {formData.company_logo && (
                                    <img
                                        src={formData.company_logo}
                                        alt="Logo"
                                        className="w-16 h-16 rounded object-cover border border-dark-200 dark:border-dark-700"
                                    />
                                )}
                                <Button type="button" variant="secondary" size="sm">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Logo
                                </Button>
                            </div>
                            <p className="text-xs text-dark-500 mt-2">
                                Recomendado: 256x256px, PNG ou JPG
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                Fuso Horário
                            </label>
                            <Select
                                value={formData.timezone}
                                onChange={(e) =>
                                    setFormData({ ...formData, timezone: e.target.value })
                                }
                                options={timezones}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Horário Comercial */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                Horário Comercial
                            </h3>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.business_hours_enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        business_hours_enabled: e.target.checked,
                                    })
                                }
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-dark-700 dark:text-dark-300">
                                Habilitar
                            </span>
                        </label>
                    </div>

                    {formData.business_hours_enabled && (
                        <div className="space-y-3">
                            {weekDays.map((day) => (
                                <div
                                    key={day.key}
                                    className="flex items-center gap-4 p-3 rounded bg-dark-50 dark:bg-dark-900"
                                >
                                    <label className="flex items-center gap-2 w-40">
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.business_hours[
                                                    day.key as keyof BusinessHours
                                                ].enabled
                                            }
                                            onChange={(e) =>
                                                handleBusinessHourChange(
                                                    day.key as keyof BusinessHours,
                                                    'enabled',
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                                            {day.label}
                                        </span>
                                    </label>

                                    {formData.business_hours[day.key as keyof BusinessHours]
                                        .enabled && (
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-dark-500">
                                                    Início:
                                                </span>
                                                <input
                                                    type="time"
                                                    value={
                                                        formData.business_hours[
                                                            day.key as keyof BusinessHours
                                                        ].start
                                                    }
                                                    onChange={(e) =>
                                                        handleBusinessHourChange(
                                                            day.key as keyof BusinessHours,
                                                            'start',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="px-3 py-1.5 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-dark-500">Fim:</span>
                                                <input
                                                    type="time"
                                                    value={
                                                        formData.business_hours[
                                                            day.key as keyof BusinessHours
                                                        ].end
                                                    }
                                                    onChange={(e) =>
                                                        handleBusinessHourChange(
                                                            day.key as keyof BusinessHours,
                                                            'end',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="px-3 py-1.5 text-sm border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSaving}>
                    Salvar Configurações
                </Button>
            </div>
        </form>
    )
}
