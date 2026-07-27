import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
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
    <View
      className={`mb-0.5 items-center justify-center rounded-2xl px-2.5 py-1 ${
        focused ? 'bg-forest-100' : ''
      }`}
    >
      <Ionicons
        name={name}
        size={22}
        color={focused ? brand.tealPressed : '#7FD9C9'}
      />
    </View>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      className={`font-body-medium text-[10px] ${
        focused ? 'text-forest-700' : 'text-forest-400'
      }`}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: brand.surfaceElevated,
          borderTopColor: brand.mistBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 78,
          paddingBottom: 12,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: brand.tealPressed,
        tabBarInactiveTintColor: '#7FD9C9',
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
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'journal' : 'journal-outline'}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t('tabs.history')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: t('tabs.quiz'),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'help-circle' : 'help-circle-outline'}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t('tabs.quiz')} focused={focused} />
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
        name="me"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
