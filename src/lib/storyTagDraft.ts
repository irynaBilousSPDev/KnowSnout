let pendingPhotoUri: string | null = null;
let pendingTags: { name: string; x: number; y: number }[] = [
  { name: 'Тукан', x: 0.28, y: 0.38 },
  { name: 'Оксана', x: 0.6, y: 0.55 },
];

export function setStoryTagPhoto(uri: string | null) {
  pendingPhotoUri = uri;
}

export function getStoryTagPhoto() {
  return pendingPhotoUri;
}

export function setStoryTagResult(tags: { name: string; x: number; y: number }[]) {
  pendingTags = tags;
}

export function getStoryTagResult() {
  return pendingTags;
}
