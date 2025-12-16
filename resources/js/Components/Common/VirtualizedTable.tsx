import { FixedSizeList } from 'react-window'

interface Column<T> {
    key: string
    label: string
    width?: string
    render?: (item: T) => React.ReactNode
}

interface Props<T> {
    data: T[]
    columns: Column<T>[]
    keyExtractor: (item: T) => string
    rowHeight?: number
    containerHeight?: number
    emptyMessage?: string
    onRowClick?: (item: T) => void
}

export default function VirtualizedTable<T>({
    data,
    columns,
    keyExtractor,
    rowHeight = 64,
    containerHeight = 600,
    emptyMessage = 'Nenhum item encontrado',
    onRowClick,
}: Props<T>) {
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const item = data[index]

        return (
            <div
                style={style}
                onClick={() => onRowClick?.(item)}
                className={`flex items-center border-b border-dark-200 dark:border-dark-700 ${
                    onRowClick ? 'cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-700/50' : ''
                }`}
            >
                {columns.map((column) => (
                    <div
                        key={column.key}
                        className="px-4 py-3 overflow-hidden"
                        style={{ width: column.width || 'auto', flex: column.width ? undefined : 1 }}
                    >
                        {column.render ? column.render(item) : (item as any)[column.key]}
                    </div>
                ))}
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-dark-500 dark:text-dark-400">
                {emptyMessage}
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-800 rounded border border-dark-200 dark:border-dark-700">
            {/* Header */}
            <div className="flex items-center bg-dark-50 dark:bg-dark-900/50 border-b border-dark-200 dark:border-dark-700 font-medium text-sm text-dark-700 dark:text-dark-300">
                {columns.map((column) => (
                    <div
                        key={column.key}
                        className="px-4 py-3"
                        style={{ width: column.width || 'auto', flex: column.width ? undefined : 1 }}
                    >
                        {column.label}
                    </div>
                ))}
            </div>

            {/* Body - Virtualized */}
            <FixedSizeList
                height={Math.min(containerHeight, data.length * rowHeight)}
                itemCount={data.length}
                itemSize={rowHeight}
                width="100%"
            >
                {Row}
            </FixedSizeList>
        </div>
    )
}
