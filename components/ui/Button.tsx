import { forwardRef } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'ghost';
  className?: string;
};

export const Button = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  function Button({ label, variant = 'primary', className, disabled, ...props }, ref) {
    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        className={cn(
          'mt-2 self-start rounded-lg px-4 py-3 active:opacity-70',
          disabled && 'opacity-50',
          variant === 'primary' &&
            'border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900',
          variant === 'ghost' && 'border border-transparent bg-transparent',
          className
        )}
        {...props}>
        <Text
          variant="label"
          className={cn(
            'text-stone-700 dark:text-stone-300',
            variant === 'ghost' && 'text-stone-500 dark:text-stone-500'
          )}>
          {label}
        </Text>
      </Pressable>
    );
  }
);
