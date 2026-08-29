import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { getHelpTopic } from '@/src/services/helpContent';
import { brand, fonts } from '@/src/theme/brand';

/** 07.10 · Довідка — стаття */
export default function HelpArticleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const topic = id ? getHelpTopic(id) : null;
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);

  if (!topic) {
    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <ScrHeader title={t('help.missing')} titleSize={18} />
      </AppScreen>
    );
  }

  const titleKey = topic.articleTitleKey ?? topic.titleKey;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('help.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.card}>
            <Text style={styles.articleTitle}>{t(titleKey)}</Text>
            <Text style={styles.body}>{t(topic.bodyKey)}</Text>
          </View>

          <View style={styles.feedback}>
            <Text style={styles.feedbackLbl}>{t('help.useful')}</Text>
            <View style={styles.feedbackBtns}>
              <Pressable
                onPress={() => {
                  setVote('yes');
                  notify(t('common.ok'), t('help.thanksFeedback'));
                }}
                style={[styles.feedbackBtn, vote === 'yes' && styles.feedbackOn]}
              >
                <Text style={styles.feedbackBtnText}>{t('help.yes')}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setVote('no');
                  notify(t('common.ok'), t('help.thanksFeedback'));
                }}
                style={[styles.feedbackBtn, vote === 'no' && styles.feedbackOn]}
              >
                <Text style={styles.feedbackBtnText}>{t('help.no')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    gap: 10,
  },
  articleTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: brand.muted,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackLbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  feedbackBtns: { flexDirection: 'row', gap: 8 },
  feedbackBtn: {
    borderRadius: brand.radius.pill,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  feedbackOn: {
    borderColor: brand.accentDark,
    backgroundColor: brand.accentTint,
  },
  feedbackBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.ink,
  },
});
