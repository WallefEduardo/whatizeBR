<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatbotFlow extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'chatbot_id',
        'name',
        'nodes',
        'edges',
        'start_node_id',
        'variables',
    ];

    protected $casts = [
        'nodes' => 'array',
        'edges' => 'array',
        'variables' => 'array',
    ];

    /**
     * Get the chatbot that owns the flow.
     */
    public function chatbot(): BelongsTo
    {
        return $this->belongsTo(Chatbot::class);
    }

    /**
     * Get the sessions for the flow.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(ChatbotSession::class, 'flow_id');
    }

    /**
     * Get a node by its ID.
     */
    public function getNode(string $nodeId)
    {
        return collect($this->nodes)->firstWhere('id', $nodeId);
    }

    /**
     * Get edges from a specific node.
     */
    public function getEdgesFromNode(string $nodeId)
    {
        return collect($this->edges)->where('source', $nodeId);
    }

    /**
     * Get the start node.
     */
    public function getStartNode()
    {
        return $this->getNode($this->start_node_id);
    }
}
