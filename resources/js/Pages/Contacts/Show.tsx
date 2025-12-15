import { router } from '@inertiajs/react'
import { ArrowLeft, Edit, Mail, Phone, Calendar, MessageSquare, Clock, Tag as TagIcon, FileText } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import Button from '@/Components/UI/Button'
import Badge from '@/Components/UI/Badge'

interface Tag {
    id: string
    name: string
    color: string
}

interface Message {
    id: string
    content: string
    type: string
    direction: 'inbound' | 'outbound'
    created_at: string
}

interface Contact {
    id: string
    name: string | null
    phone: string
    email: string | null
    avatar_url: string | null
    notes: string | null
    is_blocked: boolean
    last_interaction_at: string | null
    created_at: string
    tags: Tag[]
    instance: {
        id: string
        name: string
    }
    custom_fields: Record<string, any>
}

interface Props {
    contact: Contact
}

export default function ContactsShow({ contact }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getInitials = (name: string | null, phone: string) => {
        const text = name || phone
        return text.substring(0, 2).toUpperCase()
    }

    return (
        <AppLayout title={contact.name || contact.phone}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/contacts')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Contatos
                    </Button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                                {contact.avatar_url ? (
                                    <img
                                        src={contact.avatar_url}
                                        alt={contact.name || contact.phone}
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-primary-600 dark:text-primary-400 font-bold text-2xl">
                                        {getInitials(contact.name, contact.phone)}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                                        {contact.name || 'Sem nome'}
                                    </h1>
                                    <Badge variant={contact.is_blocked ? 'danger' : 'success'}>
                                        {contact.is_blocked ? 'Bloqueado' : 'Ativo'}
                                    </Badge>
                                </div>
                                <p className="text-dark-500 flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {contact.phone}
                                </p>
                                {contact.email && (
                                    <p className="text-dark-500 flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4" />
                                        {contact.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => router.visit(`/contacts/${contact.id}/edit`)}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Info Card */}
                        <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                                Informações
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-dark-500 mb-1">Instância</p>
                                    <p className="text-sm text-dark-900 dark:text-dark-50 font-medium">
                                        {contact.instance.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-dark-500 mb-1">Criado em</p>
                                    <div className="flex items-center gap-2 text-sm text-dark-900 dark:text-dark-50">
                                        <Calendar className="w-4 h-4 text-dark-400" />
                                        {formatDate(contact.created_at)}
                                    </div>
                                </div>

                                {contact.last_interaction_at && (
                                    <div>
                                        <p className="text-xs text-dark-500 mb-1">Última interação</p>
                                        <div className="flex items-center gap-2 text-sm text-dark-900 dark:text-dark-50">
                                            <Clock className="w-4 h-4 text-dark-400" />
                                            {formatDate(contact.last_interaction_at)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tags Card */}
                        {contact.tags.length > 0 && (
                            <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TagIcon className="w-5 h-5 text-dark-500" />
                                    <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                        Tags
                                    </h2>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {contact.tags.map(tag => (
                                        <Badge
                                            key={tag.id}
                                            variant="default"
                                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes Card */}
                        {contact.notes && (
                            <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-5 h-5 text-dark-500" />
                                    <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                        Observações
                                    </h2>
                                </div>

                                <p className="text-sm text-dark-600 dark:text-dark-400 whitespace-pre-wrap">
                                    {contact.notes}
                                </p>
                            </div>
                        )}

                        {/* Custom Fields Card */}
                        {Object.keys(contact.custom_fields).length > 0 && (
                            <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                                <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                                    Campos Personalizados
                                </h2>

                                <div className="space-y-3">
                                    {Object.entries(contact.custom_fields).map(([key, value]) => (
                                        <div key={key}>
                                            <p className="text-xs text-dark-500 mb-1">{key}</p>
                                            <p className="text-sm text-dark-900 dark:text-dark-50">
                                                {String(value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Activity */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <MessageSquare className="w-5 h-5 text-dark-500" />
                                <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                                    Histórico de Conversas
                                </h2>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-dark-50 dark:bg-dark-900 rounded p-4">
                                    <p className="text-xs text-dark-500 mb-1">Total de Mensagens</p>
                                    <p className="text-2xl font-bold text-dark-900 dark:text-dark-50">0</p>
                                </div>
                                <div className="bg-dark-50 dark:bg-dark-900 rounded p-4">
                                    <p className="text-xs text-dark-500 mb-1">Conversas</p>
                                    <p className="text-2xl font-bold text-primary-600">0</p>
                                </div>
                                <div className="bg-dark-50 dark:bg-dark-900 rounded p-4">
                                    <p className="text-xs text-dark-500 mb-1">Tempo Médio</p>
                                    <p className="text-2xl font-bold text-blue-600">-</p>
                                </div>
                            </div>

                            {/* Recent Messages */}
                            <div>
                                <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-4">
                                    Mensagens Recentes
                                </h3>

                                <div className="space-y-3">
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-12 h-12 text-dark-300 mx-auto mb-3" />
                                        <p className="text-sm text-dark-500">
                                            Nenhuma mensagem ainda
                                        </p>
                                        <p className="text-xs text-dark-400 mt-1">
                                            As mensagens trocadas com este contato aparecerão aqui
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-700">
                                <Button
                                    variant="primary"
                                    onClick={() => router.visit(`/chat?contact=${contact.id}`)}
                                    className="w-full"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Iniciar Conversa
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
