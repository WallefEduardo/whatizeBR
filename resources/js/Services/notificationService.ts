import axios from 'axios'

interface NotificationPreferences {
    new_message_enabled: boolean
    conversation_assigned_enabled: boolean
    sound_enabled: boolean
    desktop_enabled: boolean
    email_enabled: boolean
    sound_file: string | null
}

interface NotificationData {
    type: 'new_message' | 'conversation_assigned'
    message_id?: string
    conversation_id: string
    contact_name: string
    contact_phone: string
    contact_avatar?: string
    message_preview?: string
    message_type?: string
    assigned_by?: {
        id: string
        name: string
    }
}

class NotificationService {
    private preferences: NotificationPreferences | null = null
    private notificationSound: HTMLAudioElement | null = null

    constructor() {
        this.loadPreferences()
        this.initNotificationSound()
    }

    async loadPreferences() {
        try {
            const response = await axios.get('/notifications/preferences')
            this.preferences = response.data
        } catch (error) {
            console.error('Failed to load notification preferences:', error)
        }
    }

    initNotificationSound() {
        // Default notification sound - you can replace with custom sound file
        this.notificationSound = new Audio('/sounds/notification.mp3')
        this.notificationSound.volume = 0.5
    }

    async requestDesktopPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.warn('Desktop notifications not supported')
            return 'denied'
        }

        if (Notification.permission === 'default') {
            return await Notification.requestPermission()
        }

        return Notification.permission
    }

    async showNotification(data: NotificationData) {
        if (!this.preferences) {
            await this.loadPreferences()
        }

        // Check if this type of notification is enabled
        if (data.type === 'new_message' && !this.preferences?.new_message_enabled) {
            return
        }

        if (data.type === 'conversation_assigned' && !this.preferences?.conversation_assigned_enabled) {
            return
        }

        // Play sound if enabled
        if (this.preferences?.sound_enabled) {
            this.playNotificationSound()
        }

        // Show desktop notification if enabled
        if (this.preferences?.desktop_enabled) {
            await this.showDesktopNotification(data)
        }
    }

    async showDesktopNotification(data: NotificationData) {
        if (!('Notification' in window)) {
            return
        }

        const permission = await this.requestDesktopPermission()

        if (permission !== 'granted') {
            return
        }

        const title = this.getNotificationTitle(data)
        const body = this.getNotificationBody(data)
        const icon = data.contact_avatar || '/images/default-avatar.png'

        const notification = new Notification(title, {
            body,
            icon,
            badge: icon,
            tag: data.conversation_id, // Prevent duplicate notifications
            requireInteraction: false,
            silent: true, // We handle sound ourselves
        })

        // Click to open conversation
        notification.onclick = () => {
            window.focus()
            window.location.href = `/chat/${data.conversation_id}`
            notification.close()
        }

        // Auto close after 5 seconds
        setTimeout(() => {
            notification.close()
        }, 5000)
    }

    playNotificationSound() {
        if (this.notificationSound) {
            // Reset and play
            this.notificationSound.currentTime = 0
            this.notificationSound.play().catch((error) => {
                console.error('Failed to play notification sound:', error)
            })
        }
    }

    private getNotificationTitle(data: NotificationData): string {
        switch (data.type) {
            case 'new_message':
                return `Nova mensagem de ${data.contact_name}`
            case 'conversation_assigned':
                const assignedBy = data.assigned_by?.name || 'Sistema'
                return `Conversa atribuída por ${assignedBy}`
            default:
                return 'Notificação'
        }
    }

    private getNotificationBody(data: NotificationData): string {
        switch (data.type) {
            case 'new_message':
                return data.message_preview || '[Mídia]'
            case 'conversation_assigned':
                return `Contato: ${data.contact_name}`
            default:
                return ''
        }
    }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export types
export type { NotificationData, NotificationPreferences }
