<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Message $message;
    public Conversation $conversation;

    /**
     * Create a new notification instance.
     */
    public function __construct(Message $message, Conversation $conversation)
    {
        $this->message = $message;
        $this->conversation = $conversation;
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
        $preview = \Str::limit($this->message->content ?? '[Mídia]', 100);

        return (new MailMessage)
            ->subject('Nova mensagem de ' . ($contact->name ?? $contact->phone))
            ->line('Você recebeu uma nova mensagem:')
            ->line('"' . $preview . '"')
            ->action('Ver Conversa', url("/chat/{$this->conversation->id}"))
            ->line('Atenda rapidamente para manter um bom atendimento!');
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
            'type' => 'new_message',
            'message_id' => $this->message->id,
            'conversation_id' => $this->conversation->id,
            'contact_name' => $contact->name ?? $contact->phone,
            'contact_phone' => $contact->phone,
            'contact_avatar' => $contact->avatar_url,
            'message_preview' => \Str::limit($this->message->content ?? '[Mídia]', 100),
            'message_type' => $this->message->type,
            'created_at' => $this->message->created_at->toISOString(),
        ];
    }
}
