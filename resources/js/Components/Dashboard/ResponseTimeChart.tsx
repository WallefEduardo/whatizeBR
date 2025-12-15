import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';

interface ResponseTimeData {
    hour: string;
    avgTime: number;
}

interface ResponseTimeChartProps {
    data: ResponseTimeData[];
    title?: string;
    isLoading?: boolean;
    height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded px-3 py-2 shadow-lg">
                <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                    {label}h
                </p>
                <p className="text-sm text-primary-500">
                    {payload[0].value} min
                </p>
            </div>
        );
    }
    return null;
};

export default function ResponseTimeChart({
    data,
    title = 'Tempo de Resposta por Hora',
    isLoading = false,
    height = 300,
}: ResponseTimeChartProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();

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
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? '#262626' : '#e5e5e5'}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="hour"
                        stroke={isDark ? '#737373' : '#a3a3a3'}
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke={isDark ? '#737373' : '#a3a3a3'}
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                        axisLine={false}
                        label={{
                            value: 'Minutos',
                            angle: -90,
                            position: 'insideLeft',
                            style: {
                                fontSize: '12px',
                                fill: isDark ? '#737373' : '#a3a3a3',
                            },
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="avgTime"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
