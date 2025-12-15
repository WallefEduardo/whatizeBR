<?php

namespace App\Services;

use App\Models\Chatbot;
use App\Models\ChatbotFlow;
use App\Models\ChatbotSession;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    /**
     * Start a chatbot session for a conversation.
     */
    public function startSession(Conversation $conversation, Chatbot $chatbot): ?ChatbotSession
    {
        // Get the first active flow for this chatbot
        $flow = $chatbot->flows()->first();

        if (!$flow) {
            Log::warning("No flow found for chatbot {$chatbot->id}");
            return null;
        }

        // Create a new session
        $session = ChatbotSession::create([
            'conversation_id' => $conversation->id,
            'chatbot_id' => $chatbot->id,
            'flow_id' => $flow->id,
            'current_node_id' => $flow->start_node_id,
            'variables' => $this->getInitialVariables($conversation),
            'status' => 'active',
            'started_at' => now(),
        ]);

        // Execute the first node
        $this->executeNode($session, $flow->start_node_id);

        return $session;
    }

    /**
     * Process a user response in an active chatbot session.
     */
    public function processResponse(ChatbotSession $session, Message $message): void
    {
        if ($session->status !== 'active') {
            return;
        }

        $flow = $session->flow;
        $currentNode = $flow->getNode($session->current_node_id);

        if (!$currentNode) {
            $session->markAsFailed();
            return;
        }

        // Store user response in variables if needed
        if (isset($currentNode['data']['variable_name'])) {
            $session->setVariable($currentNode['data']['variable_name'], $message->content);
        }

        // Find next node based on current node type and user response
        $nextNodeId = $this->getNextNode($currentNode, $message, $flow);

        if (!$nextNodeId) {
            $session->markAsCompleted();
            return;
        }

        // Update session and execute next node
        $session->update(['current_node_id' => $nextNodeId]);
        $this->executeNode($session, $nextNodeId);
    }

    /**
     * Execute a specific node in the flow.
     */
    public function executeNode(ChatbotSession $session, string $nodeId): void
    {
        $flow = $session->flow;
        $node = $flow->getNode($nodeId);

        if (!$node) {
            Log::error("Node {$nodeId} not found in flow {$flow->id}");
            $session->markAsFailed();
            return;
        }

        $nodeType = $node['type'] ?? 'unknown';

        try {
            switch ($nodeType) {
                case 'start':
                    $this->executeStartNode($session, $node);
                    break;
                case 'text':
                    $this->executeTextNode($session, $node);
                    break;
                case 'button':
                    $this->executeButtonNode($session, $node);
                    break;
                case 'list':
                    $this->executeListNode($session, $node);
                    break;
                case 'media':
                    $this->executeMediaNode($session, $node);
                    break;
                case 'delay':
                    $this->executeDelayNode($session, $node);
                    break;
                case 'condition':
                    $this->executeConditionNode($session, $node);
                    break;
                case 'api':
                    $this->executeApiNode($session, $node);
                    break;
                case 'transfer':
                    $this->executeTransferNode($session, $node);
                    break;
                case 'end':
                    $this->executeEndNode($session, $node);
                    break;
                default:
                    Log::warning("Unknown node type: {$nodeType}");
                    $session->markAsFailed();
            }
        } catch (\Exception $e) {
            Log::error("Error executing node {$nodeId}: " . $e->getMessage());
            $session->markAsFailed();
        }
    }

    /**
     * Execute Start Node - automatically move to next node.
     */
    protected function executeStartNode(ChatbotSession $session, array $node): void
    {
        $nextNodeId = $this->getNextNodeFromEdges($session->flow, $node['id']);

        if ($nextNodeId) {
            $session->update(['current_node_id' => $nextNodeId]);
            $this->executeNode($session, $nextNodeId);
        }
    }

    /**
     * Execute Text Node - send text message.
     */
    protected function executeTextNode(ChatbotSession $session, array $node): void
    {
        $message = $node['data']['message'] ?? '';
        $message = $this->replaceVariables($message, $session);

        // Send message
        $this->sendMessage($session->conversation, 'text', $message);

        // Move to next node automatically if no user input is required
        if (!isset($node['data']['wait_for_response']) || !$node['data']['wait_for_response']) {
            $nextNodeId = $this->getNextNodeFromEdges($session->flow, $node['id']);
            if ($nextNodeId) {
                $session->update(['current_node_id' => $nextNodeId]);
                $this->executeNode($session, $nextNodeId);
            }
        }
    }

    /**
     * Execute Button Node - send button message.
     */
    protected function executeButtonNode(ChatbotSession $session, array $node): void
    {
        $message = $node['data']['message'] ?? '';
        $message = $this->replaceVariables($message, $session);
        $buttons = $node['data']['buttons'] ?? [];

        // Send button message
        $this->sendMessage($session->conversation, 'button', $message, [
            'buttons' => $buttons,
        ]);

        // Wait for user response
    }

    /**
     * Execute List Node - send list message.
     */
    protected function executeListNode(ChatbotSession $session, array $node): void
    {
        $message = $node['data']['message'] ?? '';
        $message = $this->replaceVariables($message, $session);
        $title = $node['data']['title'] ?? 'Opções';
        $sections = $node['data']['sections'] ?? [];

        // Send list message
        $this->sendMessage($session->conversation, 'list', $message, [
            'title' => $title,
            'sections' => $sections,
        ]);

        // Wait for user response
    }

    /**
     * Execute Media Node - send media message.
     */
    protected function executeMediaNode(ChatbotSession $session, array $node): void
    {
        $mediaType = $node['data']['media_type'] ?? 'image';
        $mediaUrl = $node['data']['media_url'] ?? '';
        $caption = $node['data']['caption'] ?? '';
        $caption = $this->replaceVariables($caption, $session);

        // Send media message
        $this->sendMessage($session->conversation, $mediaType, $caption, [
            'media_url' => $mediaUrl,
        ]);

        // Move to next node automatically
        $nextNodeId = $this->getNextNodeFromEdges($session->flow, $node['id']);
        if ($nextNodeId) {
            $session->update(['current_node_id' => $nextNodeId]);
            $this->executeNode($session, $nextNodeId);
        }
    }

    /**
     * Execute Delay Node - add delay before next node.
     */
    protected function executeDelayNode(ChatbotSession $session, array $node): void
    {
        $delaySeconds = $node['data']['delay_seconds'] ?? 1;

        // Dispatch job with delay
        \App\Jobs\ProcessChatbotFlow::dispatch($session->id)
            ->delay(now()->addSeconds($delaySeconds));
    }

    /**
     * Execute Condition Node - evaluate condition and branch.
     */
    protected function executeConditionNode(ChatbotSession $session, array $node): void
    {
        $variable = $node['data']['variable'] ?? '';
        $operator = $node['data']['operator'] ?? '==';
        $value = $node['data']['value'] ?? '';

        $variableValue = $session->getVariable($variable);
        $result = $this->evaluateCondition($variableValue, $operator, $value);

        // Get edges for true/false branches
        $edges = $session->flow->getEdgesFromNode($node['id']);
        $nextNodeId = null;

        foreach ($edges as $edge) {
            $edgeCondition = $edge['data']['condition'] ?? null;
            if (($result && $edgeCondition === 'true') || (!$result && $edgeCondition === 'false')) {
                $nextNodeId = $edge['target'];
                break;
            }
        }

        if ($nextNodeId) {
            $session->update(['current_node_id' => $nextNodeId]);
            $this->executeNode($session, $nextNodeId);
        }
    }

    /**
     * Execute API Node - call external webhook.
     */
    protected function executeApiNode(ChatbotSession $session, array $node): void
    {
        $url = $node['data']['url'] ?? '';
        $method = $node['data']['method'] ?? 'POST';
        $headers = $node['data']['headers'] ?? [];
        $body = $node['data']['body'] ?? [];

        // Replace variables in body
        $body = $this->replaceVariablesInArray($body, $session);

        try {
            $response = Http::withHeaders($headers)
                ->timeout(30)
                ->{strtolower($method)}($url, $body);

            // Store response in variables
            $responseVar = $node['data']['response_variable'] ?? 'api_response';
            $session->setVariable($responseVar, $response->json());
            $session->setVariable('api_status', $response->status());

            // Move to next node
            $nextNodeId = $this->getNextNodeFromEdges($session->flow, $node['id']);
            if ($nextNodeId) {
                $session->update(['current_node_id' => $nextNodeId]);
                $this->executeNode($session, $nextNodeId);
            }
        } catch (\Exception $e) {
            Log::error("API Node error: " . $e->getMessage());
            $session->setVariable('api_error', $e->getMessage());

            // Try to find error edge
            $edges = $session->flow->getEdgesFromNode($node['id']);
            $errorEdge = collect($edges)->firstWhere('data.on_error', true);

            if ($errorEdge) {
                $session->update(['current_node_id' => $errorEdge['target']]);
                $this->executeNode($session, $errorEdge['target']);
            } else {
                $session->markAsFailed();
            }
        }
    }

    /**
     * Execute Transfer Node - transfer to human agent.
     */
    protected function executeTransferNode(ChatbotSession $session, array $node): void
    {
        $departmentId = $node['data']['department_id'] ?? null;
        $message = $node['data']['message'] ?? 'Transferindo para um atendente...';
        $message = $this->replaceVariables($message, $session);

        // Send transfer message
        $this->sendMessage($session->conversation, 'text', $message);

        // Update conversation to assign to department/agent
        $conversation = $session->conversation;
        $conversation->update([
            'department_id' => $departmentId,
            'status' => 'pending',
        ]);

        // End chatbot session
        $session->markAsCompleted();
    }

    /**
     * Execute End Node - complete the session.
     */
    protected function executeEndNode(ChatbotSession $session, array $node): void
    {
        $message = $node['data']['message'] ?? null;

        if ($message) {
            $message = $this->replaceVariables($message, $session);
            $this->sendMessage($session->conversation, 'text', $message);
        }

        $session->markAsCompleted();
    }

    /**
     * Get next node ID from edges.
     */
    protected function getNextNodeFromEdges(ChatbotFlow $flow, string $nodeId): ?string
    {
        $edges = $flow->getEdgesFromNode($nodeId);
        $firstEdge = $edges->first();

        return $firstEdge['target'] ?? null;
    }

    /**
     * Get next node based on current node and user response.
     */
    protected function getNextNode(array $currentNode, Message $message, ChatbotFlow $flow): ?string
    {
        $nodeType = $currentNode['type'] ?? 'unknown';

        if ($nodeType === 'button' || $nodeType === 'list') {
            // Find edge based on button/list selection
            $edges = $flow->getEdgesFromNode($currentNode['id']);
            $userResponse = $message->content;

            foreach ($edges as $edge) {
                if (isset($edge['data']['value']) && $edge['data']['value'] === $userResponse) {
                    return $edge['target'];
                }
            }

            // Default edge if no match
            return $edges->first()['target'] ?? null;
        }

        // For other types, just get the first edge
        return $this->getNextNodeFromEdges($flow, $currentNode['id']);
    }

    /**
     * Replace variables in text with actual values.
     */
    protected function replaceVariables(string $text, ChatbotSession $session): string
    {
        $variables = $session->variables;

        preg_match_all('/\{\{(\w+)\}\}/', $text, $matches);

        foreach ($matches[1] as $varName) {
            $value = data_get($variables, $varName, '');
            $text = str_replace("{{" . $varName . "}}", $value, $text);
        }

        return $text;
    }

    /**
     * Replace variables in array recursively.
     */
    protected function replaceVariablesInArray(array $data, ChatbotSession $session): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = $this->replaceVariables($value, $session);
            } elseif (is_array($value)) {
                $data[$key] = $this->replaceVariablesInArray($value, $session);
            }
        }

        return $data;
    }

    /**
     * Evaluate a condition.
     */
    protected function evaluateCondition($left, string $operator, $right): bool
    {
        switch ($operator) {
            case '==':
                return $left == $right;
            case '!=':
                return $left != $right;
            case '>':
                return $left > $right;
            case '>=':
                return $left >= $right;
            case '<':
                return $left < $right;
            case '<=':
                return $left <= $right;
            case 'contains':
                return str_contains((string) $left, (string) $right);
            case 'starts_with':
                return str_starts_with((string) $left, (string) $right);
            case 'ends_with':
                return str_ends_with((string) $left, (string) $right);
            default:
                return false;
        }
    }

    /**
     * Get initial variables for a session.
     */
    protected function getInitialVariables(Conversation $conversation): array
    {
        $contact = $conversation->contact;

        return [
            'contact_name' => $contact->name ?? '',
            'contact_phone' => $contact->phone ?? '',
            'contact_email' => $contact->email ?? '',
            'conversation_id' => $conversation->id,
        ];
    }

    /**
     * Send a message in the conversation.
     */
    protected function sendMessage(Conversation $conversation, string $type, string $content, array $metadata = []): void
    {
        Message::create([
            'instance_id' => $conversation->instance_id,
            'conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'from_phone' => $conversation->instance->phone_number ?? '',
            'to_phone' => $conversation->contact->phone ?? '',
            'type' => $type,
            'content' => $content,
            'metadata' => $metadata,
            'status' => 'pending',
        ]);

        // Here you would dispatch a job to actually send the message via WhatsApp API
        // \App\Jobs\SendWhatsAppMessage::dispatch($message);
    }

    /**
     * Check if a chatbot should be triggered for a conversation.
     */
    public function shouldTrigger(Chatbot $chatbot, Conversation $conversation, ?Message $message = null): bool
    {
        if (!$chatbot->is_active) {
            return false;
        }

        switch ($chatbot->trigger_type) {
            case 'always':
                return true;

            case 'keyword':
                if (!$message || !$chatbot->trigger_value) {
                    return false;
                }
                return stripos($message->content, $chatbot->trigger_value) !== false;

            case 'business_hours':
                return !$this->isBusinessHours();

            case 'custom':
                // Implement custom trigger logic
                return false;

            default:
                return false;
        }
    }

    /**
     * Check if current time is within business hours.
     */
    protected function isBusinessHours(): bool
    {
        $now = now();
        $dayOfWeek = $now->dayOfWeek; // 0 = Sunday, 6 = Saturday
        $currentTime = $now->format('H:i');

        // Business hours: Monday-Friday, 9:00-18:00
        if ($dayOfWeek >= 1 && $dayOfWeek <= 5) {
            return $currentTime >= '09:00' && $currentTime <= '18:00';
        }

        return false;
    }
}
