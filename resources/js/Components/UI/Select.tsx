import { SelectHTMLAttributes, forwardRef, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    label?: string;
    options?: Array<{ value: string | number; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, PropsWithChildren<SelectProps>>(
    ({ className, error, label, options, id, children, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        ref={ref}
                        className={cn(
                            'flex h-10 w-full appearance-none rounded border px-3 py-2 text-sm pr-10',
                            'border-gray-300 dark:border-dark-700',
                            'bg-white dark:bg-dark-900',
                            'text-gray-900 dark:text-dark-50',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-dark-800',
                            error && 'border-red-500 focus:ring-red-500',
                            className
                        )}
                        {...props}
                    >
                        {options ? options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        )) : children}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-dark-500 pointer-events-none" />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
