import { useState } from 'react'

interface ConfirmOptions {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info' | 'success'
    onConfirm: () => void | Promise<void>
}

export function useConfirm() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [options, setOptions] = useState<ConfirmOptions | null>(null)

    const confirm = (opts: ConfirmOptions) => {
        setOptions(opts)
        setIsOpen(true)
    }

    const handleConfirm = async () => {
        if (!options) return

        setIsLoading(true)
        try {
            await options.onConfirm()
            setIsOpen(false)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false)
        }
    }

    return {
        confirm,
        isOpen,
        isLoading,
        options,
        handleConfirm,
        handleClose,
    }
}
