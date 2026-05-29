import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import type { TagType } from '@/types/database';

const labelForType: Record<TagType, string> = {
  vibe: 'Vibe',
  occasion: 'Occasion',
  food: 'Food',
};

type TagChipProps = {
  tagType: TagType;
  tag: string;
};

export function TagChip({ tagType, tag }: TagChipProps) {
  return (
    <View className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 dark:border-stone-700 dark:bg-stone-800">
      <Text variant="caption" className="normal-case tracking-normal text-stone-600 dark:text-stone-300">
        {labelForType[tagType]} · {tag.replace(/-/g, ' ')}
      </Text>
    </View>
  );
}
