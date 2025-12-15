import {
    MessageSquare,
    UserPlus,
    UserCheck,
    CheckCircle,
    Clock,
    LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity {
    id: string;
    type: 'new_conversation' | 'assigned' | 'status_changed' | 'message_sent';
    description: string;
    timestamp: string;
    user?: {
        name: string;
        avatar_url?: string;
    };
}

interface RecentActivityProps {
    data: Activity[];
    title?: string;
    isLoading?: boolean;
    maxItems?: number;
}

const activityIcons: Record<Activity['type'], { icon: LucideIcon; color: string; bgColor: string }> = {
    new_conversation: {
        icon: MessageSquare,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
    },
    assigned: {
        icon: UserCheck,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-500/10',
    },
    status_changed: {
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
    },
    message_sent: {
        icon: MessageSquare,
        color: 'text-primary-600 dark:text-primary-400',
        bgColor: 'bg-primary-500/10',
    },
};

export default function RecentActivity({
    data,
    title = 'Atividades Recentes',
    isLoading = false,
    maxItems = 10,
}: RecentActivityProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                <div className="h-6 w-48 bg-dark-200 dark:bg-dark-700 rounded mb-4 animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-10 h-10 bg-dark-200 dark:bg-dark-700 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-dark-200 dark:bg-dark-700 rounded animate-pulse" />
                                <div className="h-3 w-1/2 bg-dark-200 dark:bg-dark-700 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const displayData = data.slice(0, maxItems);

    return (
        <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6 transition-colors">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                {title}
            </h3>

            <div className="space-y-4">
                {displayData.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-2" />
                        <p className="text-sm text-dark-500 dark:text-dark-400">
                            Nenhuma atividade recente
                        </p>
                    </div>
                ) : (
                    displayData.map((activity) => {
                        const iconConfig = activityIcons[activity.type];
                        const Icon = iconConfig.icon;

                        return (
                            <div key={activity.id} className="flex gap-3">
                                <div className={`w-10 h-10 rounded-full ${iconConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`w-5 h-5 ${iconConfig.color}`} strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-dark-900 dark:text-dark-50 mb-1">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {activity.user && (
                                            <>
                                                {activity.user.avatar_url ? (
                                                    <img
                                                        src={activity.user.avatar_url}
                                                        alt={activity.user.name}
                                                        className="w-4 h-4 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full bg-dark-200 dark:bg-dark-700 flex items-center justify-center">
                                                        <UserPlus className="w-2.5 h-2.5 text-dark-500" />
                                                    </div>
                                                )}
                                                <span className="text-xs text-dark-600 dark:text-dark-400">
                                                    {activity.user.name}
                                                </span>
                                                <span className="text-xs text-dark-400 dark:text-dark-500">•</span>
                                            </>
                                        )}
                                        <span className="text-xs text-dark-400 dark:text-dark-500">
                                            {formatDistanceToNow(new Date(activity.timestamp), {
                                                addSuffix: true,
                                                locale: ptBR,
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
