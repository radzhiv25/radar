import { Text as RNText, type TextProps } from 'react-native';

import { cn } from '@/lib/cn';

type AppTextProps = TextProps & {
  className?: string;
  variant?: 'body' | 'title' | 'subtitle' | 'caption' | 'label';
};

const variantClass: Record<NonNullable<AppTextProps['variant']>, string> = {
  caption: 'text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500',
  label: 'text-sm font-medium text-stone-700 dark:text-stone-300',
  body: 'text-base leading-6 text-stone-600 dark:text-stone-400',
  subtitle: 'text-base leading-6 text-stone-500 dark:text-stone-400',
  title: 'text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50',
};

export function Text({ className, variant = 'body', ...props }: AppTextProps) {
  return <RNText className={cn(variantClass[variant], className)} {...props} />;
}
