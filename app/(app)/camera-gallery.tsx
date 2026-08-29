import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

/** 08.08 · Камера / галерея */
export default function CameraGalleryScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [thumbUri, setThumbUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted) {
      router.replace('/(app)/camera-permission' as never);
    }
  }, [permission]);

  if (!permission?.granted) {
    return <View style={styles.root} />;
  }

  const pickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setThumbUri(result.assets[0].uri);
    }
  };

  const capture = async () => {
    if (!cameraRef.current || busy) return;
    try {
      setBusy(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.75 });
      if (photo?.uri) setThumbUri(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={() => void pickGallery()} style={styles.thumbBtn}>
          {thumbUri ? (
            <Image source={{ uri: thumbUri }} style={styles.thumbImg} />
          ) : (
            <View style={styles.thumbEmpty} />
          )}
        </Pressable>

        <Pressable
          onPress={() => void capture()}
          disabled={busy}
          style={[styles.shutter, busy && styles.shutterDim]}
        >
          <View style={styles.shutterInner} />
        </Pressable>

        <Pressable
          onPress={() =>
            setFacing((prev) => (prev === 'back' ? 'front' : 'back'))
          }
          style={styles.flipBtn}
        >
          <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    paddingTop: 12,
  },
  thumbBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbEmpty: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
  },
  thumbImg: { width: 44, height: 44 },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  shutterDim: { opacity: 0.55 },
  flipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
