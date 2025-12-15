import { Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Bell, User, LogOut, Settings, Menu } from 'lucide-react';
import SearchBar from '@/Components/Common/SearchBar';
import SearchResultsModal from '@/Components/Common/SearchResultsModal';
import NotificationDropdown from '@/Components/Layout/NotificationDropdown';
import NotificationBadge from '@/Components/Layout/NotificationBadge';
import { useSearch } from '@/Hooks/useSearch';

interface NavbarProps {
    user: any;
    onMenuClick?: () => void;
    sidebarCollapsed?: boolean;
}

export default function Navbar({ user, onMenuClick, sidebarCollapsed = false }: NavbarProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const { isLoading, results, searchGlobal, clearResults } = useSearch();

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length >= 2) {
            await searchGlobal({ query });
            setShowSearchResults(true);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        clearResults();
        setShowSearchResults(false);
    };

    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-all duration-300',
                sidebarCollapsed ? 'left-16' : 'left-64'
            )}
        >
            <div className="flex items-center justify-between h-full px-4">
                {/* Left: Mobile Menu + Search */}
                <div className="flex items-center flex-1 space-x-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                    >
                        <Menu className="w-5 h-5" style={{ color: '#737373' }} />
                    </button>

                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <SearchBar
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            placeholder="Buscar em conversas, contatos e mensagens..."
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                {/* Right: Notifications + User Menu */}
                <div className="flex items-center space-x-2">
                    {/* Notifications */}
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        >
                            <Bell className="w-5 h-5" style={{ color: '#737373' }} />
                            <NotificationBadge />
                        </button>

                        <NotificationDropdown
                            show={showNotifications}
                            onClose={() => setShowNotifications(false)}
                        />
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {user?.role}
                                </p>
                            </div>
                        </button>

                        {/* User Dropdown */}
                        {showUserMenu && (
                            <div
                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                                style={{ borderRadius: '4px' }}
                            >
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {user?.email}
                                    </p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        href="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <User className="w-4 h-4 mr-3" style={{ color: '#737373' }} />
                                        Perfil
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Settings className="w-4 h-4 mr-3" style={{ color: '#737373' }} />
                                        Configurações
                                    </Link>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Sair
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Results Modal */}
            <SearchResultsModal
                isOpen={showSearchResults}
                onClose={() => setShowSearchResults(false)}
                query={searchQuery}
                results={results}
                isLoading={isLoading}
            />
        </header>
    );
}
