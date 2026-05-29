import { Link } from 'expo-router';
import { ScrollView } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';

type ScreenShellProps = {
  title: string;
  subtitle: string;
  bullets?: string[];
  links?: { href: string; label: string }[];
};

export function ScreenShell({ title, subtitle, bullets, links }: ScreenShellProps) {
  return (
    <ScrollView className="flex-1 bg-stone-50 dark:bg-stone-950">
      <View className="gap-4 px-6 pb-10 pt-5">
        <Text variant="caption">Radar · Delhi</Text>
        <Text variant="title">{title}</Text>
        <Text variant="subtitle">{subtitle}</Text>

        {bullets && bullets.length > 0 && (
          <View className="gap-2 border-t border-stone-200 pt-4 dark:border-stone-800">
            {bullets.map((item) => (
              <Text key={item} variant="body" className="text-stone-500 dark:text-stone-400">
                {item}
              </Text>
            ))}
          </View>
        )}

        {links && links.length > 0 && (
          <View className="mt-2 gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href as never} asChild>
                <Button label={link.label} />
              </Link>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
