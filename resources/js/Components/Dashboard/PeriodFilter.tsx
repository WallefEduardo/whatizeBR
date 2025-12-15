import { Calendar } from 'lucide-react';
import Select from '@/Components/UI/Select';

export type Period = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_week' | 'this_month';

interface PeriodFilterProps {
    value: Period;
    onChange: (period: Period) => void;
}

const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last_7_days', label: 'Últimos 7 dias' },
    { value: 'last_30_days', label: 'Últimos 30 dias' },
    { value: 'this_week', label: 'Esta semana' },
    { value: 'this_month', label: 'Este mês' },
];

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
    return (
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-dark-500 dark:text-dark-400" strokeWidth={2} />
            <Select
                value={value}
                onChange={(e) => onChange(e.target.value as Period)}
                options={periodOptions}
                className="w-auto min-w-[160px]"
            />
        </div>
    );
}
