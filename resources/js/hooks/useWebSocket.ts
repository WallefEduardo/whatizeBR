import { useEffect, useCallback } from 'react';

interface Message {
    id: string;
    conversation_id: string;
    direction: 'inbound' | 'outbound';
    type: string;
    content: string;
    media_url?: string;
    media_type?: string;
    caption?: string;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    created_at: string;
}

interface UseWebSocketOptions {
    conversationId: string;
    onMessageReceived?: (message: Message) => void;
    onMessageSent?: (message: Message) => void;
    onMessageRead?: (messageId: string) => void;
    onTypingIndicator?: (contactName: string, isTyping: boolean) => void;
}

export function useWebSocket({
    conversationId,
    onMessageReceived,
    onMessageSent,
    onMessageRead,
    onTypingIndicator,
}: UseWebSocketOptions) {
    useEffect(() => {
        if (!conversationId || !window.Echo) {
            console.warn('WebSocket: ConversationId or Echo not available');
            return;
        }

        console.log(`WebSocket: Connecting to conversation.${conversationId}`);

        // Join the private channel
        const channel = window.Echo.private(`conversation.${conversationId}`);

        // Listen to message.received event
        if (onMessageReceived) {
            channel.listen('.message.received', (data: { message: Message }) => {
                console.log('WebSocket: Message received', data);
                onMessageReceived(data.message);
            });
        }

        // Listen to message.sent event
        if (onMessageSent) {
            channel.listen('.message.sent', (data: { message: Message }) => {
                console.log('WebSocket: Message sent', data);
                onMessageSent(data.message);
            });
        }

        // Listen to message.read event
        if (onMessageRead) {
            channel.listen('.message.read', (data: { message_id: string }) => {
                console.log('WebSocket: Message read', data);
                onMessageRead(data.message_id);
            });
        }

        // Listen to typing.indicator event
        if (onTypingIndicator) {
            channel.listen('.typing.indicator', (data: { contact_name: string; is_typing: boolean }) => {
                console.log('WebSocket: Typing indicator', data);
                onTypingIndicator(data.contact_name, data.is_typing);
            });
        }

        // Cleanup on unmount
        return () => {
            console.log(`WebSocket: Leaving conversation.${conversationId}`);
            window.Echo.leave(`private-conversation.${conversationId}`);
        };
    }, [conversationId, onMessageReceived, onMessageSent, onMessageRead, onTypingIndicator]);

    // Helper to emit typing indicator
    const sendTypingIndicator = useCallback(
        (isTyping: boolean) => {
            if (!conversationId) return;

            // You can send a request to backend to broadcast typing indicator
            window.axios.post('/api/conversations/' + conversationId + '/typing', {
                is_typing: isTyping,
            });
        },
        [conversationId]
    );

    return {
        sendTypingIndicator,
    };
}
