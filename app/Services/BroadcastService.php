<?php

namespace App\Services;

use App\Models\Contact;
use Illuminate\Support\Collection;

class BroadcastService
{
    /**
     * Get filtered contacts based on broadcast filters
     */
    public function getFilteredContacts(string $instanceId, ?array $filters = null): Collection
    {
        $query = Contact::where('instance_id', $instanceId);

        if (!$filters) {
            return $query->get();
        }

        // Filter by tags
        if (!empty($filters['tags'])) {
            $query->whereHas('tags', function ($q) use ($filters) {
                $q->whereIn('tags.id', $filters['tags']);
            });
        }

        // Filter by departments
        if (!empty($filters['departments'])) {
            $query->whereIn('department_id', $filters['departments']);
        }

        // Exclude blocked contacts
        if ($filters['exclude_blocked'] ?? true) {
            $query->where('is_blocked', false);
        }

        // Exclude contacts without phone
        $query->whereNotNull('phone');

        return $query->get();
    }

    /**
     * Get recipient count without loading all contacts
     */
    public function getRecipientCount(string $instanceId, ?array $filters = null): int
    {
        $query = Contact::where('instance_id', $instanceId);

        if (!$filters) {
            return $query->count();
        }

        // Filter by tags
        if (!empty($filters['tags'])) {
            $query->whereHas('tags', function ($q) use ($filters) {
                $q->whereIn('tags.id', $filters['tags']);
            });
        }

        // Filter by departments
        if (!empty($filters['departments'])) {
            $query->whereIn('department_id', $filters['departments']);
        }

        // Exclude blocked contacts
        if ($filters['exclude_blocked'] ?? true) {
            $query->where('is_blocked', false);
        }

        // Exclude contacts without phone
        $query->whereNotNull('phone');

        return $query->count();
    }

    /**
     * Validate filters structure
     */
    public function validateFilters(?array $filters): bool
    {
        if (!$filters) {
            return true;
        }

        // Check if tags is array (if present)
        if (isset($filters['tags']) && !is_array($filters['tags'])) {
            return false;
        }

        // Check if departments is array (if present)
        if (isset($filters['departments']) && !is_array($filters['departments'])) {
            return false;
        }

        // Check if exclude_blocked is boolean (if present)
        if (isset($filters['exclude_blocked']) && !is_bool($filters['exclude_blocked'])) {
            return false;
        }

        return true;
    }
}
