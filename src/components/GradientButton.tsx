import { PrimaryButton } from '@/src/components/PrimaryButton';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

/** Auth CTA — solid primary, always visible. */
export function GradientButton({ label, onPress, loading, disabled }: Props) {
  return (
    <PrimaryButton
      label={label}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      variant="primary"
      size="lg"
    />
  );
}
