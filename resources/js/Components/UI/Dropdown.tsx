import { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface DropdownItem {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
}

export interface DropdownProps {
    trigger: ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
}

export default function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button as="div">{trigger}</Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className={cn(
                        'absolute z-10 mt-2 w-56 origin-top-right rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
                        align === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
                    )}
                >
                    <div className="py-1">
                        {items.map((item, index) => (
                            <Menu.Item key={index} disabled={item.disabled}>
                                {({ active }) => (
                                    <button
                                        onClick={item.onClick}
                                        disabled={item.disabled}
                                        className={cn(
                                            'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
                                            active && !item.disabled && 'bg-gray-50',
                                            item.variant === 'danger'
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-gray-700',
                                            item.disabled && 'cursor-not-allowed opacity-50'
                                        )}
                                    >
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        {item.label}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
