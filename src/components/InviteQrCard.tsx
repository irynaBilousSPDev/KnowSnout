import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { brand } from '@/src/theme/brand';

const logoIcon = require('../../assets/brand/logo-icon.png');

type Props = {
  url: string;
  size?: number;
};

/**
 * Scannable square QR with KnowSnout logo in the center.
 * Paw-shaped modules are unreliable for scanners — brand via logo + quiet zone.
 */
export function InviteQrCard({ url, size = 168 }: Props) {
  const logoSize = Math.round(size * 0.22);
  return (
    <View style={[styles.card, { width: size + 24, height: size + 24 }]}>
      <QRCode
        value={url.startsWith('http') ? url : `https://${url}`}
        size={size}
        color={brand.ink}
        backgroundColor="#FFFFFF"
        quietZone={8}
        logo={logoIcon}
        logoSize={logoSize}
        logoBackgroundColor="#FFFFFF"
        logoMargin={3}
        logoBorderRadius={8}
        ecl="H"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 2,
  },
});
