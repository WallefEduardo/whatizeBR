import { Fragment, PropsWithChildren } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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
        <Transition show={show} as={Fragment} leave="duration-200">
            <Dialog
                as="div"
                className="fixed inset-0 z-50 overflow-y-auto"
                onClose={closeable ? onClose : () => {}}
            >
                <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/50 transition-opacity" />
                    </Transition.Child>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <Dialog.Panel
                            className={cn(
                                'relative w-full transform overflow-hidden rounded bg-white dark:bg-dark-800 text-left shadow-xl transition-all sm:my-8 sm:w-full',
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
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
