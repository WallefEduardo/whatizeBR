import { Fragment } from 'react'

export interface Column<T> {
    key: string
    label: string
    width?: string
    render?: (item: T) => React.ReactNode
}

interface TableProps<T> {
    columns: Column<T>[]
    data: T[]
    keyExtractor: (item: T) => string
    emptyMessage?: string
}

export default function Table<T>({ columns, data, keyExtractor, emptyMessage = 'Nenhum registro encontrado' }: TableProps<T>) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-900/50 border-b border-dark-200 dark:border-dark-700">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider"
                                style={{ width: column.width }}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-12 text-center text-sm text-dark-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className="hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={`${keyExtractor(item)}-${column.key}`}
                                        className="px-6 py-4 whitespace-nowrap text-sm"
                                    >
                                        {column.render ? column.render(item) : (item as any)[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
