import { View as RNView, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

type AppViewProps = ViewProps & {
  className?: string;
};

export function View({ className, ...props }: AppViewProps) {
  return <RNView className={cn(className)} {...props} />;
}
