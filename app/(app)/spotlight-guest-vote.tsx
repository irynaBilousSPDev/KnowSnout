import { Linking, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  castGuestVote,
  listEntriesForContest,
  listSpotlightContests,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.24 — guest landing (in-app), same as public /vote */
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
      <View style={styles.pad}>
        <Text style={styles.url}>knowsnout.app/vote</Text>
        <Text style={styles.title}>{t('spotlight.voteFor', { name })}</Text>
        <View style={styles.photo}>
          <Ionicons name="image-outline" size={32} color={brand.mutedSoft} />
          <Text style={styles.photoT}>{t('spotlight.entryPhoto')}</Text>
        </View>
        <Text style={styles.count}>{t('spotlight.votesNow', { n: '128' })}</Text>
        <PrimaryButton
          label={t('spotlight.guestVoteCta')}
          size="lg"
          icon={<Ionicons name="paw" size={16} color="#FFFFFF" />}
          onPress={() => void onVote()}
        />
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
    paddingTop: 6,
    gap: 14,
    alignItems: 'center',
  },
  url: {
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 0.6,
    color: brand.mutedSoft,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
    textAlign: 'center',
    marginTop: 6,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    borderWidth: 1,
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
    fontSize: 15,
    color: brand.ink,
  },
  foot: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
    lineHeight: 18,
    marginTop: 4,
  },
  link: { textDecorationLine: 'underline', color: brand.accent },
});
