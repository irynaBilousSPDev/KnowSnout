import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.root}>
        <AppChromeHeader showAvatar={false} />
        <View style={styles.body}>
          <Text style={styles.title}>{t('common.notFoundTitle')}</Text>
          <Text style={styles.bodyText}>{t('common.notFoundBody')}</Text>
          <Link href="/(app)/(tabs)" asChild>
            <Pressable style={styles.linkBtn}>
              <Text style={styles.link}>{t('common.goHome')}</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.canvas },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 24,
    color: brand.ink,
    textAlign: 'center',
  },
  bodyText: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.muted,
    textAlign: 'center',
  },
  linkBtn: { marginTop: 20, paddingVertical: 8 },
  link: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: brand.accent,
  },
});
