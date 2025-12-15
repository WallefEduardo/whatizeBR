import { useEffect, useCallback } from 'react'
import { notificationService, type NotificationData } from '@/Services/notificationService'

interface UseNotificationsOptions {
    // Enable real-time listening via WebSocket/Echo (can be implemented later)
    enableRealtime?: boolean
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    useEffect(() => {
        // Request desktop notification permission on mount
        notificationService.requestDesktopPermission()

        // TODO: Setup WebSocket/Echo listener for real-time notifications
        // if (options.enableRealtime) {
        //     window.Echo.private(`App.Models.User.${userId}`)
        //         .notification((notification) => {
        //             notificationService.showNotification(notification.data)
        //         })
        // }

        return () => {
            // Cleanup listeners
        }
    }, [options.enableRealtime])

    const showNotification = useCallback((data: NotificationData) => {
        notificationService.showNotification(data)
    }, [])

    const requestPermission = useCallback(async () => {
        return await notificationService.requestDesktopPermission()
    }, [])

    return {
        showNotification,
        requestPermission,
    }
}
