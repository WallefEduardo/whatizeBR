import { ImgHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src?: string | null;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fallback?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    ({ src, alt = '', size = 'md', fallback, className, ...props }, ref) => {
        const [imageError, setImageError] = useState(false);

        const sizes = {
            xs: 'h-6 w-6 text-xs',
            sm: 'h-8 w-8 text-sm',
            md: 'h-10 w-10 text-base',
            lg: 'h-12 w-12 text-lg',
            xl: 'h-16 w-16 text-xl',
        };

        const iconSizes = {
            xs: 'h-3 w-3',
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
            xl: 'h-8 w-8',
        };

        const showFallback = !src || imageError;

        return (
            <div
                ref={ref}
                className={cn(
                    'relative inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden',
                    sizes[size],
                    className
                )}
            >
                {showFallback ? (
                    fallback ? (
                        <span className="font-medium text-gray-600">{fallback}</span>
                    ) : (
                        <User className={cn('text-gray-400', iconSizes[size])} />
                    )
                ) : (
                    <img
                        src={src}
                        alt={alt}
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover"
                        {...props}
                    />
                )}
            </div>
        );
    }
);

Avatar.displayName = 'Avatar';

export default Avatar;
