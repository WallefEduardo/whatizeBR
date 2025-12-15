<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get all dashboard statistics
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getDashboardStats($instanceId, $period);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'period' => $period,
        ]);
    }

    /**
     * Get conversations statistics
     */
    public function conversations(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getTotalConversations($instanceId, $period);

        return response()->json($stats);
    }

    /**
     * Get response rate
     */
    public function responseRate(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getResponseRate($instanceId, $period);

        return response()->json($stats);
    }

    /**
     * Get average first response time
     */
    public function firstResponseTime(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getAverageFirstResponseTime($instanceId, $period);

        return response()->json($stats);
    }

    /**
     * Get average resolution time
     */
    public function resolutionTime(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getAverageResolutionTime($instanceId, $period);

        return response()->json($stats);
    }

    /**
     * Get conversations by agent
     */
    public function byAgent(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getConversationsByAgent($instanceId, $period);

        return response()->json($stats);
    }

    /**
     * Get conversations by department
     */
    public function byDepartment(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getConversationsByDepartment($instanceId, $period);

        return response()->json($stats);
    }

    /**
     * Get peak hours
     */
    public function peakHours(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getPeakHours($instanceId, $period);

        return response()->json($stats);
    }

    /**
     * Get messages sent vs received
     */
    public function messages(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getMessagesSentVsReceived($instanceId, $period);

        return response()->json($stats);
    }

    /**
     * Get conversations over time (for charts)
     */
    public function overTime(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_week,this_month,last_month',
        ]);

        $period = $validated['period'] ?? 'today';
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $stats = $this->analyticsService->getConversationsOverTime($instanceId, $period);

        return response()->json($stats);
    }

    /**
     * Clear analytics cache
     */
    public function clearCache(Request $request)
    {
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $this->analyticsService->clearCache($instanceId);

        return response()->json([
            'message' => 'Cache limpo com sucesso',
        ]);
    }
}
