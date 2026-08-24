import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/src/i18n';
import {
  getStoryTagPhoto,
  getStoryTagResult,
  setStoryTagResult,
  type StoryTagPin,
} from '@/src/lib/storyTagDraft';
import { brand, fonts } from '@/src/theme/brand';

const SEED_TAGS: StoryTagPin[] = [
  { name: 'Тукан', x: 0.28, y: 0.38 },
  { name: 'Оксана', x: 0.6, y: 0.55 },
];

/** Screenshot 04.04 — dark tag overlay */
export default function StoryTagScreen() {
  const insets = useSafeAreaInsets();
  const existing = getStoryTagResult();
  const [tags, setTags] = useState<StoryTagPin[]>(
    existing.length ? existing : SEED_TAGS,
  );
  const [size, setSize] = useState({ w: 1, h: 1 });
  const uri = getStoryTagPhoto();

  return (
    <View style={styles.root}>
      <View style={[styles.bar, { paddingTop: Math.max(insets.top, 20) }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('stories.tagTitle')}</Text>
        <Pressable
          onPress={() => {
            setStoryTagResult(tags);
            router.back();
          }}
          hitSlop={8}
        >
          <Text style={styles.done}>{t('common.done')}</Text>
        </Pressable>
      </View>
      <Pressable
        style={styles.canvas}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setSize({ w: width || 1, h: height || 1 });
        }}
        onPress={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          setTags((cur) => [
            ...cur,
            {
              name: t('stories.tagNew'),
              x: locationX / size.w,
              y: locationY / size.h,
            },
          ]);
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={styles.ph}>
            <Text style={styles.phT}>{t('stories.tagPhotoHint')}</Text>
          </View>
        )}
        {tags.map((tag) => (
          <View
            key={`${tag.name}-${tag.x}-${tag.y}`}
            pointerEvents="none"
            style={[
              styles.pin,
              { left: `${tag.x * 100}%`, top: `${tag.y * 100}%` },
            ]}
          >
            <View style={styles.dot} />
            <Text style={styles.pill}>{tag.name}</Text>
          </View>
        ))}
      </Pressable>
      <Text style={styles.hint}>{t('stories.tagTapHint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  cancel: { width: 88, fontFamily: fonts.bodySemi, fontSize: 13, color: '#fff' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 18,
    color: '#fff',
  },
  done: {
    width: 88,
    textAlign: 'right',
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentSoft,
  },
  canvas: { flex: 1, position: 'relative' },
  img: { ...StyleSheet.absoluteFillObject },
  ph: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phT: { fontFamily: fonts.body, fontSize: 13, color: '#888' },
  pin: {
    position: 'absolute',
    marginLeft: -5,
    marginTop: -5,
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    color: '#fff',
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  hint: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#aaa',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});
