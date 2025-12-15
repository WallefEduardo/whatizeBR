import { useState, useRef, useEffect } from 'react'
import { Image, Video, FileText, MapPin, User, X } from 'lucide-react'

interface AttachmentMenuProps {
    isOpen: boolean
    onClose: () => void
    onFileSelect: (file: File, type: 'image' | 'video' | 'document') => void
    onLocationSelect?: () => void
    onContactSelect?: () => void
}

export default function AttachmentMenu({
    isOpen,
    onClose,
    onFileSelect,
    onLocationSelect,
    onContactSelect,
}: AttachmentMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)
    const documentInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        type: 'image' | 'video' | 'document'
    ) => {
        const file = event.target.files?.[0]
        if (file) {
            onFileSelect(file, type)
            onClose()
        }
        // Reset input
        event.target.value = ''
    }

    if (!isOpen) return null

    return (
        <div
            ref={menuRef}
            className="absolute bottom-16 left-0 z-50 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-dark-200 dark:border-dark-700 p-2 min-w-[240px]"
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            >
                <X className="w-4 h-4 text-dark-500" />
            </button>

            <div className="space-y-1 mt-6">
                {/* Image */}
                <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-left"
                >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50">Imagem</p>
                        <p className="text-xs text-dark-500">JPG, PNG, GIF</p>
                    </div>
                </button>
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'image')}
                />

                {/* Video */}
                <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-left"
                >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <Video className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50">Vídeo</p>
                        <p className="text-xs text-dark-500">MP4, AVI, MOV</p>
                    </div>
                </button>
                <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'video')}
                />

                {/* Document */}
                <button
                    onClick={() => documentInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-left"
                >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50">Documento</p>
                        <p className="text-xs text-dark-500">PDF, DOC, XLS</p>
                    </div>
                </button>
                <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'document')}
                />

                {/* Location */}
                {onLocationSelect && (
                    <button
                        onClick={() => {
                            onLocationSelect()
                            onClose()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-left"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-dark-900 dark:text-dark-50">Localização</p>
                            <p className="text-xs text-dark-500">Compartilhar localização</p>
                        </div>
                    </button>
                )}

                {/* Contact */}
                {onContactSelect && (
                    <button
                        onClick={() => {
                            onContactSelect()
                            onClose()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-left"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-dark-900 dark:text-dark-50">Contato</p>
                            <p className="text-xs text-dark-500">Compartilhar contato</p>
                        </div>
                    </button>
                )}
            </div>
        </div>
    )
}
