import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                'p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors',
                className
            )}
            aria-label="Alternar tema"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5" style={{ color: '#737373' }} />
            ) : (
                <Moon className="w-5 h-5" style={{ color: '#737373' }} />
            )}
        </button>
    );
}
