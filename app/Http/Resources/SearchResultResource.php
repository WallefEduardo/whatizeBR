<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SearchResultResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->getResourceType(),
            'title' => $this->getTitle(),
            'subtitle' => $this->getSubtitle(),
            'description' => $this->getDescription(),
            'highlighted' => $this->getHighlighted(),
            'url' => $this->getUrl(),
            'metadata' => $this->getMetadata(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Get resource type
     */
    private function getResourceType(): string
    {
        return match (get_class($this->resource)) {
            \App\Models\Message::class => 'message',
            \App\Models\Contact::class => 'contact',
            \App\Models\Conversation::class => 'conversation',
            default => 'unknown',
        };
    }

    /**
     * Get title
     */
    private function getTitle(): string
    {
        return match (get_class($this->resource)) {
            \App\Models\Message::class => $this->content ? substr($this->content, 0, 100) : 'Mensagem ' . $this->type,
            \App\Models\Contact::class => $this->name ?? $this->phone,
            \App\Models\Conversation::class => $this->is_group
                ? ($this->group_name ?? 'Grupo')
                : ($this->contact?->name ?? $this->contact?->phone ?? 'Conversa'),
            default => 'Desconhecido',
        };
    }

    /**
     * Get subtitle
     */
    private function getSubtitle(): ?string
    {
        return match (get_class($this->resource)) {
            \App\Models\Message::class => $this->conversation?->contact?->name ?? $this->from_phone,
            \App\Models\Contact::class => $this->phone,
            \App\Models\Conversation::class => $this->contact?->phone ?? null,
            default => null,
        };
    }

    /**
     * Get description
     */
    private function getDescription(): ?string
    {
        return match (get_class($this->resource)) {
            \App\Models\Message::class => $this->caption,
            \App\Models\Contact::class => $this->email,
            \App\Models\Conversation::class => "Status: {$this->status}",
            default => null,
        };
    }

    /**
     * Get highlighted text
     */
    private function getHighlighted(): ?string
    {
        if (isset($this->content_highlighted)) {
            return $this->content_highlighted;
        }

        return null;
    }

    /**
     * Get URL
     */
    private function getUrl(): string
    {
        return match (get_class($this->resource)) {
            \App\Models\Message::class => route('chat.show', $this->conversation_id),
            \App\Models\Contact::class => route('contacts.show', $this->id),
            \App\Models\Conversation::class => route('chat.show', $this->id),
            default => '#',
        };
    }

    /**
     * Get metadata
     */
    private function getMetadata(): array
    {
        return match (get_class($this->resource)) {
            \App\Models\Message::class => [
                'direction' => $this->direction,
                'type' => $this->type,
                'status' => $this->status,
                'has_media' => $this->hasMedia(),
                'sent_at' => $this->sent_at?->toIso8601String(),
            ],
            \App\Models\Contact::class => [
                'is_blocked' => $this->is_blocked,
                'tags' => $this->tags?->pluck('name')->toArray() ?? [],
                'last_interaction_at' => $this->last_interaction_at?->toIso8601String(),
            ],
            \App\Models\Conversation::class => [
                'status' => $this->status,
                'is_group' => $this->is_group,
                'unread_count' => $this->unread_count,
                'assigned_to' => $this->assignedUser?->name ?? null,
                'department' => $this->department?->name ?? null,
                'last_message_at' => $this->last_message_at?->toIso8601String(),
            ],
            default => [],
        };
    }
}
