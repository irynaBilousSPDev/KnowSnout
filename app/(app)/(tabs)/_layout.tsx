import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/**
 * Bottom tabs from design sheets 2026-08-24 (04.00 pack):
 * Стрічка · Перевір · Улюбленці · Спільнота · Довідники
 * @see docs/design/screenshots/2026-08-24/04.00-04.02-feed-post-comments.png
 */
export const unstable_settings = {
  initialRouteName: 'stories',
};

function TabIcon({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={name}
      size={18}
      color={focused ? brand.accent : brand.mutedSoft}
    />
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={[styles.label, focused && styles.labelFocused]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 6);

  return (
    <Tabs
      initialRouteName="stories"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: brand.surfaceElevated,
          borderTopColor: brand.chipTrack,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 56 + bottom,
          paddingBottom: bottom,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: { paddingTop: 0 },
        tabBarActiveTintColor: brand.accent,
        tabBarInactiveTintColor: brand.mutedSoft,
      }}
    >
      <Tabs.Screen
        name="stories"
        options={{
          title: t('tabs.stories'),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'newspaper' : 'newspaper-outline'}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t('tabs.stories')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.scan'),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'scan' : 'scan-outline'}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t('tabs.scan')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: t('tabs.pets'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'paw' : 'paw-outline'} focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t('tabs.pets')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('tabs.community'),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t('tabs.community')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="directories"
        options={{
          title: t('tabs.directories'),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'book' : 'book-outline'}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t('tabs.directories')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="quiz" options={{ href: null }} />
      <Tabs.Screen name="me" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    lineHeight: 12,
    color: brand.mutedSoft,
    textAlign: 'center',
    marginTop: 3,
  },
  labelFocused: {
    color: brand.accent,
  },
});
