import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav className={cn('flex items-center space-x-2 text-sm', className)} aria-label="Breadcrumb">
            {/* Home */}
            <Link
                href="/dashboard"
                className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>

            {/* Breadcrumb items */}
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={index} className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className={cn(
                                    isLast
                                        ? 'text-gray-900 dark:text-gray-50 font-medium'
                                        : 'text-gray-500 dark:text-gray-400'
                                )}
                            >
                                {item.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
