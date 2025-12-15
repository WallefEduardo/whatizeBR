import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, label, id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    ref={ref}
                    className={cn(
                        'flex min-h-[80px] w-full rounded border px-3 py-2 text-sm',
                        'border-gray-300 dark:border-dark-700',
                        'bg-white dark:bg-dark-900',
                        'text-gray-900 dark:text-dark-50',
                        'placeholder:text-gray-400 dark:placeholder:text-dark-500',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-dark-800',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
