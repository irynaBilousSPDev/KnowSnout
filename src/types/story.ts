export type StorySpecies = 'dog' | 'cat';
export type StoryPrivacy = 'public' | 'private';
export type StoryFeedFilter = 'all' | 'cat' | 'dog' | 'mine';

export type StoryPost = {
  id: string;
  userId: string;
  author: string;
  petName: string;
  species: StorySpecies;
  avatarKey: string;
  caption: string;
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
