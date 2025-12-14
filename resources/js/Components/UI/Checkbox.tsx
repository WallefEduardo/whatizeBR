import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, id, ...props }, ref) => {
        const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="flex items-center">
                <div className="relative flex items-center">
                    <input
                        id={checkboxId}
                        type="checkbox"
                        ref={ref}
                        className={cn(
                            'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            'checked:bg-primary checked:border-primary',
                            className
                        )}
                        {...props}
                    />
                    <Check className="pointer-events-none absolute left-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100" />
                </div>
                {label && (
                    <label
                        htmlFor={checkboxId}
                        className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
