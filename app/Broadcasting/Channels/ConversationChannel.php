<?php

namespace App\Broadcasting\Channels;

use App\Models\Conversation;
use App\Models\User;

class ConversationChannel
{
    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, string $conversationId): array|bool
    {
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return false;
        }

        // Verifica se o usuário tem acesso a esta conversa
        // (é o dono da instância ou está atribuído à conversa)
        return $conversation->instance->user_id === $user->id ||
               $conversation->assigned_to === $user->id;
    }
}
