import { useState, useRef, useEffect } from 'react'
import EmojiPickerReact, { EmojiClickData } from 'emoji-picker-react'

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void
    isOpen: boolean
    onClose: () => void
}

export default function EmojiPicker({ onEmojiSelect, isOpen, onClose }: EmojiPickerProps) {
    const pickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiSelect(emojiData.emoji)
    }

    if (!isOpen) return null

    return (
        <div
            ref={pickerRef}
            className="absolute bottom-16 left-0 z-50 shadow-xl rounded-lg overflow-hidden"
        >
            <EmojiPickerReact
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                width={350}
                height={400}
            />
        </div>
    )
}
