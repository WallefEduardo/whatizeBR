import { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    label?: string;
    error?: string;
    value?: number; // valor em centavos
    onChange?: (valueInCents: number) => void;
    currency?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, label, error, value = 0, onChange, currency = 'R$', id, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState('');
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        useEffect(() => {
            // Converte centavos para formato de exibição
            const formatted = formatCentsToDisplay(value);
            setDisplayValue(formatted);
        }, [value]);

        const formatCentsToDisplay = (cents: number): string => {
            const reais = cents / 100;
            return reais.toFixed(2).replace('.', ',');
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let inputValue = e.target.value;

            // Remove tudo que não é dígito
            const digitsOnly = inputValue.replace(/\D/g, '');

            if (digitsOnly === '') {
                setDisplayValue('0,00');
                onChange?.(0);
                return;
            }

            // Converte para centavos (número inteiro)
            const cents = parseInt(digitsOnly, 10);

            // Formata para exibição
            const formatted = formatCentsToDisplay(cents);
            setDisplayValue(formatted);

            // Retorna o valor em centavos
            onChange?.(cents);
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            e.target.select();
        };

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        {currency}
                    </span>
                    <input
                        id={inputId}
                        ref={ref}
                        type="text"
                        inputMode="numeric"
                        value={displayValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        className={cn(
                            'flex h-10 w-full rounded border border-gray-300 bg-white pl-12 pr-3 py-2 text-sm',
                            'placeholder:text-gray-400',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                            error && 'border-red-500 focus:ring-red-500',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    Digite apenas números. Ex: 1 = R$ 0,01 | 100 = R$ 1,00 | 12345 = R$ 123,45
                </p>
            </div>
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
