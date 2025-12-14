import { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '../UI/Badge';

export interface MultiSelectOption {
    value: string | number;
    label: string;
}

export interface MultiSelectProps {
    label?: string;
    error?: string;
    options: MultiSelectOption[];
    value?: (string | number)[];
    onChange?: (value: (string | number)[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export default function MultiSelect({
    label,
    error,
    options,
    value = [],
    onChange,
    placeholder = 'Selecione...',
    disabled,
    className,
}: MultiSelectProps) {
    const [query, setQuery] = useState('');

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    const filteredOptions =
        query === ''
            ? options
            : options.filter((option) =>
                option.label
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .includes(
                        query
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                    )
            );

    const handleSelect = (selectedValues: (string | number)[]) => {
        onChange?.(selectedValues);
    };

    const removeOption = (optionValue: string | number) => {
        onChange?.(value.filter(v => v !== optionValue));
    };

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            {/* Selected badges */}
            {selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedOptions.map((option) => (
                        <Badge key={option.value} variant="primary" className="flex items-center gap-1 pr-1">
                            {option.label}
                            <button
                                type="button"
                                onClick={() => removeOption(option.value)}
                                className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                                disabled={disabled}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <Combobox value={value} onChange={handleSelect} disabled={disabled} multiple>
                <div className="relative">
                    <div className={cn(
                        'relative w-full cursor-default overflow-hidden rounded border border-gray-300 bg-white text-left focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent',
                        error && 'border-red-500 focus-within:ring-red-500',
                        disabled && 'bg-gray-50 opacity-50'
                    )}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <Combobox.Input
                            className="w-full border-none py-2 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:outline-none focus:ring-0"
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={selectedOptions.length === 0 ? placeholder : ''}
                            displayValue={() => ''}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </Combobox.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredOptions.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    Nenhum resultado encontrado.
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <Combobox.Option
                                        key={option.value}
                                        className={({ active }) =>
                                            cn(
                                                'relative cursor-pointer select-none py-2 pl-10 pr-4',
                                                active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                                            )
                                        }
                                        value={option.value}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}>
                                                    {option.label}
                                                </span>
                                                {selected ? (
                                                    <span className={cn(
                                                        'absolute inset-y-0 left-0 flex items-center pl-3',
                                                        active ? 'text-primary' : 'text-primary'
                                                    )}>
                                                        <Check className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
