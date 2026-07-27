import { forwardRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

const watermarkLogo = require('../../assets/images/brand-logo-watermark.png');

const FRAME = 1080;
const LOGO = 96;

type Props = {
  imageUri: string;
  onReadyChange?: (ready: boolean) => void;
};

export const WatermarkCapture = forwardRef<ViewShot, Props>(
  function WatermarkCapture({ imageUri, onReadyChange }, ref) {
    const [photoLoaded, setPhotoLoaded] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);

    const markReady = (nextPhoto: boolean, nextLogo: boolean) => {
      if (nextPhoto && nextLogo) onReadyChange?.(true);
    };

    return (
      <View style={styles.host} pointerEvents="none">
        <ViewShot
          ref={ref}
          options={{
            format: 'jpg',
            quality: 0.92,
            result: 'tmpfile',
            fileName: 'knowsnout-share',
          }}
          style={styles.frame}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.photo}
            resizeMode="cover"
            onLoad={() => {
              setPhotoLoaded(true);
              markReady(true, logoLoaded);
            }}
            onError={() => {
              setPhotoLoaded(true);
              markReady(true, logoLoaded);
            }}
          />
          <Image
            source={watermarkLogo}
            style={styles.logo}
            resizeMode="contain"
            onLoad={() => {
              setLogoLoaded(true);
              markReady(photoLoaded, true);
            }}
            onError={() => {
              setLogoLoaded(true);
              markReady(photoLoaded, true);
            }}
          />
        </ViewShot>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: -FRAME * 2,
    top: 0,
    width: FRAME,
    height: FRAME,
    opacity: 0.01,
  },
  frame: {
    width: FRAME,
    height: FRAME,
    backgroundColor: '#111B2F',
    overflow: 'hidden',
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
  },
  logo: {
    position: 'absolute',
    right: 36,
    bottom: 36,
    width: LOGO,
    height: LOGO,
  },
});
