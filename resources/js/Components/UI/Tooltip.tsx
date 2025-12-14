import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export default function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrows = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && content && (
                <div
                    className={cn(
                        'absolute z-50 whitespace-nowrap rounded bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg',
                        positions[position],
                        className
                    )}
                >
                    {content}
                    <div
                        className={cn(
                            'absolute h-0 w-0 border-4 border-transparent',
                            arrows[position]
                        )}
                    />
                </div>
            )}
        </div>
    );
}
