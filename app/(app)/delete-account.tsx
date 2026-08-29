import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { DeleteAccountModal } from '@/src/components/account/DeleteAccountModal';
import { AppScreen } from '@/src/components/AppScreen';

/** Legacy route — opens 07.12 modal then returns. */
export default function DeleteAccountScreen() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) router.back();
  }, [open]);

  return (
    <AppScreen edges={['bottom']}>
      <View />
      <DeleteAccountModal visible={open} onClose={() => setOpen(false)} />
    </AppScreen>
  );
}
