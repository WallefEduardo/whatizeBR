import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface Broadcast {
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    read_count: number;
    failed_count: number;
    status: string;
}

interface Props {
    broadcast: Broadcast;
}

export default function BroadcastStats({ broadcast }: Props) {
    const getProgressPercentage = () => {
        if (broadcast.total_recipients === 0) return 0;
        return Math.round((broadcast.sent_count / broadcast.total_recipients) * 100);
    };

    const getSuccessRate = () => {
        if (broadcast.sent_count === 0) return 0;
        const successful = broadcast.sent_count - broadcast.failed_count;
        return Math.round((successful / broadcast.sent_count) * 100);
    };

    return (
        <div className="space-y-3">
            {/* Progress Bar */}
            {['processing', 'completed'].includes(broadcast.status) && (
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-dark-600 dark:text-dark-400">
                            Progresso
                        </span>
                        <span className="font-medium text-dark-900 dark:text-dark-50">
                            {broadcast.sent_count} / {broadcast.total_recipients} ({getProgressPercentage()}%)
                        </span>
                    </div>
                    <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                        <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Recipients */}
                <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-dark-500" />
                    </div>
                    <div>
                        <p className="text-xs text-dark-500">Total</p>
                        <p className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                            {broadcast.total_recipients}
                        </p>
                    </div>
                </div>

                {/* Sent */}
                {broadcast.sent_count > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-500">Enviados</p>
                            <p className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                                {broadcast.sent_count}
                            </p>
                        </div>
                    </div>
                )}

                {/* Delivered */}
                {broadcast.delivered_count > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-500">Entregues</p>
                            <p className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                                {broadcast.delivered_count}
                            </p>
                        </div>
                    </div>
                )}

                {/* Read */}
                {broadcast.read_count > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-500">Lidos</p>
                            <p className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                                {broadcast.read_count}
                            </p>
                        </div>
                    </div>
                )}

                {/* Failed */}
                {broadcast.failed_count > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-500">Falharam</p>
                            <p className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                                {broadcast.failed_count}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Success Rate */}
            {broadcast.sent_count > 0 && (
                <div className="pt-2 border-t border-dark-200 dark:border-dark-700">
                    <p className="text-xs text-dark-500">
                        Taxa de sucesso: <span className="font-semibold text-dark-900 dark:text-dark-50">{getSuccessRate()}%</span>
                    </p>
                </div>
            )}
        </div>
    );
}
