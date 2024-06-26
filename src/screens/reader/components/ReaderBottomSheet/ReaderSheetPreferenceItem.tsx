import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ThemeColors } from '../../../../theme/types';
import Switch from '@components/Switch/Switch';

interface ReaderSheetPreferenceItemProps {
  label: string;
  value: boolean;
  onPress: () => void;
  theme: ThemeColors;
}

const ReaderSheetPreferenceItem: React.FC<ReaderSheetPreferenceItemProps> = ({
  label,
  value,
  onPress,
  theme,
}) => {
  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: theme.rippleColor }}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
        {label}
      </Text>
      <Switch value={value} onValueChange={onPress} theme={theme} size={20} />
    </Pressable>
  );
};

export default ReaderSheetPreferenceItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    flex: 1,
    paddingRight: 16,
  },
});
