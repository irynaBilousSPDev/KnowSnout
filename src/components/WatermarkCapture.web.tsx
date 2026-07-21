import { forwardRef, useEffect } from 'react';

type Props = {
  imageUri: string;
  onReadyChange?: (ready: boolean) => void;
};

/** Web stub — no view-shot (avoids blank screen). */
export const WatermarkCapture = forwardRef<null, Props>(
  function WatermarkCapture({ onReadyChange }, _ref) {
    useEffect(() => {
      onReadyChange?.(false);
    }, [onReadyChange]);
    return null;
  },
);
