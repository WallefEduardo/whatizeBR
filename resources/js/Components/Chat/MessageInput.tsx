import { useState, useRef, KeyboardEvent } from 'react'
import { Smile, Paperclip, Mic, Send, Zap } from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import AttachmentMenu from './AttachmentMenu'
import AudioRecorder from './AudioRecorder'
import QuickReplies from './QuickReplies'
import ReplyPreview from './ReplyPreview'
import MediaPreview from './MediaPreview'

interface Message {
    id: string
    content: string
    type: string
    direction: 'inbound' | 'outbound'
    media_url?: string
}

interface MessageInputProps {
    onSendText: (text: string, replyToId?: string) => void
    onSendMedia: (file: File, type: 'image' | 'video' | 'document', caption?: string) => void
    onSendAudio: (audioBlob: Blob) => void
    replyingTo?: Message | null
    onCancelReply?: () => void
    disabled?: boolean
}

export default function MessageInput({
    onSendText,
    onSendMedia,
    onSendAudio,
    replyingTo,
    onCancelReply,
    disabled = false,
}: MessageInputProps) {
    const [messageText, setMessageText] = useState('')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
    const [showQuickReplies, setShowQuickReplies] = useState(false)
    const [isRecordingAudio, setIsRecordingAudio] = useState(false)
    const [mediaPreview, setMediaPreview] = useState<{
        file: File
        type: 'image' | 'video' | 'document'
    } | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSendMessage = () => {
        if (messageText.trim()) {
            onSendText(messageText.trim(), replyingTo?.id)
            setMessageText('')
            if (onCancelReply) onCancelReply()
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleEmojiSelect = (emoji: string) => {
        setMessageText((prev) => prev + emoji)
        setShowEmojiPicker(false)
        textareaRef.current?.focus()
    }

    const handleFileSelect = (file: File, type: 'image' | 'video' | 'document') => {
        setMediaPreview({ file, type })
        setShowAttachmentMenu(false)
    }

    const handleSendMedia = (caption?: string) => {
        if (mediaPreview) {
            onSendMedia(mediaPreview.file, mediaPreview.type, caption)
            setMediaPreview(null)
        }
    }

    const handleCancelMedia = () => {
        setMediaPreview(null)
    }

    const handleAudioRecorded = (audioBlob: Blob) => {
        onSendAudio(audioBlob)
        setIsRecordingAudio(false)
    }

    const handleCancelAudio = () => {
        setIsRecordingAudio(false)
    }

    const handleQuickReplySelect = (message: string) => {
        setMessageText(message)
        setShowQuickReplies(false)
        textareaRef.current?.focus()
    }

    const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value)
        // Auto-resize textarea
        e.target.style.height = 'auto'
        e.target.style.height = e.target.scrollHeight + 'px'
    }

    // If recording audio, show audio recorder
    if (isRecordingAudio) {
        return (
            <div className="border-t border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 p-4">
                <AudioRecorder onAudioRecorded={handleAudioRecorded} onCancel={handleCancelAudio} />
            </div>
        )
    }

    return (
        <>
            {/* Media Preview Modal */}
            {mediaPreview && (
                <MediaPreview
                    file={mediaPreview.file}
                    type={mediaPreview.type}
                    onSend={handleSendMedia}
                    onCancel={handleCancelMedia}
                />
            )}

            <div className="border-t border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800">
                {/* Reply Preview */}
                {replyingTo && onCancelReply && (
                    <ReplyPreview message={replyingTo} onCancel={onCancelReply} />
                )}

                {/* Message Input */}
                <div className="relative p-4">
                    {/* Emoji Picker */}
                    <EmojiPicker
                        isOpen={showEmojiPicker}
                        onClose={() => setShowEmojiPicker(false)}
                        onEmojiSelect={handleEmojiSelect}
                    />

                    {/* Attachment Menu */}
                    <AttachmentMenu
                        isOpen={showAttachmentMenu}
                        onClose={() => setShowAttachmentMenu(false)}
                        onFileSelect={handleFileSelect}
                    />

                    {/* Quick Replies */}
                    <QuickReplies
                        isOpen={showQuickReplies}
                        onClose={() => setShowQuickReplies(false)}
                        onSelect={handleQuickReplySelect}
                    />

                    {/* Input Area */}
                    <div className="flex items-end gap-2">
                        {/* Emoji Button */}
                        <button
                            onClick={() => {
                                setShowEmojiPicker(!showEmojiPicker)
                                setShowAttachmentMenu(false)
                                setShowQuickReplies(false)
                            }}
                            disabled={disabled}
                            className="flex-shrink-0 p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Emoji"
                        >
                            <Smile className="w-5 h-5 text-dark-500" />
                        </button>

                        {/* Attachment Button */}
                        <button
                            onClick={() => {
                                setShowAttachmentMenu(!showAttachmentMenu)
                                setShowEmojiPicker(false)
                                setShowQuickReplies(false)
                            }}
                            disabled={disabled}
                            className="flex-shrink-0 p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Anexar arquivo"
                        >
                            <Paperclip className="w-5 h-5 text-dark-500" />
                        </button>

                        {/* Quick Replies Button */}
                        <button
                            onClick={() => {
                                setShowQuickReplies(!showQuickReplies)
                                setShowEmojiPicker(false)
                                setShowAttachmentMenu(false)
                            }}
                            disabled={disabled}
                            className="flex-shrink-0 p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Respostas rápidas"
                        >
                            <Zap className="w-5 h-5 text-dark-500" />
                        </button>

                        {/* Text Input */}
                        <textarea
                            ref={textareaRef}
                            value={messageText}
                            onChange={handleTextareaInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite uma mensagem..."
                            disabled={disabled}
                            className="flex-1 resize-none bg-dark-100 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 rounded-lg px-4 py-2 text-sm text-dark-900 dark:text-dark-50 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32 overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            rows={1}
                        />

                        {/* Send/Mic Button */}
                        {messageText.trim() ? (
                            <button
                                onClick={handleSendMessage}
                                disabled={disabled}
                                className="flex-shrink-0 p-2 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Enviar"
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsRecordingAudio(true)}
                                disabled={disabled}
                                className="flex-shrink-0 p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Gravar áudio"
                            >
                                <Mic className="w-5 h-5 text-dark-500" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
