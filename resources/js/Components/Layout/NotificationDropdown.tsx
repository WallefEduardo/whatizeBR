import { useState, useEffect } from 'react'
import { Link } from '@inertiajs/react'
import { Bell, MessageSquare, UserPlus, Trash2, Check, CheckCheck } from 'lucide-react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notification {
    id: string
    type: string
    data: {
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
    read_at: string | null
    created_at: string
}

interface NotificationDropdownProps {
    show: boolean
    onClose: () => void
}

export default function NotificationDropdown({ show, onClose }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)

    useEffect(() => {
        if (show) {
            loadNotifications()
        }
    }, [show])

    const loadNotifications = async (page = 1) => {
        try {
            const response = await axios.get(`/notifications?page=${page}`)
            if (page === 1) {
                setNotifications(response.data.data)
            } else {
                setNotifications((prev) => [...prev, ...response.data.data])
            }
            setCurrentPage(response.data.current_page)
            setHasMore(response.data.current_page < response.data.last_page)
        } catch (error) {
            console.error('Failed to load notifications:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const markAsRead = async (notificationId: string) => {
        try {
            await axios.post(`/notifications/${notificationId}/mark-as-read`)
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
            )
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-as-read')
            setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error)
        }
    }

    const deleteNotification = async (notificationId: string) => {
        try {
            await axios.delete(`/notifications/${notificationId}`)
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        } catch (error) {
            console.error('Failed to delete notification:', error)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_message':
                return <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            case 'conversation_assigned':
                return <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            default:
                return <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        }
    }

    const getNotificationTitle = (notification: Notification) => {
        switch (notification.data.type) {
            case 'new_message':
                return `Nova mensagem de ${notification.data.contact_name}`
            case 'conversation_assigned':
                const assignedBy = notification.data.assigned_by?.name || 'Sistema'
                return `Conversa atribuída por ${assignedBy}`
            default:
                return 'Notificação'
        }
    }

    const getNotificationContent = (notification: Notification) => {
        switch (notification.data.type) {
            case 'new_message':
                return notification.data.message_preview || '[Mídia]'
            case 'conversation_assigned':
                return `Contato: ${notification.data.contact_name}`
            default:
                return ''
        }
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id)
        }
        onClose()
    }

    if (!show) return null

    return (
        <div
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
            style={{ borderRadius: '4px' }}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Notificações</h3>
                {notifications.some((n) => !n.read_at) && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                        <CheckCheck className="w-3 h-3" />
                        Marcar todas como lidas
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Carregando notificações...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação</p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <Link
                                key={notification.id}
                                href={`/chat/${notification.data.conversation_id}`}
                                onClick={() => handleNotificationClick(notification)}
                                className={`flex items-start gap-3 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                                    !notification.read_at ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                                }`}
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        {getNotificationIcon(notification.data.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                                            {getNotificationTitle(notification)}
                                        </h4>
                                        {!notification.read_at && (
                                            <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-1"></span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                                        {getNotificationContent(notification)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {formatDistanceToNow(new Date(notification.created_at), {
                                            addSuffix: true,
                                            locale: ptBR,
                                        })}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    {!notification.read_at && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                markAsRead(notification.id)
                                            }}
                                            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                                            title="Marcar como lida"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            deleteNotification(notification.id)
                                        }}
                                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                                        title="Excluir notificação"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </Link>
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => loadNotifications(currentPage + 1)}
                                    className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                    Carregar mais
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
