import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

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
        color={focused ? brand.navy : '#8A9BB0'}
      />
    </View>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.label, focused && styles.labelFocused]} numberOfLines={1}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);

  return (
    <Tabs
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
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarActiveTintColor: brand.navy,
        tabBarInactiveTintColor: '#8A9BB0',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.scan'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'scan' : 'scan-outline'} focused={focused} />
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
              name={focused ? 'people' : 'people-outline'}
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
              name={focused ? 'map' : 'map-outline'}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t('tabs.directories')} focused={focused} />
          ),
        }}
      />
      {/* Nested under Перевір / Спільнота — not bottom tabs */}
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
    backgroundColor: brand.forestTint,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    lineHeight: 12,
    color: '#8A9BB0',
    textAlign: 'center',
  },
  labelFocused: {
    color: brand.navy,
  },
});
