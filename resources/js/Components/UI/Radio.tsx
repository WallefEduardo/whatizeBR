import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({ className, label, id, ...props }, ref) => {
        const radioId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="flex items-center">
                <input
                    id={radioId}
                    type="radio"
                    ref={ref}
                    className={cn(
                        'h-4 w-4 border-gray-300 text-primary',
                        'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        className
                    )}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={radioId}
                        className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    }
);

Radio.displayName = 'Radio';

export default Radio;
