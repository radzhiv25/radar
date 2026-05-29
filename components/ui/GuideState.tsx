import { Link } from 'expo-router';
import { Pressable, View as RNView } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import { markWelcomeSeen } from '@/lib/onboarding/storage';
import type { GuideContent } from '@/types/guide';

type GuideStateProps = {
  guide: GuideContent;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  compact?: boolean;
};

export function GuideState({ guide, onPrimaryPress, onSecondaryPress, compact }: GuideStateProps) {
  const handlePress = async (href?: string, fallback?: () => void) => {
    if (guide.key === 'welcome') await markWelcomeSeen();
    if (href) return;
    fallback?.();
  };

  const primary = guide.primary;
  const secondary = guide.secondary;

  return (
    <View
      className={`rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 ${
        compact ? 'p-4' : 'p-6'
      }`}>
      <Text variant={compact ? 'label' : 'title'} className={compact ? 'text-lg' : undefined}>
        {guide.title}
      </Text>
      <Text variant="body" className={`mt-2 text-stone-600 dark:text-stone-400 ${compact ? 'text-sm' : ''}`}>
        {guide.message}
      </Text>

      {guide.steps && guide.steps.length > 0 && (
        <View className="mt-4 gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
          {guide.steps.map((step, index) => (
            <Text key={step} variant="body" className="text-sm text-stone-500 dark:text-stone-400">
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      )}

      <RNView className="mt-4 gap-2">
        {primary &&
          (primary.href ? (
            <Link href={primary.href as never} asChild>
              <Button
                label={primary.label}
                className="mt-0 w-full self-stretch"
                onPress={() => handlePress(primary.href, onPrimaryPress)}
              />
            </Link>
          ) : (
            <Button
              label={primary.label}
              className="mt-0 w-full self-stretch"
              onPress={() => {
                void handlePress(undefined, onPrimaryPress);
              }}
            />
          ))}

        {secondary &&
          (secondary.href ? (
            <Link href={secondary.href as never} asChild>
              <Button
                label={secondary.label}
                variant="ghost"
                className="mt-0 w-full self-stretch"
                onPress={() => handlePress(secondary.href, onSecondaryPress)}
              />
            </Link>
          ) : (
            <Pressable
              onPress={() => {
                void handlePress(undefined, onSecondaryPress);
              }}
              className="py-2">
              <Text variant="label" className="text-center text-stone-500">
                {secondary.label}
              </Text>
            </Pressable>
          ))}
      </RNView>
    </View>
  );
}
