import { useState, ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Navbar from '@/Components/Layout/Navbar';
import Breadcrumbs, { BreadcrumbItem } from '@/Components/Layout/Breadcrumbs';
import ThemeToggle from '@/Components/Layout/ThemeToggle';
import { useNotifications } from '@/Hooks/useNotifications';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, title, breadcrumbs = [] }: AppLayoutProps) {
    const { props } = usePage();
    const user = props.auth?.user as any;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Initialize notifications (desktop + audio)
    useNotifications({ enableRealtime: true });

    return (
        <>
            {title && <Head title={title} />}

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar />
                </div>

                {/* Sidebar - Mobile */}
                {mobileMenuOpen && (
                    <>
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        {/* Mobile Sidebar */}
                        <div className="lg:hidden">
                            <Sidebar className="z-50" />
                        </div>
                    </>
                )}

                {/* Navbar */}
                <Navbar
                    user={user}
                    onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    sidebarCollapsed={sidebarCollapsed}
                />

                {/* Main Content */}
                <main
                    className={cn(
                        'pt-16 transition-all duration-300',
                        'lg:ml-64' // Desktop: always with sidebar space
                    )}
                >
                    <div className="p-6">
                        {/* Breadcrumbs */}
                        {breadcrumbs.length > 0 && (
                            <div className="mb-6">
                                <Breadcrumbs items={breadcrumbs} />
                            </div>
                        )}

                        {/* Page Content */}
                        {children}
                    </div>
                </main>

                {/* Theme Toggle - Fixed Bottom Right */}
                <div className="fixed bottom-6 right-6 z-30">
                    <ThemeToggle />
                </div>
            </div>
        </>
    );
}
