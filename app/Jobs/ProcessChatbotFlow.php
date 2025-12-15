<?php

namespace App\Jobs;

use App\Models\ChatbotSession;
use App\Services\ChatbotService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessChatbotFlow implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $sessionId,
        public ?string $nextNodeId = null
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(ChatbotService $chatbotService): void
    {
        $session = ChatbotSession::find($this->sessionId);

        if (!$session) {
            Log::warning("ChatbotSession {$this->sessionId} not found");
            return;
        }

        if ($session->status !== 'active') {
            Log::info("ChatbotSession {$this->sessionId} is not active (status: {$session->status})");
            return;
        }

        // If next node is specified (for delayed nodes), execute it
        if ($this->nextNodeId) {
            $session->update(['current_node_id' => $this->nextNodeId]);
        }

        // Execute the current node
        $chatbotService->executeNode($session, $session->current_node_id);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessChatbotFlow job failed for session {$this->sessionId}: " . $exception->getMessage());

        $session = ChatbotSession::find($this->sessionId);
        if ($session) {
            $session->markAsFailed();
        }
    }
}
