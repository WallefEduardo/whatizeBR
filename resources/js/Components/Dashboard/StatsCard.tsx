import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    iconColor?: string;
    iconBgColor?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    isLoading?: boolean;
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    iconColor = 'text-primary-500',
    iconBgColor = 'bg-primary-500/10',
    trend,
    subtitle,
    isLoading = false,
}: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">
                        {title}
                    </p>
                    {isLoading ? (
                        <div className="h-8 w-24 bg-dark-200 dark:bg-dark-700 rounded animate-pulse" />
                    ) : (
                        <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-1">
                            {value}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-xs text-dark-400 dark:text-dark-500">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span
                                className={`text-xs font-medium ${
                                    trend.isPositive
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                }`}
                            >
                                {trend.isPositive ? '+' : ''}
                                {trend.value}%
                            </span>
                            <span className="text-xs text-dark-400 dark:text-dark-500">
                                vs último período
                            </span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded ${iconBgColor}`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={2} />
                    </div>
                )}
            </div>
        </div>
    );
}
