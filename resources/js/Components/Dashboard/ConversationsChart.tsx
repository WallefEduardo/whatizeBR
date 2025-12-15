import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';

interface ConversationData {
    date: string;
    count: number;
    hour?: number;
}

interface ConversationsChartProps {
    data: ConversationData[];
    title?: string;
    isLoading?: boolean;
    height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded px-3 py-2 shadow-lg">
                <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                    {label}
                </p>
                <p className="text-sm text-primary-500">
                    {payload[0].value} conversas
                </p>
            </div>
        );
    }
    return null;
};

export default function ConversationsChart({
    data,
    title = 'Conversas ao Longo do Tempo',
    isLoading = false,
    height = 300,
}: ConversationsChartProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Detecta dark mode
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();

        // Observer para mudanças no dark mode
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                <div className="h-6 w-48 bg-dark-200 dark:bg-dark-700 rounded mb-4 animate-pulse" />
                <div className={`w-full bg-dark-100 dark:bg-dark-900 rounded animate-pulse`} style={{ height }} />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6 transition-colors">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                {title}
            </h3>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? '#262626' : '#e5e5e5'}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        stroke={isDark ? '#737373' : '#a3a3a3'}
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke={isDark ? '#737373' : '#a3a3a3'}
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#colorConversations)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
