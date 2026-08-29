import { Linking, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  castGuestVote,
  listEntriesForContest,
  listSpotlightContests,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.24 — guest vote landing */
export default function SpotlightGuestVoteScreen() {
  const name = 'Тукана';

  const onVote = async () => {
    const contest = listSpotlightContests()[0];
    if (!contest) return;
    const entries = await listEntriesForContest(contest.id);
    const tukan = entries.find((e) => e.petName === 'Тукан') ?? entries[0];
    if (!tukan) return;
    const ok = await castGuestVote(tukan.id);
    notify(
      t('common.ok'),
      ok ? t('spotlight.guestVoteDone') : t('spotlight.guestVoteAlready'),
    );
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('spotlight.guestVoteTitle')} titleSize={18} />
      <View style={styles.pad}>
        <Text style={styles.url}>knowsnout.app/vote</Text>
        <Text style={styles.title}>{t('spotlight.voteFor', { name })}</Text>
        <View style={styles.photo}>
          <Ionicons name="image-outline" size={32} color={brand.mutedSoft} />
          <Text style={styles.photoT}>{t('spotlight.entryPhoto')}</Text>
        </View>
        <Text style={styles.count}>{t('spotlight.votesNow', { n: '128' })}</Text>
        <View style={styles.cta}>
          <PrimaryButton
            label={t('spotlight.guestVoteCta')}
            size="lg"
            icon={<Ionicons name="paw" size={16} color="#FFFFFF" />}
            onPress={() => void onVote()}
          />
        </View>
        <Text style={styles.foot}>
          {t('spotlight.guestFoot')}{' '}
          <Text
            style={styles.link}
            onPress={() => void Linking.openURL('https://knowsnout.app')}
          >
            {t('spotlight.downloadApp')}
          </Text>{' '}
          {t('spotlight.guestFootEnd')}
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
    alignItems: 'center',
  },
  url: {
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    letterSpacing: 0.4,
    color: brand.mutedSoft,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 24,
    color: brand.ink,
    textAlign: 'center',
  },
  photo: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoT: { fontFamily: fonts.body, fontSize: 13, color: brand.mutedSoft },
  count: {
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  cta: { width: '100%', marginTop: 2 },
  foot: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  link: {
    textDecorationLine: 'underline',
    color: brand.accent,
    fontFamily: fonts.bodySemi,
  },
});
