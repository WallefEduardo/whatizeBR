import { User } from 'lucide-react';

interface Agent {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
}

interface AgentData {
    assigned_to: string;
    total: number;
    agent?: Agent;
}

interface AgentPerformanceProps {
    data: AgentData[];
    title?: string;
    isLoading?: boolean;
}

export default function AgentPerformance({
    data,
    title = 'Desempenho por Atendente',
    isLoading = false,
}: AgentPerformanceProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                <div className="h-6 w-48 bg-dark-200 dark:bg-dark-700 rounded mb-4 animate-pulse" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-dark-100 dark:bg-dark-900 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // Ordena por total decrescente
    const sortedData = [...data].sort((a, b) => b.total - a.total);
    const maxTotal = sortedData[0]?.total || 1;

    return (
        <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6 transition-colors">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                {title}
            </h3>

            <div className="space-y-3">
                {sortedData.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-dark-500 dark:text-dark-400">
                            Nenhum dado disponível
                        </p>
                    </div>
                ) : (
                    sortedData.map((item) => {
                        const percentage = (item.total / maxTotal) * 100;
                        const agent = item.agent;

                        return (
                            <div key={item.assigned_to} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {agent?.avatar_url ? (
                                            <img
                                                src={agent.avatar_url}
                                                alt={agent.name}
                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-primary-500" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                                                {agent?.name || 'Não atribuído'}
                                            </p>
                                            {agent?.email && (
                                                <p className="text-xs text-dark-500 dark:text-dark-400 truncate">
                                                    {agent.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-dark-900 dark:text-dark-50 ml-4">
                                        {item.total}
                                    </span>
                                </div>
                                <div className="w-full bg-dark-100 dark:bg-dark-900 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-primary-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
