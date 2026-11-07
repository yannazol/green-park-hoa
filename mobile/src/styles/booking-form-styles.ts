import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getBookingFormStyles(c: AppColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      padding: 20,
      paddingBottom: 32,
      gap: 16,
    },
    formHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    formHeaderText: {
      flex: 1,
      gap: 5,
    },
    eyebrow: {
      color: c.brand,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    title: {
      color: c.text,
      fontSize: 23,
      fontWeight: '700',
    },
    feeDescription: {
      color: c.textSecondary,
      fontSize: 13,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgMuted,
    },
    errorBox: {
      padding: 12,
      borderWidth: 1,
      borderRadius: radius.sm,
      backgroundColor: c.dangerBg,
      borderColor: c.dangerBorder,
    },
    errorText: {
      color: c.dangerText,
      fontSize: 13,
      lineHeight: 18,
    },
    dateGuestRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
    },
    dateField: {
      flex: 1,
      gap: 7,
    },
    guestsField: {
      width: 100,
      gap: 7,
    },
    fieldLabel: {
      color: c.text,
      fontSize: 13,
      fontWeight: '600',
    },
    dateValue: {
      height: 48,
      paddingHorizontal: 11,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
    },
    dateValueText: {
      flex: 1,
      color: c.text,
      fontSize: 14,
      fontWeight: '600',
    },
    guestsInput: {
      height: 48,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      color: c.text,
      backgroundColor: c.bgCard,
      fontSize: 15,
    },
    calendar: {
      padding: 14,
      gap: 11,
      borderWidth: 1,
      borderColor: c.borderLight,
      borderRadius: radius.lg,
      backgroundColor: c.bgCard,
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    calendarTitle: {
      color: c.text,
      fontSize: 15,
      fontWeight: '700',
    },
    monthActions: {
      flexDirection: 'row',
      gap: 7,
    },
    monthButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bg,
    },
    weekdays: {
      flexDirection: 'row',
    },
    weekday: {
      width: '14.2857%',
      paddingVertical: 5,
      color: c.textMuted,
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calendarDay: {
      width: '14.2857%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
    },
    calendarDaySelected: {
      backgroundColor: c.brand,
    },
    calendarDayOutside: {
      opacity: 0.4,
    },
    calendarDayText: {
      color: c.text,
      fontSize: 13,
    },
    calendarDayTextSelected: {
      color: c.textInverse,
      fontWeight: '700',
    },
    calendarDayDisabled: {
      color: c.textMuted,
    },
    section: {
      gap: 10,
    },
    scheduleRow: {
      flexDirection: 'row',
      gap: 8,
    },
    scheduleButton: {
      flex: 1,
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
    },
    scheduleButtonSelected: {
      borderColor: c.brand,
      backgroundColor: c.brandLight,
    },
    scheduleText: {
      color: c.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    scheduleTextSelected: {
      color: c.brand,
    },
    slotGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    slotButton: {
      minWidth: '30%',
      minHeight: 42,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
    },
    slotButtonSelected: {
      borderColor: c.brand,
      backgroundColor: c.brand,
    },
    slotText: {
      color: c.text,
      fontSize: 13,
      fontWeight: '600',
    },
    slotTextSelected: {
      color: c.textInverse,
    },
    availableHint: {
      color: c.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    textArea: {
      minHeight: 84,
      paddingTop: 12,
      textAlignVertical: 'top',
    },
  });
}
