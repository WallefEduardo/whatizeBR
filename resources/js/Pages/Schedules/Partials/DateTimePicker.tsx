import { InputHTMLAttributes } from 'react';

interface DateTimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    value: string;
    onChange: (value: string) => void;
}

export default function DateTimePicker({ value, onChange, ...props }: DateTimePickerProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    // Format to datetime-local input format (YYYY-MM-DDThh:mm)
    const formatValue = (val: string) => {
        if (!val) return '';

        const date = new Date(val);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Get minimum datetime (now + 5 minutes)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        return formatValue(now.toISOString());
    };

    return (
        <input
            type="datetime-local"
            value={value ? formatValue(value) : ''}
            onChange={handleChange}
            min={getMinDateTime()}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            {...props}
        />
    );
}
