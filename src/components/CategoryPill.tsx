import { Pressable, StyleSheet, Text } from 'react-native';

interface CategoryPillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function CategoryPill({ label, active, onPress }: CategoryPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${label}`}
      onPress={onPress}
      style={[styles.pill, active && styles.activePill]}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 10,
  },
  activePill: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  activeLabel: {
    color: '#111827',
  },
});
