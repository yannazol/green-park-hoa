import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getDropdownPickerStyles(c: AppColors) {
  return StyleSheet.create({
    field: {
      gap: 6,
      zIndex: 1,
      elevation: 1,
    },
    fieldExpanded: {
      zIndex: 20,
      elevation: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    control: {
      minHeight: 46,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
    },
    value: {
      flex: 1,
      color: c.text,
      fontSize: 14,
    },
    placeholder: {
      color: c.textMuted,
    },
    options: {
      position: 'absolute',
      top: 72,
      left: 0,
      right: 0,
      maxHeight: 240,
      overflow: 'hidden',
      zIndex: 30,
      elevation: 30,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
    },
    option: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: 13,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
    },
    optionSelected: {
      backgroundColor: c.brandLight,
    },
    optionText: {
      color: c.text,
      fontSize: 14,
    },
    optionTextSelected: {
      color: c.brand,
      fontWeight: '600',
    },
  });
}
