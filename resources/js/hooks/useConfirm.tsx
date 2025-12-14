import { useState, useCallback } from 'react';
import ConfirmDialog, { ConfirmDialogProps } from '@/Components/UI/ConfirmDialog';

type ConfirmOptions = Omit<ConfirmDialogProps, 'show' | 'onClose' | 'onConfirm'>;

interface UseConfirmReturn {
    ConfirmDialogComponent: () => JSX.Element | null;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

export function useConfirm(): UseConfirmReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({
        title: '',
        message: '',
        type: 'info',
    });
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((confirmOptions: ConfirmOptions): Promise<boolean> => {
        setOptions(confirmOptions);
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(async () => {
        setIsLoading(true);

        // Pequeno delay para feedback visual
        await new Promise(resolve => setTimeout(resolve, 200));

        setIsLoading(false);
        setIsOpen(false);

        if (resolvePromise) {
            resolvePromise(true);
            setResolvePromise(null);
        }
    }, [resolvePromise]);

    const handleClose = useCallback(() => {
        setIsOpen(false);

        if (resolvePromise) {
            resolvePromise(false);
            setResolvePromise(null);
        }
    }, [resolvePromise]);

    const ConfirmDialogComponent = useCallback(() => {
        if (!isOpen) return null;

        return (
            <ConfirmDialog
                show={isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                isLoading={isLoading}
                {...options}
            />
        );
    }, [isOpen, handleClose, handleConfirm, isLoading, options]);

    return {
        ConfirmDialogComponent,
        confirm,
        showConfirm: confirm, // alias para melhor legibilidade
    };
}

// Hook auxiliar para uso rápido
export function useQuickConfirm() {
    const { confirm, ConfirmDialogComponent } = useConfirm();

    const confirmDelete = useCallback((itemName?: string) => {
        return confirm({
            title: 'Confirmar exclusão',
            message: itemName
                ? `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`
                : 'Tem certeza que deseja excluir? Esta ação não pode ser desfeita.',
            type: 'danger',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
        });
    }, [confirm]);

    const confirmAction = useCallback((action: string, description?: string) => {
        return confirm({
            title: `Confirmar ${action}`,
            message: description || `Tem certeza que deseja ${action}?`,
            type: 'warning',
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
        });
    }, [confirm]);

    return {
        ConfirmDialogComponent,
        confirm,
        confirmDelete,
        confirmAction,
    };
}
