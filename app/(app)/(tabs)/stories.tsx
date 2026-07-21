import { AppScreen } from '@/src/components/AppScreen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { SharePhotoSheet } from '@/src/components/SharePhotoSheet';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PhotoAttachField } from '@/src/components/PhotoAttachField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { buildStoryShareMessage } from '@/src/lib/share';
import { brand } from '@/src/theme/brand';
import { useFocusEffect, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type StorySpecies = 'dog' | 'cat';
type StoryPrivacy = 'public' | 'private';
type FeedFilter = 'all' | 'cat' | 'dog' | 'mine';
type ViewMode = 'list' | 'grid';

type StoryPost = {
  id: string;
  author: string;
  petName: string;
  species: StorySpecies;
  avatarKey: string;
  caption: string;
  imageUri?: string | null;
  timeAgo: string;
  likes: number;
  likedBy: string;
  liked: boolean;
  mine?: boolean;
  privacy: StoryPrivacy;
};

const SEED_POSTS: StoryPost[] = [
  {
    id: '1',
    author: 'Iryna',
    petName: 'Ада',
    species: 'cat',
    avatarKey: 'cat-1',
    caption: 'Сонячний ранок на підвіконні ☀️',
    timeAgo: '3 дні тому',
    likes: 12,
    likedBy: 'Оля, Марко та ще 10',
    liked: false,
    privacy: 'public',
  },
  {
    id: '2',
    author: 'Andrii',
    petName: 'Белла',
    species: 'cat',
    avatarKey: 'cat-2',
    caption: 'Нова іграшка — і нуль спокою вдома',
    timeAgo: '5 год тому',
    likes: 8,
    likedBy: 'Катя та ще 7',
    liked: true,
    privacy: 'public',
  },
  {
    id: '3',
    author: 'Marta',
    petName: 'Рекс',
    species: 'dog',
    avatarKey: 'dog-1',
    caption: 'Перша прогулянка після дощу',
    timeAgo: 'Вчора',
    likes: 21,
    likedBy: 'Ігор, Аня та ще 19',
    liked: false,
    privacy: 'public',
  },
];

const MY_POSTS_KEY = 'snoutscore.local.my_story_posts';

async function readMyPosts(): Promise<StoryPost[]> {
  const raw = await AsyncStorage.getItem(MY_POSTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoryPost[];
  } catch {
    return [];
  }
}

async function writeMyPosts(posts: StoryPost[]) {
  await AsyncStorage.setItem(MY_POSTS_KEY, JSON.stringify(posts));
}

function StoryPostCard({
  post,
  compact,
  onToggleLike,
  onShare,
}: {
  post: StoryPost;
  compact?: boolean;
  onToggleLike: (id: string) => void;
  onShare: (post: StoryPost) => void;
}) {
  if (compact) {
    return (
      <View className="mb-3 overflow-hidden rounded-2xl border border-forest-100 bg-white">
        <View style={styles.compactMedia}>
          {post.imageUri ? (
            <Image
              source={{ uri: post.imageUri }}
              style={styles.fillImage}
              resizeMode="cover"
            />
          ) : (
            <PetAvatar
              avatarKey={post.avatarKey}
              species={post.species}
              size={56}
              name={post.petName}
            />
          )}
        </View>
        <View className="px-2.5 py-2">
          <Text numberOfLines={2} className="font-body text-xs text-forest-800">
            {post.caption}
          </Text>
          <Pressable
            onPress={() => onToggleLike(post.id)}
            className="mt-1.5 flex-row items-center gap-1"
          >
            <Ionicons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={16}
              color={post.liked ? brand.score.poor : brand.tealPressed}
            />
            <Text className="font-body text-[11px] text-forest-500">
              {post.likes}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-5 overflow-hidden rounded-3xl border border-forest-100 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <PetAvatar
          avatarKey={post.avatarKey}
          species={post.species}
          size={40}
          name={post.petName}
        />
        <View className="ml-3 flex-1">
          <Text className="font-body-bold text-sm text-forest-900">
            {post.author}
          </Text>
          <Text className="font-body text-xs text-forest-500">
            {post.petName}
            {post.privacy === 'private' ? ` · ${t('stories.privacyPrivate')}` : ''}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color={brand.ink} />
      </View>

      <View style={styles.listMedia}>
        {post.imageUri ? (
          <Image
            source={{ uri: post.imageUri }}
            style={styles.fillImage}
            resizeMode="cover"
          />
        ) : (
          <View className="items-center px-6">
            <PetAvatar
              avatarKey={post.avatarKey}
              species={post.species}
              size={96}
              name={post.petName}
            />
            <Text className="mt-3 text-center font-body text-sm text-forest-600">
              {post.caption}
            </Text>
          </View>
        )}
      </View>

      <View className="px-4 py-3">
        <Text className="font-body text-xs uppercase tracking-wide text-forest-500">
          {post.timeAgo}
        </Text>
        <View className="mt-3 flex-row items-center gap-5">
          <Pressable
            onPress={() => onToggleLike(post.id)}
            className="active:opacity-70"
          >
            <Ionicons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={26}
              color={post.liked ? brand.score.poor : brand.tealPressed}
            />
          </Pressable>
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={brand.tealPressed}
          />
          <Pressable
            onPress={() => onShare(post)}
            className="active:opacity-70"
          >
            <Ionicons
              name="share-outline"
              size={24}
              color={brand.tealPressed}
            />
          </Pressable>
        </View>
        <View className="mt-3 flex-row items-center">
          <Ionicons name="heart" size={14} color={brand.ink} />
          <Text className="ml-2 flex-1 font-body text-sm text-forest-800">
            {post.likedBy}
          </Text>
        </View>
        <Text className="mt-2 font-body text-sm text-forest-700">
          <Text className="font-body-bold">{post.author}</Text> {post.caption}
        </Text>
        <Text className="mt-1 font-body text-xs text-forest-500">
          {post.likes} {t('stories.likes')}
        </Text>
      </View>
    </View>
  );
}

export default function StoriesScreen() {
  const [seed, setSeed] = useState(SEED_POSTS);
  const [mine, setMine] = useState<StoryPost[]>([]);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [composeOpen, setComposeOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<StoryPrivacy>('public');
  const [species, setSpecies] = useState<StorySpecies>('cat');
  const [sharePost, setSharePost] = useState<StoryPost | null>(null);

  const loadMine = useCallback(async () => {
    setMine(await readMyPosts());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMine();
    }, [loadMine]),
  );

  const allPosts = useMemo(() => [...mine, ...seed], [mine, seed]);

  const visible = useMemo(() => {
    return allPosts.filter((p) => {
      if (filter === 'mine') return Boolean(p.mine);
      // Private posts stay only under «Мої»
      if (p.mine && p.privacy === 'private') return false;
      if (filter === 'cat') return p.species === 'cat';
      if (filter === 'dog') return p.species === 'dog';
      return true;
    });
  }, [allPosts, filter]);

  const toggleLike = (id: string) => {
    const bump = (list: StoryPost[]) =>
      list.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      );
    setSeed((prev) => bump(prev));
    setMine((prev) => {
      const next = bump(prev);
      void writeMyPosts(next);
      return next;
    });
  };

  const publish = async () => {
    const text = caption.trim();
    if (!imageUri) {
      Alert.alert(t('common.error'), t('stories.photoRequired'));
      return;
    }
    if (!text) {
      Alert.alert(t('common.error'), t('stories.captionRequired'));
      return;
    }
    const post: StoryPost = {
      id: `mine-${Date.now()}`,
      author: 'Ти',
      petName: species === 'cat' ? 'Мій кіт' : 'Мій пес',
      species,
      avatarKey: species === 'cat' ? 'cat-1' : 'dog-1',
      caption: text,
      imageUri,
      timeAgo: 'Щойно',
      likes: 0,
      likedBy: t('stories.privacyPrivate'),
      liked: false,
      mine: true,
      privacy,
    };
    const next = [post, ...mine];
    setMine(next);
    await writeMyPosts(next);
    setCaption('');
    setImageUri(null);
    setComposeOpen(false);
    setFilter('mine');
  };

  const filters: { id: FeedFilter; label: string }[] = [
    { id: 'all', label: t('stories.filterAll') },
    { id: 'cat', label: t('stories.filterCats') },
    { id: 'dog', label: t('stories.filterDogs') },
    { id: 'mine', label: t('stories.filterMine') },
  ];

  return (
    <AppScreen>
      <View className="px-5 pb-2 pt-4">
        <ScreenHeader
          title={t('stories.brand')}
          subtitle={t('stories.tagline')}
        />
        <View className="mt-3 rounded-2xl bg-forest-100 px-4 py-3">
          <Text className="font-body-medium text-sm text-forest-800">
            {filter === 'mine' ? t('stories.mineHint') : t('stories.previewNote')}
          </Text>
        </View>
        <View className="mt-3 rounded-2xl bg-forest-100 px-4 py-3">
          <Text className="font-body-medium text-sm text-forest-800">
            {t('contests.teaserTitle')}: {t('contests.teaserBody')}
          </Text>
          <View className="mt-3">
            <PrimaryButton
              label={t('contests.open')}
              size="sm"
              variant="secondary"
              onPress={() => router.push('/(app)/contests')}
            />
          </View>
        </View>

        <View className="mt-3">
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={filters}
          />
        </View>

        <View className="mt-3 flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <SegmentedControl
              value={viewMode}
              onChange={setViewMode}
              options={[
                { id: 'list', label: t('stories.viewList') },
                { id: 'grid', label: t('stories.viewGrid') },
              ]}
            />
          </View>
        </View>
        {filter === 'mine' ? (
          <View className="mt-3">
            <PrimaryButton
              label={t('stories.addPost')}
              onPress={() => setComposeOpen(true)}
            />
          </View>
        ) : null}
      </View>

      <FlatList
        key={viewMode}
        data={visible}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={
          viewMode === 'grid' ? { gap: 10, paddingHorizontal: 20 } : undefined
        }
        contentContainerClassName={
          viewMode === 'grid' ? 'pb-10 pt-2' : 'px-5 pb-10 pt-2'
        }
        ListEmptyComponent={
          <View className="mt-16 items-center px-8">
            <Text className="text-center font-body text-forest-600">
              {filter === 'mine'
                ? t('stories.emptyMine')
                : t('stories.emptyFilter')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className={viewMode === 'grid' ? 'flex-1' : undefined}>
            <StoryPostCard
              post={item}
              compact={viewMode === 'grid'}
              onToggleLike={toggleLike}
              onShare={setSharePost}
            />
          </View>
        )}
      />

      <Modal visible={composeOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[90%] rounded-t-3xl bg-sand-50 px-5 pb-10 pt-5">
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text className="font-display text-2xl text-forest-900">
                {t('stories.composeTitle')}
              </Text>

              <View className="mt-4">
                <PhotoAttachField
                  label={t('stories.photo')}
                  uri={imageUri}
                  onChange={setImageUri}
                  emptyHint={t('stories.photoHint')}
                  filePrefix="story"
                  aspect={[4, 3]}
                  height={200}
                />
              </View>

              <Text className="mt-4 font-body-medium text-sm text-forest-700">
                {t('stories.species')}
              </Text>
              <View className="mt-2 flex-row gap-2">
                {(['cat', 'dog'] as StorySpecies[]).map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSpecies(s)}
                    className={`flex-1 items-center rounded-2xl py-3 ${
                      species === s ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <Text
                      className={`font-body-bold text-sm ${
                        species === s ? 'text-sand-50' : 'text-forest-800'
                      }`}
                    >
                      {s === 'cat'
                        ? t('stories.filterCats')
                        : t('stories.filterDogs')}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="mt-4 font-body-medium text-sm text-forest-700">
                {t('stories.privacy')}
              </Text>
              <View className="mt-2 flex-row gap-2">
                {(
                  [
                    { id: 'public' as const, label: t('stories.privacyPublic') },
                    {
                      id: 'private' as const,
                      label: t('stories.privacyPrivate'),
                    },
                  ] as const
                ).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setPrivacy(item.id)}
                    className={`flex-1 items-center rounded-2xl py-3 ${
                      privacy === item.id ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <Text
                      className={`text-center font-body-bold text-xs ${
                        privacy === item.id ? 'text-sand-50' : 'text-forest-800'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="mt-4 font-body-medium text-sm text-forest-700">
                {t('stories.caption')}
              </Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder={t('stories.captionPlaceholder')}
                multiline
                className="mt-2 min-h-[96px] rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-base text-forest-900"
                placeholderTextColor="#7FD9C9"
              />

              <View className="mt-5 gap-3">
                <PrimaryButton
                  label={t('stories.publish')}
                  onPress={() => void publish()}
                />
                <PrimaryButton
                  label={t('common.cancel')}
                  variant="ghost"
                  onPress={() => {
                    setComposeOpen(false);
                    setImageUri(null);
                  }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SharePhotoSheet
        visible={Boolean(sharePost)}
        onClose={() => setSharePost(null)}
        imageUri={sharePost?.imageUri}
        title={t('share.dialogTitle')}
        message={
          sharePost
            ? buildStoryShareMessage({
                petName: sharePost.petName,
                caption: sharePost.caption,
              })
            : ''
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  compactMedia: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: brand.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listMedia: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: brand.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
});
