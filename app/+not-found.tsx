import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-sand-50 px-5">
        <Text className="font-display text-2xl text-forest-800">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" className="mt-4">
          <Text className="font-body-medium text-forest-700">Go to home</Text>
        </Link>
      </View>
    </>
  );
}
