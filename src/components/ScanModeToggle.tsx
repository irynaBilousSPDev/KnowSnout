import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SegmentedControl } from '@/src/components/SegmentedControl';
import { t } from '@/src/i18n';

export type ScanMode = 'photo' | 'barcode';

type Props = {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
};

export function ScanModeToggle({ mode, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <SegmentedControl
        value={mode}
        onChange={onChange}
        options={[
          { id: 'barcode', label: t('scan.modeBarcode') },
          { id: 'photo', label: t('scan.modePhoto') },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
});
