import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: 'bg-gray-100 text-gray-700',
            primary: 'bg-primary-100 text-primary-700',
            success: 'bg-green-100 text-green-700',
            warning: 'bg-yellow-100 text-yellow-700',
            danger: 'bg-red-100 text-red-700',
            info: 'bg-blue-100 text-blue-700',
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center rounded px-2 py-1 text-xs font-medium',
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
