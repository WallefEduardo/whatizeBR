<?php

namespace App\Notifications;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConversationAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Conversation $conversation;
    public ?User $assignedBy;

    /**
     * Create a new notification instance.
     */
    public function __construct(Conversation $conversation, ?User $assignedBy = null)
    {
        $this->conversation = $conversation;
        $this->assignedBy = $assignedBy;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Check user preferences
        $preferences = \App\Models\NotificationPreference::forUser($notifiable->id);

        if ($preferences->email_enabled) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $contact = $this->conversation->contact;
        $assignedByName = $this->assignedBy ? $this->assignedBy->name : 'Sistema';

        return (new MailMessage)
            ->subject('Nova conversa atribuída a você')
            ->line('Uma conversa foi atribuída a você por ' . $assignedByName)
            ->line('Contato: ' . ($contact->name ?? $contact->phone))
            ->action('Ver Conversa', url("/chat/{$this->conversation->id}"))
            ->line('Atenda o mais rápido possível!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $contact = $this->conversation->contact;

        return [
            'type' => 'conversation_assigned',
            'conversation_id' => $this->conversation->id,
            'contact_name' => $contact->name ?? $contact->phone,
            'contact_phone' => $contact->phone,
            'contact_avatar' => $contact->avatar_url,
            'assigned_by' => $this->assignedBy ? [
                'id' => $this->assignedBy->id,
                'name' => $this->assignedBy->name,
            ] : null,
            'created_at' => now()->toISOString(),
        ];
    }
}
