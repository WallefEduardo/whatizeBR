import { Users, AlertCircle, CheckCircle } from 'lucide-react';

interface Filters {
    tags: string[];
    departments: string[];
    exclude_blocked: boolean;
}

interface Props {
    count: number;
    filters: Filters;
}

export default function RecipientPreview({ count, filters }: Props) {
    const hasFilters = filters.tags.length > 0 || filters.departments.length > 0 || !filters.exclude_blocked;

    return (
        <div className={`mt-3 p-4 rounded border ${
            count === 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
        }`}>
            <div className="flex items-start gap-3">
                {count === 0 ? (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                    {count === 0 ? (
                        <div>
                            <p className="font-medium text-red-900 dark:text-red-200">
                                Nenhum destinatário encontrado
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                {hasFilters
                                    ? 'Os filtros selecionados não retornaram nenhum contato. Ajuste os filtros para incluir mais destinatários.'
                                    : 'Você não possui contatos cadastrados. Adicione contatos antes de criar uma transmissão.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-medium text-primary-900 dark:text-primary-200">
                                <Users className="w-4 h-4 inline mr-1" />
                                {count} {count === 1 ? 'destinatário encontrado' : 'destinatários encontrados'}
                            </p>
                            <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                                {hasFilters
                                    ? 'Com base nos filtros selecionados, a transmissão será enviada para estes contatos.'
                                    : 'Sem filtros aplicados, a transmissão será enviada para todos os contatos ativos.'
                                }
                            </p>

                            {/* Time estimate */}
                            <div className="mt-2 pt-2 border-t border-primary-200 dark:border-primary-800">
                                <p className="text-xs text-primary-600 dark:text-primary-400">
                                    Tempo estimado de envio: <strong>~{Math.ceil((count * 6) / 60)} minutos</strong> (6s por mensagem)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
