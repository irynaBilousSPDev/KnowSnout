export type StoryTagPin = { name: string; x: number; y: number };

let pendingPhotoUri: string | null = null;
let pendingTags: StoryTagPin[] = [
  { name: 'Тукан', x: 0.28, y: 0.38 },
  { name: 'Оксана', x: 0.6, y: 0.55 },
];

export function setStoryTagPhoto(uri: string | null) {
  pendingPhotoUri = uri;
}

export function getStoryTagPhoto() {
  return pendingPhotoUri;
}

export function setStoryTagResult(tags: StoryTagPin[]) {
  pendingTags = tags;
}

export function getStoryTagResult() {
  return pendingTags;
}
