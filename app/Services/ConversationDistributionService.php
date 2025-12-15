<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Member;

class ConversationDistributionService
{
    /**
     * Auto-assign conversation to the most available member
     *
     * @param Conversation $conversation
     * @param int|null $departmentId
     * @param int|null $instanceId
     * @return Member|null
     */
    public function autoAssign(Conversation $conversation, ?int $departmentId = null, ?int $instanceId = null): ?Member
    {
        $query = Member::active();

        // Filter by instance if provided
        if ($instanceId) {
            $query->forInstance($instanceId);
        }

        // Filter by department if provided
        if ($departmentId) {
            $query->inDepartment($departmentId);
        }

        // Get all eligible members with their active conversations count
        $members = $query->with('activeConversations')->get();

        // Filter members who can receive new conversations
        $availableMembers = $members->filter(function ($member) {
            return $member->canReceiveConversation();
        });

        if ($availableMembers->isEmpty()) {
            return null;
        }

        // Sort by active conversations count (ascending) to get the least busy member
        $selectedMember = $availableMembers->sortBy(function ($member) {
            return $member->activeConversations()->count();
        })->first();

        // Assign the conversation
        if ($selectedMember) {
            $conversation->assignTo($selectedMember->user_id);
        }

        return $selectedMember;
    }

    /**
     * Redistribute conversations when a member becomes unavailable
     *
     * @param Member $member
     * @return int Number of redistributed conversations
     */
    public function redistributeMemberConversations(Member $member): int
    {
        $activeConversations = $member->activeConversations()->get();

        if ($activeConversations->isEmpty()) {
            return 0;
        }

        $redistributed = 0;

        foreach ($activeConversations as $conversation) {
            $newMember = $this->autoAssign(
                $conversation,
                $member->department_id,
                $member->instance_id
            );

            if ($newMember) {
                $redistributed++;
            } else {
                // If no member available, unassign the conversation
                $conversation->assignTo(null);
            }
        }

        return $redistributed;
    }

    /**
     * Balance conversations across all active members in a department
     *
     * @param int $departmentId
     * @param int|null $instanceId
     * @return array Statistics about the balancing operation
     */
    public function balanceDepartment(int $departmentId, ?int $instanceId = null): array
    {
        $query = Member::active()->inDepartment($departmentId);

        if ($instanceId) {
            $query->forInstance($instanceId);
        }

        $members = $query->with('activeConversations')->get();

        if ($members->count() < 2) {
            return [
                'balanced' => false,
                'reason' => 'Not enough active members to balance',
            ];
        }

        // Calculate average conversations per member
        $totalConversations = $members->sum(function ($member) {
            return $member->activeConversations()->count();
        });

        $averagePerMember = $totalConversations / $members->count();

        $moved = 0;

        // Get overloaded members (above average)
        $overloadedMembers = $members->filter(function ($member) use ($averagePerMember) {
            return $member->activeConversations()->count() > $averagePerMember;
        });

        foreach ($overloadedMembers as $overloadedMember) {
            $currentCount = $overloadedMember->activeConversations()->count();
            $toMove = (int) ceil($currentCount - $averagePerMember);

            $conversations = $overloadedMember->activeConversations()
                ->orderBy('last_message_at', 'asc')
                ->limit($toMove)
                ->get();

            foreach ($conversations as $conversation) {
                $newMember = $this->autoAssign(
                    $conversation,
                    $departmentId,
                    $instanceId
                );

                if ($newMember && $newMember->id !== $overloadedMember->id) {
                    $moved++;
                }
            }
        }

        return [
            'balanced' => true,
            'members_count' => $members->count(),
            'total_conversations' => $totalConversations,
            'average_per_member' => round($averagePerMember, 2),
            'conversations_moved' => $moved,
        ];
    }

    /**
     * Get distribution statistics for a department or instance
     *
     * @param int|null $departmentId
     * @param int|null $instanceId
     * @return array
     */
    public function getDistributionStats(?int $departmentId = null, ?int $instanceId = null): array
    {
        $query = Member::active();

        if ($departmentId) {
            $query->inDepartment($departmentId);
        }

        if ($instanceId) {
            $query->forInstance($instanceId);
        }

        $members = $query->with('activeConversations')->get();

        $stats = $members->map(function ($member) {
            return [
                'member_id' => $member->id,
                'user_name' => $member->user->name,
                'department' => $member->department?->name,
                'active_conversations' => $member->activeConversations()->count(),
                'max_concurrent_chats' => $member->max_concurrent_chats,
                'available_slots' => $member->available_slots,
                'utilization_rate' => $member->max_concurrent_chats > 0
                    ? round(($member->activeConversations()->count() / $member->max_concurrent_chats) * 100, 2)
                    : 0,
            ];
        });

        return [
            'members' => $stats,
            'total_members' => $members->count(),
            'total_capacity' => $members->sum('max_concurrent_chats'),
            'total_active_conversations' => $members->sum(function ($member) {
                return $member->activeConversations()->count();
            }),
            'total_available_slots' => $members->sum('available_slots'),
        ];
    }
}
