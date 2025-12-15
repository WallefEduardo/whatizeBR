import AppLayout from '@/Layouts/AppLayout';
import StatsCard from '@/Components/Dashboard/StatsCard';
import ConversationsChart from '@/Components/Dashboard/ConversationsChart';
import ResponseTimeChart from '@/Components/Dashboard/ResponseTimeChart';
import AgentPerformance from '@/Components/Dashboard/AgentPerformance';
import RecentActivity from '@/Components/Dashboard/RecentActivity';
import PeriodFilter, { Period } from '@/Components/Dashboard/PeriodFilter';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface DashboardStats {
    conversations: {
        total: number;
        open: number;
        pending: number;
        closed: number;
    };
    response_rate: {
        rate: number;
        total_conversations: number;
        responded_conversations: number;
    };
    first_response_time: {
        average_seconds: number;
        average_minutes: number;
        average_formatted: string;
        sample_size: number;
    };
    resolution_time: {
        average_seconds: number;
        average_minutes: number;
        average_hours: number;
        average_formatted: string;
        sample_size: number;
    };
    by_agent: any[];
    by_department: any[];
    peak_hours: {
        distribution: any[];
        peak_hour: number;
    };
    messages: {
        outbound: number;
        inbound: number;
        total: number;
        outbound_percentage: number;
        inbound_percentage: number;
    };
}

interface DashboardProps {
    stats: DashboardStats;
    period: Period;
}

export default function Dashboard({ stats, period: initialPeriod = 'today' }: DashboardProps) {
    const [period, setPeriod] = useState<Period>(initialPeriod);
    const [isLoading, setIsLoading] = useState(false);

    const handlePeriodChange = (newPeriod: Period) => {
        setPeriod(newPeriod);
        setIsLoading(true);
        router.get(
            '/dashboard',
            { period: newPeriod },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    // Mock data para gráficos (será substituído por dados reais da API)
    const conversationsOverTime = [
        { date: '00h', count: 12 },
        { date: '04h', count: 8 },
        { date: '08h', count: 25 },
        { date: '12h', count: 35 },
        { date: '16h', count: 42 },
        { date: '20h', count: 28 },
    ];

    const responseTimeByHour = [
        { hour: '9', avgTime: 5 },
        { hour: '10', avgTime: 3 },
        { hour: '11', avgTime: 4 },
        { hour: '12', avgTime: 7 },
        { hour: '13', avgTime: 6 },
        { hour: '14', avgTime: 4 },
        { hour: '15', avgTime: 5 },
        { hour: '16', avgTime: 8 },
        { hour: '17', avgTime: 6 },
        { hour: '18', avgTime: 4 },
    ];

    const recentActivities = [
        {
            id: '1',
            type: 'new_conversation' as const,
            description: 'Nova conversa iniciada com João Silva',
            timestamp: new Date().toISOString(),
            user: { name: 'Sistema', avatar_url: undefined },
        },
        {
            id: '2',
            type: 'assigned' as const,
            description: 'Conversa atribuída a Maria Santos',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            user: { name: 'Maria Santos', avatar_url: undefined },
        },
        {
            id: '3',
            type: 'status_changed' as const,
            description: 'Conversa marcada como resolvida',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user: { name: 'Pedro Costa', avatar_url: undefined },
        },
        {
            id: '4',
            type: 'message_sent' as const,
            description: 'Mensagem enviada para Ana Oliveira',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            user: { name: 'Carlos Lima', avatar_url: undefined },
        },
    ];

    return (
        <AppLayout
            title="Dashboard"
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }]}
        >
            <div className="space-y-6">
                {/* Header com filtro de período */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                            Dashboard
                        </h1>
                        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                            Visão geral do desempenho e métricas
                        </p>
                    </div>
                    <PeriodFilter value={period} onChange={handlePeriodChange} />
                </div>

                {/* Cards de métricas principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total de Conversas"
                        value={stats?.conversations?.total || 0}
                        icon={MessageSquare}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-500/10"
                        subtitle={`${stats?.conversations?.open || 0} abertas`}
                        isLoading={isLoading}
                    />
                    <StatsCard
                        title="Taxa de Resposta"
                        value={`${stats?.response_rate?.rate || 0}%`}
                        icon={TrendingUp}
                        iconColor="text-green-600"
                        iconBgColor="bg-green-500/10"
                        subtitle={`${stats?.response_rate?.responded_conversations || 0} respondidas`}
                        isLoading={isLoading}
                    />
                    <StatsCard
                        title="Tempo Médio de Resposta"
                        value={stats?.first_response_time?.average_formatted || '0s'}
                        icon={Clock}
                        iconColor="text-orange-600"
                        iconBgColor="bg-orange-500/10"
                        subtitle={`${stats?.first_response_time?.sample_size || 0} amostras`}
                        isLoading={isLoading}
                    />
                    <StatsCard
                        title="Tempo de Resolução"
                        value={stats?.resolution_time?.average_formatted || '0s'}
                        icon={CheckCircle}
                        iconColor="text-purple-600"
                        iconBgColor="bg-purple-500/10"
                        subtitle={`${stats?.resolution_time?.sample_size || 0} resolvidas`}
                        isLoading={isLoading}
                    />
                </div>

                {/* Gráficos principais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ConversationsChart
                        data={conversationsOverTime}
                        title="Conversas ao Longo do Tempo"
                        isLoading={isLoading}
                    />
                    <ResponseTimeChart
                        data={responseTimeByHour}
                        title="Tempo de Resposta por Hora"
                        isLoading={isLoading}
                    />
                </div>

                {/* Performance e Atividades */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AgentPerformance
                        data={stats?.by_agent || []}
                        title="Desempenho por Atendente"
                        isLoading={isLoading}
                    />
                    <RecentActivity
                        data={recentActivities}
                        title="Atividades Recentes"
                        isLoading={isLoading}
                        maxItems={8}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
