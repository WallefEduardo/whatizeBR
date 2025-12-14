import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        id={inputId}
                        type="date"
                        ref={ref}
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
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
