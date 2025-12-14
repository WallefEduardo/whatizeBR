import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

export interface DateTimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    label?: string;
    error?: string;
    value?: string; // formato: YYYY-MM-DDTHH:mm
    onChange?: (value: string) => void;
}

const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
    ({ className, label, error, value = '', onChange, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        // Separa data e hora se o value estiver preenchido
        const [date, time] = value ? value.split('T') : ['', ''];

        const handleDateChange = (newDate: string) => {
            const newValue = time ? `${newDate}T${time}` : `${newDate}T00:00`;
            onChange?.(newValue);
        };

        const handleTimeChange = (newTime: string) => {
            const newValue = date ? `${date}T${newTime}` : `${new Date().toISOString().split('T')[0]}T${newTime}`;
            onChange?.(newValue);
        };

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <div className="flex gap-2">
                    {/* Campo de Data */}
                    <div className="flex-1 relative">
                        <input
                            id={inputId}
                            ref={ref}
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className={cn(
                                'flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm pr-10',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                                error && 'border-red-500 focus:ring-red-500',
                                className
                            )}
                            {...props}
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Campo de Hora */}
                    <div className="w-32 relative">
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            className={cn(
                                'flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm pr-10',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                                error && 'border-red-500 focus:ring-red-500'
                            )}
                            disabled={props.disabled}
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
