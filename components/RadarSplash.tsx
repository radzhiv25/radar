import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export function RadarSplash() {
  return (
    <Screen className="items-center justify-center px-8" edges={['top', 'bottom', 'left', 'right']}>
      <Text className="text-5xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Radar
      </Text>
      <Text
        variant="body"
        className="mt-4 max-w-xs text-center text-base leading-6 text-stone-500 dark:text-stone-400">
        Discover the restaurants and places on your feed in one place
      </Text>
    </Screen>
  );
}
