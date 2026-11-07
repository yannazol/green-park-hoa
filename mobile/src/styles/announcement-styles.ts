import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, type AppColors } from '@/constants/theme';

export default function getAnnouncementStyles(c: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.bg,
    },
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    content: {
      padding: 20,
      paddingBottom: BottomTabInset + 20,
      gap: 14,
    },
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    pageHeaderText: {
      flex: 1,
      gap: 4,
    },
    servicesLink: {
      minHeight: 44,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: radius.md,
      backgroundColor: c.brandLight,
    },
    servicesLinkText: {
      color: c.brand,
      fontSize: 13,
      fontWeight: '700',
    },
    title: {
      color: c.text,
      fontSize: 26,
      fontWeight: '700',
    },
    subtitle: {
      marginBottom: 4,
      color: c.textSecondary,
      fontSize: 14,
    },
    card: {
      gap: 10,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    date: {
      color: c.textSecondary,
      fontSize: 12,
    },
    cardTitle: {
      color: c.text,
      fontSize: 17,
      fontWeight: '700',
      lineHeight: 23,
    },
    message: {
      color: c.text,
      fontSize: 14,
      lineHeight: 21,
    },
    readMore: {
      alignSelf: 'flex-start',
      paddingVertical: 2,
    },
    readMoreText: {
      color: c.brand,
      fontSize: 13,
      fontWeight: '700',
    },
    images: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    image: {
      width: '48%',
      height: 150,
      borderRadius: radius.sm,
      backgroundColor: c.bgMuted,
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingTop: 2,
    },
    authorAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.brandLight,
    },
    authorInitial: {
      color: c.brand,
      fontSize: 13,
      fontWeight: '700',
    },
    authorName: {
      color: c.text,
      fontSize: 13,
      fontWeight: '600',
    },
    feedActions: {
      minHeight: 46,
      paddingTop: 7,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 22,
    },
    feedAction: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    actionText: {
      color: c.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    likedText: {
      color: c.danger,
    },
    commentPage: {
      flex: 1,
      backgroundColor: c.bg,
    },
    commentFlex: {
      flex: 1,
    },
    commentHeader: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.divider,
    },
    commentTitle: {
      color: c.text,
      fontSize: 19,
      fontWeight: '700',
    },
    commentsContent: {
      flexGrow: 1,
      padding: 18,
      gap: 12,
    },
    commentCard: {
      padding: 14,
      gap: 8,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.borderLight,
      backgroundColor: c.bgCard,
    },
    commentMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    commentAuthor: {
      color: c.text,
      fontSize: 13,
      fontWeight: '700',
    },
    commentMessage: {
      color: c.text,
      fontSize: 14,
      lineHeight: 20,
    },
    commentComposer: {
      padding: 14,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      backgroundColor: c.bgCard,
    },
    commentInput: {
      flex: 1,
      minHeight: 46,
      maxHeight: 120,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 22,
      color: c.text,
      backgroundColor: c.bg,
      fontSize: 14,
    },
    sendButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.brand,
    },
    sendDisabled: {
      opacity: 0.55,
    },
    emptyCard: {
      alignItems: 'center',
      gap: 10,
      padding: 24,
    },
    emptyTitle: {
      color: c.text,
      fontSize: 16,
      fontWeight: '700',
    },
    emptyText: {
      color: c.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    errorText: {
      color: c.dangerText,
      fontSize: 14,
      textAlign: 'center',
    },
  });
}
