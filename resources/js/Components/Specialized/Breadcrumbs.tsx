import { Link } from '@inertiajs/react';
import { ChevronRight, Home, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: LucideIcon;
    current?: boolean;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    showHome?: boolean;
    className?: string;
}

export default function Breadcrumbs({ items, showHome = true, className }: BreadcrumbsProps) {
    return (
        <nav className={cn('flex', className)} aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                {showHome && (
                    <li className="inline-flex items-center">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                        >
                            <Home className="w-4 h-4" />
                        </Link>
                    </li>
                )}

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const Icon = item.icon;

                    return (
                        <li key={index}>
                            <div className="flex items-center">
                                {(showHome || index > 0) && (
                                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                                )}
                                {item.href && !isLast ? (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
                                            'text-gray-600 hover:text-primary'
                                        )}
                                    >
                                        {Icon && <Icon className="w-4 h-4" />}
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1.5 text-sm font-medium',
                                            isLast ? 'text-gray-900' : 'text-gray-600'
                                        )}
                                        aria-current={isLast ? 'page' : undefined}
                                    >
                                        {Icon && <Icon className="w-4 h-4" />}
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
