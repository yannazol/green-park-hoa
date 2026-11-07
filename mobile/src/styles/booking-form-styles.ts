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
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      overflow: 'hidden',
    },
    scroll: {
      paddingHorizontal: 18,
      paddingTop: 22,
      paddingBottom: 24,
      gap: 11,
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
      fontSize: 21,
      fontWeight: '700',
    },
    feeDescription: {
      color: c.textSecondary,
      fontSize: 13,
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
    fieldLabel: {
      color: c.text,
      fontSize: 13,
      fontWeight: '600',
    },
    guestRow: {
      minHeight: 46,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
    },
    guestLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    guestsInput: {
      width: 64,
      height: 40,
      paddingHorizontal: 8,
      color: c.text,
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
    },
    calendar: {
      padding: 9,
      gap: 4,
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
      height: 24,
      alignItems: 'center',
    },
    weekday: {
      width: '14.2857%',
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
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedDayCircle: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 17,
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
      gap: 8,
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
      minHeight: 72,
      paddingTop: 10,
      textAlignVertical: 'top',
    },
    submitButton: {
      minHeight: 56,
      marginTop: 5,
      marginHorizontal: -2,
    },
  });
}
