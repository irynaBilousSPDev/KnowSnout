import { Text, View } from 'react-native';

type Props = {
  pros: string[];
  cons: string[];
};

function BulletList({
  title,
  items,
  accentClass,
}: {
  title: string;
  items: string[];
  accentClass: string;
}) {
  return (
    <View className="mb-5">
      <Text className={`mb-2 font-body-bold text-base ${accentClass}`}>
        {title}
      </Text>
      {items.length === 0 ? (
        <Text className="font-body text-forest-500">None listed</Text>
      ) : (
        items.map((item) => (
          <View key={item} className="mb-2 flex-row">
            <Text className={`mr-2 font-body-bold ${accentClass}`}>•</Text>
            <Text className="flex-1 font-body text-base leading-6 text-forest-800">
              {item}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

export function ProsConsList({ pros, cons }: Props) {
  return (
    <View>
      <BulletList title="Pros" items={pros} accentClass="text-score-good" />
      <BulletList title="Cons" items={cons} accentClass="text-score-poor" />
    </View>
  );
}
