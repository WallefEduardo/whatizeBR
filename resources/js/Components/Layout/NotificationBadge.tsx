import { useEffect, useState } from 'react'
import axios from 'axios'

interface NotificationBadgeProps {
    className?: string
}

export default function NotificationBadge({ className = '' }: NotificationBadgeProps) {
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        loadUnreadCount()

        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000)

        return () => clearInterval(interval)
    }, [])

    const loadUnreadCount = async () => {
        try {
            const response = await axios.get('/notifications/unread-count')
            setUnreadCount(response.data.count)
        } catch (error) {
            console.error('Failed to load unread notification count:', error)
        }
    }

    if (unreadCount === 0) return null

    return (
        <span
            className={`absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ${className}`}
        >
            {unreadCount > 99 ? '99+' : unreadCount}
        </span>
    )
}
