<?php

namespace App\Helpers;

use App\Models\ActivityLog;

class ActivityLogHelper
{
    /**
     * Create a new activity log entry
     *
     * @param int $userId User ID who performed the action
     * @param string $title Short title (max 100 chars)
     * @param string $message Detailed message
     * @param string $icon Icon name (optional)
     * @param string $statusColor Status color (optional)
     * @return ActivityLog
     */
    public static function create($userId, $title, $message, $icon = 'info', $statusColor = 'primary')
    {
        return ActivityLog::create([
            'user_id' => $userId,
            'title' => substr($title, 0, 100),
            'message' => $message,
            'icon' => $icon,
            'status_color' => $statusColor,
        ]);
    }
}

/**
 * Helper function for activity logs
 */
if (!function_exists('activity_log')) {
    function activity_log($userId, $title, $message, $icon = 'info', $statusColor = 'primary')
    {
        return ActivityLogHelper::create($userId, $title, $message, $icon, $statusColor);
    }
}
