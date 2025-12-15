<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get total conversations by period
     */
    public function getTotalConversations(string $instanceId, string $period = 'today'): array
    {
        $cacheKey = "analytics:conversations:{$instanceId}:{$period}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($instanceId, $period) {
            $query = Conversation::where('instance_id', $instanceId);

            [$start, $end] = $this->getPeriodDates($period);
            $query->whereBetween('created_at', [$start, $end]);

            $total = $query->count();
            $open = (clone $query)->where('status', 'open')->count();
            $pending = (clone $query)->where('status', 'pending')->count();
            $closed = (clone $query)->where('status', 'closed')->count();

            return [
                'total' => $total,
                'open' => $open,
                'pending' => $pending,
                'closed' => $closed,
                'period' => $period,
            ];
        });
    }

    /**
     * Get response rate (% of conversations with at least one agent response)
     */
    public function getResponseRate(string $instanceId, string $period = 'today'): array
    {
        $cacheKey = "analytics:response_rate:{$instanceId}:{$period}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($instanceId, $period) {
            [$start, $end] = $this->getPeriodDates($period);

            $totalConversations = Conversation::where('instance_id', $instanceId)
                ->whereBetween('created_at', [$start, $end])
                ->count();

            if ($totalConversations === 0) {
                return [
                    'rate' => 0,
                    'total_conversations' => 0,
                    'responded_conversations' => 0,
                ];
            }

            // Conversations that have at least one outbound message
            $respondedConversations = Conversation::where('instance_id', $instanceId)
                ->whereBetween('created_at', [$start, $end])
                ->whereHas('messages', function ($query) {
                    $query->where('direction', 'outbound');
                })
                ->count();

            $rate = round(($respondedConversations / $totalConversations) * 100, 2);

            return [
                'rate' => $rate,
                'total_conversations' => $totalConversations,
                'responded_conversations' => $respondedConversations,
            ];
        });
    }

    /**
     * Get average first response time (in seconds)
     */
    public function getAverageFirstResponseTime(string $instanceId, string $period = 'today'): array
    {
        $cacheKey = "analytics:first_response:{$instanceId}:{$period}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($instanceId, $period) {
            [$start, $end] = $this->getPeriodDates($period);

            $conversations = Conversation::where('instance_id', $instanceId)
                ->whereBetween('created_at', [$start, $end])
                ->with(['messages' => function ($query) {
                    $query->orderBy('created_at', 'asc');
                }])
                ->get();

            $responseTimes = [];

            foreach ($conversations as $conversation) {
                $firstInbound = $conversation->messages->where('direction', 'inbound')->first();
                $firstOutbound = $conversation->messages->where('direction', 'outbound')->first();

                if ($firstInbound && $firstOutbound && $firstOutbound->created_at > $firstInbound->created_at) {
                    $responseTimes[] = $firstOutbound->created_at->diffInSeconds($firstInbound->created_at);
                }
            }

            if (empty($responseTimes)) {
                return [
                    'average_seconds' => 0,
                    'average_minutes' => 0,
                    'average_formatted' => '0s',
                    'sample_size' => 0,
                ];
            }

            $averageSeconds = round(array_sum($responseTimes) / count($responseTimes));
            $averageMinutes = round($averageSeconds / 60, 2);

            return [
                'average_seconds' => $averageSeconds,
                'average_minutes' => $averageMinutes,
                'average_formatted' => $this->formatSeconds($averageSeconds),
                'sample_size' => count($responseTimes),
            ];
        });
    }

    /**
     * Get average resolution time (time to close conversation)
     */
    public function getAverageResolutionTime(string $instanceId, string $period = 'today'): array
    {
        $cacheKey = "analytics:resolution_time:{$instanceId}:{$period}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($instanceId, $period) {
            [$start, $end] = $this->getPeriodDates($period);

            $closedConversations = Conversation::where('instance_id', $instanceId)
                ->where('status', 'closed')
                ->whereBetween('created_at', [$start, $end])
                ->whereNotNull('closed_at')
                ->get();

            if ($closedConversations->isEmpty()) {
                return [
                    'average_seconds' => 0,
                    'average_minutes' => 0,
                    'average_hours' => 0,
                    'average_formatted' => '0s',
                    'sample_size' => 0,
                ];
            }

            $resolutionTimes = $closedConversations->map(function ($conversation) {
                return $conversation->closed_at->diffInSeconds($conversation->created_at);
            });

            $averageSeconds = round($resolutionTimes->avg());
            $averageMinutes = round($averageSeconds / 60, 2);
            $averageHours = round($averageSeconds / 3600, 2);

            return [
                'average_seconds' => $averageSeconds,
                'average_minutes' => $averageMinutes,
                'average_hours' => $averageHours,
                'average_formatted' => $this->formatSeconds($averageSeconds),
                'sample_size' => $closedConversations->count(),
            ];
        });
    }

    /**
     * Get conversations by agent
     */
    public function getConversationsByAgent(string $instanceId, string $period = 'today'): array
    {
        $cacheKey = "analytics:by_agent:{$instanceId}:{$period}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($instanceId, $period) {
            [$start, $end] = $this->getPeriodDates($period);

            $stats = Conversation::where('instance_id', $instanceId)
                ->whereBetween('created_at', [$start, $end])
                ->whereNotNull('assigned_to')
                ->select('assigned_to', DB::raw('count(*) as total'))
                ->groupBy('assigned_to')
                ->with('assignedAgent:id,name,email')
                ->get()
                ->map(function ($item) {
                    return [
                        'agent_id' => $item->assigned_to,
                        'agent_name' => $item->assignedAgent->name ?? 'Desconhecido',
                        'agent_email' => $item->assignedAgent->email ?? null,
                        'total_conversations' => $item->total,
                    ];
                })
                ->sortByDesc('total_conversations')
                ->values()
                ->toArray();

            return $stats;
        });
    }

    /**
     * Get conversations by department
     */
    public function getConversationsByDepartment(string $instanceId, string $period = 'today'): array
    {
        $cacheKey = "analytics:by_department:{$instanceId}:{$period}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($instanceId, $period) {
            [$start, $end] = $this->getPeriodDates($period);

            $stats = Conversation::where('instance_id', $instanceId)
                ->whereBetween('created_at', [$start, $end])
                ->whereNotNull('department_id')
                ->select('department_id', DB::raw('count(*) as total'))
                ->groupBy('department_id')
                ->with('department:id,name,color')
                ->get()
                ->map(function ($item) {
                    return [
                        'department_id' => $item->department_id,
                        'department_name' => $item->department->name ?? 'Desconhecido',
                        'department_color' => $item->department->color ?? '#6366f1',
                        'total_conversations' => $item->total,
                    ];
                })
                ->sortByDesc('total_conversations')
                ->values()
                ->toArray();

            // Add conversations without department
            $withoutDepartment = Conversation::where('instance_id', $instanceId)
                ->whereBetween('created_at', [$start, $end])
                ->whereNull('department_id')
                ->count();

            if ($withoutDepartment > 0) {
                $stats[] = [
                    'department_id' => null,
                    'department_name' => 'Sem Departamento',
                    'department_color' => '#gray-500',
                    'total_conversations' => $withoutDepartment,
                ];
            }

            return $stats;
        });
    }

    /**
     * Get peak hours (conversations by hour)
     */
    public function getPeakHours(string $instanceId, string $period = 'today'): array
    {
        $cacheKey = "analytics:peak_hours:{$instanceId}:{$period}";

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($instanceId, $period) {
            [$start, $end] = $this->getPeriodDates($period);

            $hourlyStats = Conversation::where('instance_id', $instanceId)
                ->whereBetween('created_at', [$start, $end])
                ->select(DB::raw('EXTRACT(HOUR FROM created_at) as hour'), DB::raw('count(*) as total'))
                ->groupBy('hour')
                ->orderBy('hour')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [(int)$item->hour => $item->total];
                })
                ->toArray();

            // Fill missing hours with 0
            $completeStats = [];
            for ($hour = 0; $hour < 24; $hour++) {
                $completeStats[$hour] = $hourlyStats[$hour] ?? 0;
            }

            // Find peak hour
            $peakHour = array_keys($completeStats, max($completeStats))[0] ?? 0;

            return [
                'hourly_distribution' => $completeStats,
                'peak_hour' => $peakHour,
                'peak_hour_count' => $completeStats[$peakHour],
            ];
        });
    }

    /**
     * Get messages sent vs received
     */
    public function getMessagesSentVsReceived(string $instanceId, string $period = 'today'): array
    {
        $cacheKey = "analytics:messages_direction:{$instanceId}:{$period}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($instanceId, $period) {
            [$start, $end] = $this->getPeriodDates($period);

            $outbound = Message::where('instance_id', $instanceId)
                ->where('direction', 'outbound')
                ->whereBetween('created_at', [$start, $end])
                ->count();

            $inbound = Message::where('instance_id', $instanceId)
                ->where('direction', 'inbound')
                ->whereBetween('created_at', [$start, $end])
                ->count();

            $total = $outbound + $inbound;

            return [
                'outbound' => $outbound,
                'inbound' => $inbound,
                'total' => $total,
                'outbound_percentage' => $total > 0 ? round(($outbound / $total) * 100, 2) : 0,
                'inbound_percentage' => $total > 0 ? round(($inbound / $total) * 100, 2) : 0,
            ];
        });
    }

    /**
     * Get all dashboard stats in one call
     */
    public function getDashboardStats(string $instanceId, string $period = 'today'): array
    {
        return [
            'conversations' => $this->getTotalConversations($instanceId, $period),
            'response_rate' => $this->getResponseRate($instanceId, $period),
            'first_response_time' => $this->getAverageFirstResponseTime($instanceId, $period),
            'resolution_time' => $this->getAverageResolutionTime($instanceId, $period),
            'by_agent' => $this->getConversationsByAgent($instanceId, $period),
            'by_department' => $this->getConversationsByDepartment($instanceId, $period),
            'peak_hours' => $this->getPeakHours($instanceId, $period),
            'messages' => $this->getMessagesSentVsReceived($instanceId, $period),
        ];
    }

    /**
     * Get conversations over time (for charts)
     */
    public function getConversationsOverTime(string $instanceId, string $period = 'today'): array
    {
        $cacheKey = "analytics:over_time:{$instanceId}:{$period}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($instanceId, $period) {
            [$start, $end] = $this->getPeriodDates($period);

            // Determine grouping (hourly for today, daily for longer periods)
            $groupFormat = $period === 'today' ? 'Y-m-d H:00:00' : 'Y-m-d';
            $dbFormat = $period === 'today'
                ? "DATE_TRUNC('hour', created_at)"
                : "DATE(created_at)";

            $stats = Conversation::where('instance_id', $instanceId)
                ->whereBetween('created_at', [$start, $end])
                ->select(
                    DB::raw("{$dbFormat} as period"),
                    DB::raw('count(*) as total'),
                    DB::raw("count(case when status = 'open' then 1 end) as open"),
                    DB::raw("count(case when status = 'closed' then 1 end) as closed")
                )
                ->groupBy('period')
                ->orderBy('period')
                ->get()
                ->map(function ($item) {
                    return [
                        'period' => $item->period,
                        'total' => $item->total,
                        'open' => $item->open,
                        'closed' => $item->closed,
                    ];
                })
                ->toArray();

            return $stats;
        });
    }

    /**
     * Clear analytics cache for instance
     */
    public function clearCache(string $instanceId): void
    {
        $patterns = [
            "analytics:conversations:{$instanceId}:*",
            "analytics:response_rate:{$instanceId}:*",
            "analytics:first_response:{$instanceId}:*",
            "analytics:resolution_time:{$instanceId}:*",
            "analytics:by_agent:{$instanceId}:*",
            "analytics:by_department:{$instanceId}:*",
            "analytics:peak_hours:{$instanceId}:*",
            "analytics:messages_direction:{$instanceId}:*",
            "analytics:over_time:{$instanceId}:*",
        ];

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }
    }

    /**
     * Get period date range
     */
    private function getPeriodDates(string $period): array
    {
        return match ($period) {
            'today' => [Carbon::today(), Carbon::tomorrow()],
            'yesterday' => [Carbon::yesterday(), Carbon::today()],
            'last_7_days' => [Carbon::now()->subDays(7), Carbon::now()],
            'last_30_days' => [Carbon::now()->subDays(30), Carbon::now()],
            'this_week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'this_month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'last_month' => [
                Carbon::now()->subMonth()->startOfMonth(),
                Carbon::now()->subMonth()->endOfMonth()
            ],
            default => [Carbon::today(), Carbon::tomorrow()],
        };
    }

    /**
     * Format seconds to human readable
     */
    private function formatSeconds(int $seconds): string
    {
        if ($seconds < 60) {
            return "{$seconds}s";
        }

        if ($seconds < 3600) {
            $minutes = floor($seconds / 60);
            $remainingSeconds = $seconds % 60;
            return "{$minutes}m {$remainingSeconds}s";
        }

        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        return "{$hours}h {$minutes}m";
    }
}
