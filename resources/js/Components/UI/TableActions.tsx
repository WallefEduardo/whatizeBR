import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TableActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    tooltip?: string;
}

export function TableAction({ icon: Icon, tooltip, className, ...props }: TableActionProps) {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center justify-center h-8 w-8 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className
            )}
            title={tooltip}
            {...props}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}

export interface TableActionsProps {
    children: React.ReactNode;
    className?: string;
}

export function TableActions({ children, className }: TableActionsProps) {
    return (
        <div className={cn('flex items-center gap-1', className)}>
            {children}
        </div>
    );
}
