import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Building2,
    Tag,
    Calendar,
    Settings,
    ChevronLeft,
    ChevronRight,
    Send,
    Bot
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    className?: string;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[];
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contatos', href: '/contacts', icon: Users },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Chatbots', href: '/chatbots', icon: Bot },
    { name: 'Agendamentos', href: '/schedules', icon: Calendar },
    { name: 'Transmissões', href: '/broadcasts', icon: Send },
    { name: 'Configurações', href: '/settings', icon: Settings, roles: ['admin'] },
];

export default function Sidebar({ className }: SidebarProps) {
    const { url, props } = usePage();
    const [collapsed, setCollapsed] = useState(false);
    const user = props.auth?.user as any;

    const canViewItem = (item: NavItem) => {
        if (!item.roles) return true;
        return item.roles.includes(user?.role);
    };

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
                collapsed ? 'w-16' : 'w-64',
                className
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-50">
                            Whatize
                        </span>
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.filter(canViewItem).map((item) => {
                    const Icon = item.icon;
                    const isActive = url.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center px-3 py-2 text-sm font-medium rounded transition-colors',
                                isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                                collapsed && 'justify-center'
                            )}
                            title={collapsed ? item.name : undefined}
                        >
                            <Icon className={cn('w-5 h-5', collapsed ? '' : 'mr-3')} style={{ color: '#737373' }} />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info */}
            {!collapsed && user && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                                {user.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.role}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
