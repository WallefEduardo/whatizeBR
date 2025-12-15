import { PropsWithChildren } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    closeable?: boolean;
}

export default function Modal({
    show,
    onClose,
    title,
    maxWidth = 'lg',
    closeable = true,
    children,
}: PropsWithChildren<ModalProps>) {
    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
    };

    return (
        <Dialog
            open={show ?? false}
            onClose={closeable ? onClose : () => {}}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-gray-900/50 transition-opacity duration-300 data-[closed]:opacity-0" />

            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                    <Dialog.Panel
                        className={cn(
                            'relative w-full transform overflow-hidden rounded bg-white dark:bg-dark-800 text-left shadow-xl transition-all duration-300 sm:my-8 sm:w-full',
                            'data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95',
                            maxWidthClass[maxWidth]
                        )}
                    >
                        {title && (
                            <div className="flex items-center justify-between border-b border-dark-200 dark:border-dark-700 px-6 py-4">
                                <Dialog.Title className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                    {title}
                                </Dialog.Title>
                                {closeable && (
                                    <button
                                        type="button"
                                        className="text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                                        onClick={onClose}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="px-6 py-4">{children}</div>
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    );
}
