import { Link, Stack } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center gap-3 bg-stone-50 px-6 dark:bg-stone-950">
        <Text variant="title">Page not found</Text>
        <Text variant="body" className="text-center">
          This route does not exist.
        </Text>
        <Link href="/" asChild>
          <Button label="Back to home" />
        </Link>
      </View>
    </>
  );
}
