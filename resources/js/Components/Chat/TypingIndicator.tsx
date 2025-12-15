interface TypingIndicatorProps {
    contactName?: string
}

export default function TypingIndicator({ contactName = 'Contato' }: TypingIndicatorProps) {
    return (
        <div className="flex items-start gap-2 px-4 py-2">
            {/* Avatar placeholder */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-200 dark:bg-dark-700"></div>

            {/* Typing bubble */}
            <div className="bg-white dark:bg-dark-700 rounded-lg px-4 py-3 shadow-sm border border-dark-200 dark:border-dark-600">
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-dark-400 animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 rounded-full bg-dark-400 animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 rounded-full bg-dark-400 animate-bounce"></span>
                    </div>
                </div>
            </div>
        </div>
    )
}
