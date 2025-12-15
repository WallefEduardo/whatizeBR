import { useState } from 'react'
import { X, Send, FileText, Film } from 'lucide-react'

interface MediaPreviewProps {
    file: File
    type: 'image' | 'video' | 'document'
    onSend: (caption?: string) => void
    onCancel: () => void
}

export default function MediaPreview({ file, type, onSend, onCancel }: MediaPreviewProps) {
    const [caption, setCaption] = useState('')
    const [previewUrl, setPreviewUrl] = useState<string>('')

    // Generate preview URL for image/video
    useState(() => {
        if (type === 'image' || type === 'video') {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        }
    })

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const handleSend = () => {
        onSend(caption || undefined)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Preview</h3>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Preview Area */}
                <div className="bg-dark-800 rounded-lg overflow-hidden mb-4">
                    {type === 'image' && (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-auto max-h-96 object-contain"
                        />
                    )}

                    {type === 'video' && (
                        <video
                            src={previewUrl}
                            controls
                            className="w-full h-auto max-h-96 object-contain"
                        />
                    )}

                    {type === 'document' && (
                        <div className="flex items-center gap-4 p-8">
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{file.name}</p>
                                <p className="text-dark-400 text-sm">{formatFileSize(file.size)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Caption Input */}
                <div className="bg-dark-800 rounded-lg p-4 mb-4">
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Adicione uma legenda (opcional)..."
                        className="w-full bg-transparent border-none resize-none text-white placeholder-dark-400 focus:outline-none"
                        rows={3}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSend}
                        className="px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-2 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    )
}
