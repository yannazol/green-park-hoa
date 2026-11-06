import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, type AppColors } from '@/constants/theme';

export default function getCommunityStyles(c: AppColors) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, paddingBottom: BottomTabInset + 24, gap: 22 },
    heading: { gap: 5 },
    title: { color: c.text, fontSize: 26, fontWeight: '700' },
    subtitle: { color: c.textSecondary, fontSize: 14, lineHeight: 20 },
    section: { gap: 12 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    sectionHeading: { flex: 1, gap: 4 },
    sectionTitle: { color: c.text, fontSize: 19, fontWeight: '700' },
    sectionSubtitle: { color: c.textSecondary, fontSize: 13, lineHeight: 18 },
    itemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    vehicleInfo: { flex: 1, gap: 4 },
    itemTitle: { color: c.text, fontSize: 15, fontWeight: '700' },
    muted: { color: c.textSecondary, fontSize: 13, lineHeight: 19 },
    feeCard: { gap: 7 },
    feeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    feeAmount: { color: c.brand, fontSize: 15, fontWeight: '700' },
    finePrint: { color: c.textMuted, fontSize: 12, lineHeight: 18 },
    requestCard: { gap: 9 },
    requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    date: { color: c.textMuted, fontSize: 12 },
    adminNote: { padding: 10, gap: 3, borderRadius: radius.sm, backgroundColor: c.bgAccent },
    noteLabel: { color: c.brand, fontSize: 12, fontWeight: '700' },
    noteText: { color: c.text, fontSize: 13, lineHeight: 19 },
    emptyCard: { alignItems: 'center', gap: 6, padding: 20 },
    emptyTitle: { color: c.text, fontSize: 15, fontWeight: '700' },
    errorBox: { padding: 12, gap: 10, borderWidth: 1, borderRadius: radius.sm, borderColor: c.dangerBorder, backgroundColor: c.dangerBg },
    errorText: { color: c.dangerText, fontSize: 14 },
    successBox: { padding: 12, borderWidth: 1, borderRadius: radius.sm, borderColor: c.successBorder, backgroundColor: c.successBg },
    successText: { color: c.successText, fontSize: 14 },
  });
}
