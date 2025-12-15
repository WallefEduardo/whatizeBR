import { Link } from '@inertiajs/react'
import { Wifi, Tag, FileText, User, Info, Users, Building2 } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'

interface SettingsCategory {
    title: string
    items: {
        name: string
        href: string
        icon: React.ComponentType<{ className?: string }>
    }[]
}

const settingsCategories: SettingsCategory[] = [
    {
        title: 'CATEGORIAS',
        items: [
            { name: 'Conexão', href: '/connections', icon: Wifi },
            { name: 'Etiquetas', href: '/tags', icon: Tag },
            { name: 'Campos personalizados', href: '/custom-fields', icon: FileText },
            { name: 'Informações', href: '/settings/info', icon: Info },
            { name: 'Membros', href: '/members', icon: Users },
            { name: 'Departamentos', href: '/departments', icon: Building2 },
        ]
    },
    {
        title: 'PERSONALIZAR',
        items: [
            { name: 'Minha Conta', href: '/profile', icon: User },
        ]
    }
]

export default function SettingsIndex() {
    const currentPath = window.location.pathname

    return (
        <AppLayout title="Configurações">
            <div className="flex h-full">
                {/* Sidebar de Configurações */}
                <aside className="w-80 bg-white dark:bg-dark-800 border-r border-dark-200 dark:border-dark-700 overflow-y-auto">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                            Configurações
                        </h1>
                    </div>

                    <nav className="px-3 pb-4">
                        {settingsCategories.map((category, idx) => (
                            <div key={idx} className="mb-6">
                                <h2 className="px-3 mb-2 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                                    {category.title}
                                </h2>
                                <div className="space-y-1">
                                    {category.items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = currentPath === item.href

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                    isActive
                                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                                        : 'text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700/50'
                                                }`}
                                            >
                                                <Icon className="w-5 h-5 text-dark-400" />
                                                {item.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Conteúdo Principal */}
                <main className="flex-1 overflow-y-auto bg-dark-50 dark:bg-dark-900">
                    <div className="p-8">
                        <div className="max-w-4xl">
                            <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-dark-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-2">
                                    Selecione uma categoria
                                </h2>
                                <p className="text-dark-500">
                                    Escolha uma opção no menu lateral para começar
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AppLayout>
    )
}
