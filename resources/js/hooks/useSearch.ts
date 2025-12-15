import { useState, useCallback } from 'react'
import axios from 'axios'

export interface SearchFilters {
    field: string
    value: any
    condition?: string
}

export interface SearchOptions {
    query: string
    types?: ('messages' | 'contacts' | 'conversations')[]
    instanceId?: string
    filters?: SearchFilters[]
    filterOperator?: 'AND' | 'OR'
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
    page?: number
    perPage?: number
}

export interface SearchResults {
    messages?: any[]
    contacts?: any[]
    conversations?: any[]
    total: number
}

export function useSearch() {
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<SearchResults>({
        messages: [],
        contacts: [],
        conversations: [],
        total: 0,
    })
    const [error, setError] = useState<string | null>(null)

    const searchGlobal = useCallback(async (options: SearchOptions) => {
        if (!options.query || options.query.length < 2) {
            setResults({ messages: [], contacts: [], conversations: [], total: 0 })
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            params.append('query', options.query)

            if (options.instanceId) {
                params.append('instance_id', options.instanceId)
            }

            if (options.types && options.types.length > 0) {
                options.types.forEach(type => params.append('types[]', type))
            }

            if (options.perPage) {
                params.append('limit', options.perPage.toString())
            }

            const response = await axios.get(`/search/global?${params.toString()}`)

            setResults({
                messages: response.data.results.messages || [],
                contacts: response.data.results.contacts || [],
                conversations: response.data.results.conversations || [],
                total: response.data.total || 0,
            })
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar')
            console.error('Search error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const searchMessages = useCallback(async (options: SearchOptions) => {
        if (!options.query || options.query.length < 2) {
            return { data: [], total: 0 }
        }

        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            params.append('query', options.query)

            if (options.instanceId) {
                params.append('instance_id', options.instanceId)
            }

            if (options.filters && options.filters.length > 0) {
                options.filters.forEach((filter, index) => {
                    params.append(`filters[${index}][field]`, filter.field)
                    params.append(`filters[${index}][value]`, filter.value)
                    if (filter.condition) {
                        params.append(`filters[${index}][condition]`, filter.condition)
                    }
                })
            }

            if (options.filterOperator) {
                params.append('filter_operator', options.filterOperator)
            }

            if (options.sortBy) {
                params.append('sort_by', options.sortBy)
            }

            if (options.sortDirection) {
                params.append('sort_direction', options.sortDirection)
            }

            if (options.page) {
                params.append('page', options.page.toString())
            }

            if (options.perPage) {
                params.append('per_page', options.perPage.toString())
            }

            const response = await axios.get(`/search/messages?${params.toString()}`)
            return response.data
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar mensagens')
            console.error('Search messages error:', err)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const searchContacts = useCallback(async (options: SearchOptions) => {
        if (!options.query || options.query.length < 2) {
            return { data: [], total: 0 }
        }

        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            params.append('query', options.query)

            if (options.instanceId) {
                params.append('instance_id', options.instanceId)
            }

            if (options.sortBy) {
                params.append('sort_by', options.sortBy)
            }

            if (options.sortDirection) {
                params.append('sort_direction', options.sortDirection)
            }

            if (options.page) {
                params.append('page', options.page.toString())
            }

            if (options.perPage) {
                params.append('per_page', options.perPage.toString())
            }

            const response = await axios.get(`/search/contacts?${params.toString()}`)
            return response.data
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar contatos')
            console.error('Search contacts error:', err)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const searchConversations = useCallback(async (options: SearchOptions) => {
        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()

            if (options.query) {
                params.append('query', options.query)
            }

            if (options.instanceId) {
                params.append('instance_id', options.instanceId)
            }

            if (options.sortBy) {
                params.append('sort_by', options.sortBy)
            }

            if (options.sortDirection) {
                params.append('sort_direction', options.sortDirection)
            }

            if (options.page) {
                params.append('page', options.page.toString())
            }

            if (options.perPage) {
                params.append('per_page', options.perPage.toString())
            }

            const response = await axios.get(`/search/conversations?${params.toString()}`)
            return response.data
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar conversas')
            console.error('Search conversations error:', err)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const clearResults = useCallback(() => {
        setResults({ messages: [], contacts: [], conversations: [], total: 0 })
        setError(null)
    }, [])

    return {
        isLoading,
        results,
        error,
        searchGlobal,
        searchMessages,
        searchContacts,
        searchConversations,
        clearResults,
    }
}
