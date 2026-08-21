import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** PDF Design-Setup: Перевір · Улюбленці · Стрічка · Спільнота · Довідники */
export const unstable_settings = {
  initialRouteName: 'index',
};

function TabIcon({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
      <Ionicons
        name={name}
        size={22}
        color={focused ? brand.sage : brand.mutedSoft}
      />
    </View>
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
  const bottom = Math.max(insets.bottom, 8);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: brand.surfaceElevated,
          borderTopColor: brand.mistBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 58 + bottom,
          paddingBottom: bottom,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarActiveTintColor: brand.sage,
        tabBarInactiveTintColor: brand.mutedSoft,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.scan'),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'search' : 'search-outline'}
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
        name="stories"
        options={{
          title: t('tabs.stories'),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'images' : 'images-outline'}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t('tabs.stories')} focused={focused} />
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
  iconWrap: {
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 44,
    minHeight: 32,
  },
  iconWrapFocused: {
    backgroundColor: brand.sageTint,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    lineHeight: 12,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  labelFocused: {
    color: brand.sage,
    fontFamily: fonts.bodyBold,
  },
});
