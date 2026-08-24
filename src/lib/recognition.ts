/** Honest recognition: never invent a food / plant / breed from an unrelated photo. */

export const MIN_VISION_CONFIDENCE = 0.55;

export type RecognitionFailCode =
  | 'not_found'
  | 'not_relevant'
  | 'low_confidence';

export class RecognitionError extends Error {
  readonly code: RecognitionFailCode;

  constructor(code: RecognitionFailCode, message: string) {
    super(message);
    this.name = 'RecognitionError';
    this.code = code;
  }
}

export function isRecognitionError(err: unknown): err is RecognitionError {
  return err instanceof RecognitionError;
}
