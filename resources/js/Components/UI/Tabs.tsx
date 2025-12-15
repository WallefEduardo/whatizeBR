import { ReactNode, createContext, useContext, useState } from 'react'
import { cn } from '@/Lib/utils'

interface TabsContextType {
    activeTab: string
    setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

function useTabsContext() {
    const context = useContext(TabsContext)
    if (!context) {
        throw new Error('Tabs components must be used within Tabs')
    }
    return context
}

interface TabsProps {
    defaultValue: string
    children: ReactNode
    className?: string
    onChange?: (value: string) => void
}

export default function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultValue)

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        onChange?.(value)
    }

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
            <div className={cn('w-full', className)}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

interface TabsListProps {
    children: ReactNode
    className?: string
}

function TabsList({ children, className }: TabsListProps) {
    return (
        <div className={cn(
            'inline-flex h-10 items-center justify-start gap-1 rounded bg-dark-100 dark:bg-dark-900 p-1 text-dark-500',
            className
        )}>
            {children}
        </div>
    )
}

interface TabsTriggerProps {
    value: string
    children: ReactNode
    className?: string
    disabled?: boolean
}

function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
    const { activeTab, setActiveTab } = useTabsContext()
    const isActive = activeTab === value

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => setActiveTab(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded px-4 py-2 text-sm font-medium',
                'transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                isActive
                    ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 shadow-sm'
                    : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300',
                className
            )}
        >
            {children}
        </button>
    )
}

interface TabsContentProps {
    value: string
    children: ReactNode
    className?: string
}

function TabsContent({ value, children, className }: TabsContentProps) {
    const { activeTab } = useTabsContext()

    if (activeTab !== value) {
        return null
    }

    return (
        <div className={cn('mt-4', className)}>
            {children}
        </div>
    )
}

Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Content = TabsContent
