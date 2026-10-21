import { useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge, { type BadgeVariant } from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import {
  sampleDuesSummary,
  samplePaymentHistory,
  type DuesSummary,
  type PaymentRecord,
  type PaymentStatus,
} from '@/constants/sample-data';
import { useAppTheme } from '@/hooks/use-app-theme';
import RecordPaymentForm from '@/screens/Resident/record-payment-form';
import getDuesStyles from '@/styles/dues-styles';

const summaryStatusVariantMap: Record<DuesSummary['status'], BadgeVariant> = {
  Paid: 'success',
  'Due soon': 'warning',
  Overdue: 'danger',
};

const paymentStatusVariantMap: Record<PaymentStatus, BadgeVariant> = {
  Verified: 'success',
  Pending: 'warning',
  Rejected: 'danger',
};

export default function DuesScreen() {
  const c = useAppTheme();
  const s = getDuesStyles(c);

  const [showModal, setShowModal] = useState(false);
  const [payments] = useState<PaymentRecord[]>(samplePaymentHistory);

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Dues</Text>

        {/* 1. Summary Card */}
        <Card style={s.summaryCard}>
          <View style={s.summaryTopRow}>
            <Text style={s.balanceLabel}>Outstanding balance</Text>
            <Badge
              label={sampleDuesSummary.status}
              variant={summaryStatusVariantMap[sampleDuesSummary.status]}
            />
          </View>

          <Text style={s.balanceAmount}>{sampleDuesSummary.outstandingBalance}</Text>
          <Text style={s.dueDate}>{sampleDuesSummary.dueDate}</Text>

          <View style={s.paidThroughRow}>
            <Text style={s.paidThroughText}>{sampleDuesSummary.paidThrough}</Text>
          </View>

          <Button
            title="Record a payment"
            fullWidth
            style={s.recordButton}
            onPress={() => setShowModal(true)}
          />
        </Card>

        {/* 2. Payment history */}
        <View style={s.section}>
          <Text style={s.sectionHeading}>Payment history</Text>

          {payments.length === 0 ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyTitle}>No payment history</Text>
              <Text style={s.emptySubtitle}>Your recorded payments will appear here.</Text>
            </Card>
          ) : (
            <View style={s.historyList}>
              {payments.map((item) => (
                <Card key={item.id} style={s.historyCard}>
                  <View style={s.historyTopRow}>
                    <Text style={s.historyMonth}>{item.month}</Text>
                    <Badge
                      label={item.status}
                      variant={paymentStatusVariantMap[item.status]}
                    />
                  </View>

                  <View style={s.historyBottomRow}>
                    <Text style={s.historyAmount}>{item.amount}</Text>
                    <Text style={s.historyRef}>{item.referenceNumber}</Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 3. Record a payment Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}>
        <RecordPaymentForm onClose={() => setShowModal(false)} />
      </Modal>
    </SafeAreaView>
  );
}
