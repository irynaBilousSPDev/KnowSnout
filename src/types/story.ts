export type StorySpecies = 'dog' | 'cat';
export type StoryPrivacy = 'public' | 'private';
export type StoryFeedFilter =
  | 'all'
  | 'following'
  | 'cat'
  | 'dog'
  | 'mine'
  | 'friends'
  | 'myBreed'
  | 'nearby';

export type StoryPost = {
  id: string;
  userId: string;
  author: string;
  petName: string;
  species: StorySpecies;
  avatarKey: string;
  caption: string;
  /** City / place line under author (feed cards). */
  location?: string | null;
  /** Resolved URL for Image */
  imageUri?: string | null;
  /** Storage path when cloud */
  imagePath?: string | null;
  createdAt: string;
  likes: number;
  liked: boolean;
  commentsCount: number;
  mine?: boolean;
  privacy: StoryPrivacy;
  petId?: string | null;
  /** Optional photo tags */
  taggedPetIds?: string[];
  taggedFriendIds?: string[];
  /** Display snapshots filled at create time */
  taggedPetNames?: string[];
  taggedFriendNames?: string[];
};

export type StoryComment = {
  id: string;
  postId: string;
  userId: string;
  author: string;
  body: string;
  createdAt: string;
  mine?: boolean;
};
