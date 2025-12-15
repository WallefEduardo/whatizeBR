import AppLayout from '@/Layouts/AppLayout';

export default function Dashboard() {
    return (
        <AppLayout
            title="Dashboard"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' }
            ]}
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Cards de estatísticas virão aqui */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Conversas</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">0</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversas Abertas</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">0</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Mensagens Hoje</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">0</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instâncias Ativas</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">0</p>
                </div>
            </div>
        </AppLayout>
    );
}
