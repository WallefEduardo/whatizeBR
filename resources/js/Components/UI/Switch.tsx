import { Switch as HeadlessSwitch } from '@headlessui/react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export default function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
    return (
        <HeadlessSwitch.Group>
            <div className={cn('flex items-center gap-3', className)}>
                <HeadlessSwitch
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        checked ? 'bg-primary' : 'bg-gray-200',
                        disabled && 'cursor-not-allowed opacity-50'
                    )}
                >
                    <span
                        className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            checked ? 'translate-x-6' : 'translate-x-1'
                        )}
                    />
                </HeadlessSwitch>
                {label && (
                    <HeadlessSwitch.Label className="text-sm font-medium text-gray-700 cursor-pointer">
                        {label}
                    </HeadlessSwitch.Label>
                )}
            </div>
        </HeadlessSwitch.Group>
    );
}
