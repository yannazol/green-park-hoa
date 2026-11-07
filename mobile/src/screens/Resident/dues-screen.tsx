import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge, { type BadgeVariant } from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import BottomSheetModal from '@/components/bottom-sheet-modal';
import { api } from '@/services/api';
import { useAppTheme } from '@/hooks/use-app-theme';
import RecordPaymentForm, {
  type PaymentSubmission,
} from '@/screens/Resident/record-payment-form';
import getDuesStyles from '@/styles/dues-styles';

type DuesSummary = {
  outstandingCentavos: number;
  creditCentavos: number;
  status: 'Paid' | 'Outstanding';
  paidThrough: string | null;
};

type PaymentRecord = {
  _id: string;
  amountCentavos: number;
  referenceNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string;
  createdAt: string;
};

const summaryStatusVariantMap: Record<DuesSummary['status'], BadgeVariant> = {
  Paid: 'success',
  Outstanding: 'warning',
};

const paymentStatusVariantMap: Record<PaymentRecord['status'], BadgeVariant> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
};
const paymentStatusLabel: Record<PaymentRecord['status'], string> = {
  approved: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected',
};

const formatMoney = (centavos: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(centavos / 100);

export default function DuesScreen() {
  const c = useAppTheme();
  const s = getDuesStyles(c);

  const [showModal, setShowModal] = useState(false);
  const [formContentHeight, setFormContentHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<DuesSummary | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[] | null>(null);

  const fetchFinancialData = useCallback(async () => {
    const [duesData, paymentData] = await Promise.all([
      api<DuesSummary>('/dues/mine'),
      api<{ payments: PaymentRecord[] }>('/payments/mine'),
    ]);
    return { duesData, paymentData };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { duesData, paymentData } = await fetchFinancialData();
      setSummary(duesData);
      setPayments(paymentData.payments);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dues and payments');
    } finally {
      setLoading(false);
    }
  }, [fetchFinancialData]);

  useEffect(() => {
    let active = true;
    fetchFinancialData()
      .then(({ duesData, paymentData }) => {
        if (!active) return;
        setSummary(duesData);
        setPayments(paymentData.payments);
        setError('');
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Could not load dues and payments');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchFinancialData]);

  const submitPayment = async (payment: PaymentSubmission) => {
    await api('/payments', { method: 'POST', body: payment, timeoutMs: 30000 });
    await load();
    setShowModal(false);
  };

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.pageHeader}>
          <Text style={s.eyebrow}>DUES & TRANSACTIONS</Text>
          <Text style={s.title}>Payments</Text>
        </View>

        <Card style={s.summaryCard}>
          <View style={s.summaryTopRow}>
            <Text style={s.balanceLabel}>Outstanding balance</Text>
            {summary && (
              <Badge
                label={summary.status}
                variant={summaryStatusVariantMap[summary.status]}
              />
            )}
          </View>
          <Text style={s.balanceAmount}>
            {loading || !summary ? '—' : formatMoney(summary.outstandingCentavos)}
          </Text>
          <Text style={s.dueDate}>Current balance across posted billing periods</Text>
          {summary && summary.creditCentavos > 0 ? (
            <Text style={s.creditText}>
              Available credit: {formatMoney(summary.creditCentavos)} · applied to future dues
            </Text>
          ) : null}
          <View style={s.paidThroughRow}>
            <Text style={s.paidThroughText}>
              {summary?.paidThrough
                ? `Paid through ${new Date(`${summary.paidThrough}-01T00:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`
                : summary
                  ? 'No billing periods paid yet'
                  : 'Billing status unavailable'}
            </Text>
          </View>
          <Button
            title="Record a payment"
            fullWidth
            style={s.recordButton}
            onPress={() => setShowModal(true)}
          />
        </Card>

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <View style={s.section}>
          <Text style={s.sectionHeading}>Payment history</Text>
          {loading ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptySubtitle}>Loading payment history…</Text>
            </Card>
          ) : payments === null ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyTitle}>Payment history unavailable</Text>
              <Text style={s.emptySubtitle}>Please try again when your connection is restored.</Text>
            </Card>
          ) : payments.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>No payment history</Text>
              <Text style={s.emptySubtitle}>Submitted payments will appear here.</Text>
            </View>
          ) : (
            <View style={s.historyList}>
              {payments.map((item) => (
                <Card key={item._id} style={s.historyCard}>
                  <View style={s.historyTopRow}>
                    <Text style={s.historyMonth}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <Badge
                      label={paymentStatusLabel[item.status]}
                      variant={paymentStatusVariantMap[item.status]}
                    />
                  </View>
                  <View style={s.historyBottomRow}>
                    <Text style={s.historyAmount}>{formatMoney(item.amountCentavos)}</Text>
                    <Text style={s.historyRef}>{item.referenceNumber}</Text>
                  </View>
                  {item.rejectionReason ? (
                    <Text style={s.rejectionText}>{item.rejectionReason}</Text>
                  ) : null}
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomSheetModal
        visible={showModal}
        fitContent
        contentHeight={formContentHeight}
        onRequestClose={() => setShowModal(false)}>
        <RecordPaymentForm
          onClose={() => setShowModal(false)}
          onSubmit={submitPayment}
          onContentHeightChange={setFormContentHeight}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}
