export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface WhatsAppInstance {
    id: string;
    name: string;
    phone: string | null;
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export interface Setting {
    id: string;
    instance_id: string | null;
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'json';
    created_at: string;
    updated_at: string;
}

export interface BusinessHours {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
}

export interface SettingsData {
    // General
    company_name?: Setting;
    company_logo?: Setting;
    timezone?: Setting;

    // Business Hours
    business_hours_enabled?: Setting;
    business_hours?: Setting;

    // Messages
    welcome_message?: Setting;
    away_message?: Setting;
    queue_message?: Setting;

    // Attendance
    auto_assign_enabled?: Setting;
    max_concurrent_chats?: Setting;
    auto_close_inactive_chats?: Setting;
    auto_close_inactive_hours?: Setting;

    // Webhooks
    webhook_url?: Setting;
    webhook_enabled?: Setting;
    webhook_events?: Setting;

    // Notifications
    notifications_enabled?: Setting;
    notification_sound_enabled?: Setting;
    notification_desktop_enabled?: Setting;

    // API Config
    api_rate_limit?: Setting;
    api_timeout?: Setting;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
