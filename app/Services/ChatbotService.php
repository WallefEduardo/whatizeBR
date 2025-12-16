<?php

namespace App\Services;

use App\Models\Chatbot;

class ChatbotService
{
    public function matchesTrigger(Chatbot $chatbot, string $message): bool
    {
        if ($chatbot->trigger_type === 'always') {
            return true;
        }

        if ($chatbot->trigger_type === 'keyword') {
            $keywords = explode('|', strtolower($chatbot->trigger_value));
            $messageLower = strtolower($message);

            foreach ($keywords as $keyword) {
                if (str_contains($messageLower, trim($keyword))) {
                    return true;
                }
            }
        }

        return false;
    }

    public function processVariables(string $message, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $message = str_replace('{{' . $key . '}}', $value, $message);
        }

        return $message;
    }

    public function evaluateCondition(array $node, array $variables): bool
    {
        $conditions = $node['conditions'] ?? [];
        $operator = $node['operator'] ?? 'AND';

        if (empty($conditions)) {
            return false;
        }

        $results = [];

        foreach ($conditions as $condition) {
            $variable = $variables[$condition['variable']] ?? null;
            $value = $condition['value'];
            $op = $condition['operator'];

            $result = $this->evaluateSingleCondition($variable, $op, $value);
            $results[] = $result;
        }

        if ($operator === 'OR') {
            return in_array(true, $results);
        }

        return !in_array(false, $results);
    }

    private function evaluateSingleCondition($variable, string $operator, $value): bool
    {
        return match ($operator) {
            '==' => $variable == $value,
            '!=' => $variable != $value,
            '>' => $variable > $value,
            '>=' => $variable >= $value,
            '<' => $variable < $value,
            '<=' => $variable <= $value,
            'contains' => str_contains((string)$variable, (string)$value),
            default => false,
        };
    }

    public function validateFlowStructure(array $flow): bool
    {
        $nodes = $flow['nodes'] ?? [];
        $edges = $flow['edges'] ?? [];

        $hasStart = collect($nodes)->contains('type', 'start');

        if (!$hasStart) {
            return false;
        }

        if ($this->hasCircularDependency($edges)) {
            return false;
        }

        return true;
    }

    private function hasCircularDependency(array $edges): bool
    {
        $visited = [];
        $recursionStack = [];

        foreach ($edges as $edge) {
            $source = $edge['source'];

            if (!isset($visited[$source])) {
                if ($this->isCyclic($source, $edges, $visited, $recursionStack)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function isCyclic(string $nodeId, array $edges, array &$visited, array &$recursionStack): bool
    {
        $visited[$nodeId] = true;
        $recursionStack[$nodeId] = true;

        foreach ($edges as $edge) {
            if ($edge['source'] === $nodeId) {
                $target = $edge['target'];

                if (!isset($visited[$target])) {
                    if ($this->isCyclic($target, $edges, $visited, $recursionStack)) {
                        return true;
                    }
                } elseif (isset($recursionStack[$target]) && $recursionStack[$target]) {
                    return true;
                }
            }
        }

        $recursionStack[$nodeId] = false;
        return false;
    }

    public function getNextNode(array $flow, string $currentNodeId): ?string
    {
        $edges = $flow['edges'] ?? [];

        foreach ($edges as $edge) {
            if ($edge['source'] === $currentNodeId) {
                return $edge['target'];
            }
        }

        return null;
    }
}
