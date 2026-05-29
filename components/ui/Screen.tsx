import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

type ScreenProps = SafeAreaViewProps & {
  className?: string;
};

/** Prefer this over react-native SafeAreaView (deprecated). */
export function Screen({ className, edges = ['top', 'left', 'right'], ...props }: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={cn('flex-1 bg-stone-50 dark:bg-stone-950', className)}
      {...props}
    />
  );
}
