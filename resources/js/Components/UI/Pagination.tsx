import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationProps {
    links: PaginationLink[];
    from: number;
    to: number;
    total: number;
    onPageChange: (url: string) => void;
}

export default function Pagination({ links, from, to, total, onPageChange }: PaginationProps) {
    const handleClick = (url: string | null) => {
        if (url) {
            onPageChange(url);
        }
    };

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <Button
                    variant="outline"
                    onClick={() => handleClick(links[0]?.url)}
                    disabled={!links[0]?.url}
                    size="sm"
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleClick(links[links.length - 1]?.url)}
                    disabled={!links[links.length - 1]?.url}
                    size="sm"
                >
                    Próximo
                </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{from}</span> a{' '}
                        <span className="font-medium">{to}</span> de{' '}
                        <span className="font-medium">{total}</span> resultados
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded shadow-sm" aria-label="Pagination">
                        {links.map((link, index) => {
                            const isFirst = index === 0;
                            const isLast = index === links.length - 1;

                            if (isFirst) {
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleClick(link.url)}
                                        disabled={!link.url}
                                        className={cn(
                                            'relative inline-flex items-center rounded-l px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
                                            'focus:z-20 focus:outline-offset-0',
                                            !link.url && 'cursor-not-allowed opacity-50'
                                        )}
                                    >
                                        <span className="sr-only">Anterior</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                );
                            }

                            if (isLast) {
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleClick(link.url)}
                                        disabled={!link.url}
                                        className={cn(
                                            'relative inline-flex items-center rounded-r px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
                                            'focus:z-20 focus:outline-offset-0',
                                            !link.url && 'cursor-not-allowed opacity-50'
                                        )}
                                    >
                                        <span className="sr-only">Próximo</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                );
                            }

                            if (link.label === '...') {
                                return (
                                    <span
                                        key={index}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleClick(link.url)}
                                    className={cn(
                                        'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300',
                                        'focus:z-20 focus:outline-offset-0',
                                        link.active
                                            ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                                            : 'text-gray-900 hover:bg-gray-50'
                                    )}
                                >
                                    {link.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
