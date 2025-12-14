import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export default function ConfirmDialog({
    show,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false,
}: ConfirmDialogProps) {
    const icons = {
        info: <Info className="h-6 w-6 text-blue-600" />,
        warning: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
        danger: <XCircle className="h-6 w-6 text-red-600" />,
        success: <CheckCircle className="h-6 w-6 text-green-600" />,
    };

    const bgColors = {
        info: 'bg-blue-100',
        warning: 'bg-yellow-100',
        danger: 'bg-red-100',
        success: 'bg-green-100',
    };

    const buttonVariants = {
        info: 'primary' as const,
        warning: 'primary' as const,
        danger: 'danger' as const,
        success: 'primary' as const,
    };

    return (
        <Transition show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded bg-white shadow-xl transition-all">
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={cn('flex-shrink-0 rounded-full p-3', bgColors[type])}>
                                            {icons[type]}
                                        </div>
                                        <div className="flex-1">
                                            <Dialog.Title className="text-lg font-semibold text-gray-900">
                                                {title}
                                            </Dialog.Title>
                                            <p className="mt-2 text-sm text-gray-600">{message}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 bg-gray-50 px-6 py-4">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        {cancelText}
                                    </Button>
                                    <Button
                                        variant={buttonVariants[type]}
                                        onClick={onConfirm}
                                        isLoading={isLoading}
                                        className="flex-1"
                                    >
                                        {confirmText}
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
