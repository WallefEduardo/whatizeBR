<?php

namespace App\Http\Controllers;

use App\Models\NotificationPreference;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Get unread notifications count.
     */
    public function unreadCount(Request $request)
    {
        $count = $request->user()
            ->unreadNotifications()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->unreadNotifications()
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Get notification preferences for the authenticated user.
     */
    public function getPreferences(Request $request)
    {
        $preferences = NotificationPreference::forUser($request->user()->id);

        return response()->json($preferences);
    }

    /**
     * Update notification preferences.
     */
    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'new_message_enabled' => 'boolean',
            'conversation_assigned_enabled' => 'boolean',
            'sound_enabled' => 'boolean',
            'desktop_enabled' => 'boolean',
            'email_enabled' => 'boolean',
            'sound_file' => 'nullable|string',
        ]);

        $preferences = NotificationPreference::forUser($request->user()->id);
        $preferences->update($validated);

        return response()->json([
            'success' => true,
            'preferences' => $preferences,
        ]);
    }
}
