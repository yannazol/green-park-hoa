import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import Badge, { type BadgeVariant } from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import { type TimeSlot } from '@/constants/resident-options';
import { api } from '@/services/api';
import { useAppTheme } from '@/hooks/use-app-theme';
import BookingForm from '@/screens/Resident/booking-form';
import getBookingsStyles from '@/styles/bookings-styles';

type FacilityRecord = {
  _id: string;
  name: string;
  description: string;
  feeCentavos: number;
  feeDescription: string;
  hasPhoto?: boolean;
  operatingHours?: { opensAt: string; closesAt: string; slotMinutes: number } | null;
};
type ReservationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
type ReservationRecord = {
  _id: string;
  facilityName: string;
  date: string;
  timeSlot: string;
  schedulePeriod?: TimeSlot;
  status: ReservationStatus;
  purpose: string;
  guestCount: number;
  feeCentavos: number;
  feeDescription: string;
  adminNote?: string;
  statusHistory?: {
    status: ReservationStatus;
    note?: string;
    at: string;
    by?: { name?: string } | string;
  }[];
};

function FacilityPhoto({
  facility,
  styles,
}: {
  facility: FacilityRecord;
  styles: ReturnType<typeof getBookingsStyles>;
}) {
  const [photo, setPhoto] = useState<{ mimeType: string; data: string } | null>(null);

  useEffect(() => {
    let active = true;
    if (!facility.hasPhoto) return;
    api<{ photo: { mimeType: string; data: string } }>(`/reservations/facilities/${facility._id}/photo`)
      .then(({ photo: image }) => { if (active) setPhoto(image); })
      .catch(() => { if (active) setPhoto(null); });
    return () => { active = false; };
  }, [facility._id, facility.hasPhoto]);

  if (!photo) {
    return (
      <View style={styles.facilityPhotoPlaceholder}>
        <SymbolView
          name={{ ios: 'leaf', android: 'park', web: 'park' }}
          size={36}
          tintColor="rgba(255,255,255,0.65)"
        />
      </View>
    );
  }
  return (
    <Image
      source={{ uri: `data:${photo.mimeType};base64,${photo.data}` }}
      accessibilityLabel={`${facility.name} facility`}
      contentFit="cover"
      style={styles.facilityImage}
    />
  );
}

const STATUS_VARIANT: Record<ReservationStatus, BadgeVariant> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
  Cancelled: 'neutral',
};
const formatDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeZone: 'Asia/Manila',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};
const formatTimeSlot = (reservation: ReservationRecord) => {
  const [hours, minutes] = reservation.timeSlot.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return reservation.timeSlot;
  const time = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
  return reservation.schedulePeriod ? `${time} · ${reservation.schedulePeriod}` : time;
};

export default function BookingsScreen() {
  const c = useAppTheme();
  const s = getBookingsStyles(c);
  const [facilities, setFacilities] = useState<FacilityRecord[]>([]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityRecord | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const [facilityData, reservationData] = await Promise.all([
      api<{ facilities: FacilityRecord[] }>('/reservations/facilities'),
      api<{ reservations: ReservationRecord[] }>('/reservations/mine'),
    ]);
    setFacilities(facilityData.facilities);
    setReservations(reservationData.reservations);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      load()
        .then(() => { if (active) setError(''); })
        .catch((loadError: unknown) => {
          if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load reservations.');
        })
        .finally(() => {
          if (active) {
            setLoading(false);
            setRefreshing(false);
          }
        });
      return () => { active = false; };
    }, [load]),
  );

  const handleOpenBooking = (facility: FacilityRecord) => {
    setSelectedFacility(facility);
    setSubmitError('');
    setNotice('');
  };
  const handleCloseBooking = () => {
    setSelectedFacility(null);
    setSubmitError('');
  };

  const checkAvailability = async (facility: string, date: string, schedule: TimeSlot) => {
    const query = `facility=${encodeURIComponent(facility)}&from=${encodeURIComponent(date)}&to=${encodeURIComponent(date)}&schedulePeriod=${encodeURIComponent(schedule)}`;
    const { availableSlots } = await api<{ availableSlots: string[] }>(
      `/reservations/availability?${query}`,
    );
    return availableSlots;
  };

  const submitBooking = async (booking: {
    facility: string;
    date: string;
    timeSlot: string;
    schedulePeriod: TimeSlot;
    purpose: string;
    guestCount: number;
  }) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await api('/reservations', { method: 'POST', body: booking });
      await load();
      setSelectedFacility(null);
      setNotice('Your booking request was submitted. The HOA will review it.');
    } catch (failure) {
      setSubmitError(failure instanceof Error ? failure.message : 'Could not submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const openReservation = async (item: ReservationRecord) => {
    setSelectedReservation(item);
    try {
      const { reservation } = await api<{ reservation: ReservationRecord }>(`/reservations/mine/${item._id}`);
      setSelectedReservation(reservation);
    } catch (detailFailure) {
      setError(detailFailure instanceof Error ? detailFailure.message : 'Could not load reservation details.');
    }
  };

  const cancelReservation = (item: ReservationRecord) => {
    Alert.alert('Cancel reservation?', `${item.facilityName} · ${formatDate(item.date)} (${item.timeSlot})`, [
      { text: 'Keep booking', style: 'cancel' },
      {
        text: 'Cancel reservation',
        style: 'destructive',
        onPress: () => {
          void api(`/reservations/mine/${item._id}/cancel`, { method: 'PATCH' })
            .then(async () => {
              setSelectedReservation(null);
              setNotice('Your reservation was cancelled.');
              await load();
            })
            .catch((cancelError: unknown) =>
              setError(cancelError instanceof Error ? cancelError.message : 'Could not cancel this reservation.'),
            );
        },
      },
    ]);
  };

  const canCancel = (status: ReservationStatus) => status === 'Pending' || status === 'Approved';

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load().catch((err) => setError(err instanceof Error ? err.message : 'Could not refresh reservations.')).finally(() => setRefreshing(false)); }} tintColor={c.brand} />}>
        <Text style={s.title}>Reservations</Text>
        {error ? (
          <Card style={s.messageCard}>
            <Text style={s.errorText}>{error}</Text>
            <Button title="Retry" variant="outline" onPress={() => { setLoading(true); void load().catch((err) => setError(err instanceof Error ? err.message : 'Could not load reservations.')).finally(() => setLoading(false)); }} />
          </Card>
        ) : null}
        {notice ? <View style={s.successBox}><Text style={s.successText}>{notice}</Text></View> : null}

        <View style={s.section}>
          <Text style={s.sectionHeading}>Facilities</Text>
          {loading ? (
            <Card style={s.emptyCard}><ActivityIndicator color={c.brand} /><Text style={s.emptySubtitle}>Loading available facilities…</Text></Card>
          ) : facilities.length === 0 ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyTitle}>No facilities available</Text>
              <Text style={s.emptySubtitle}>Contact the HOA office for facility information.</Text>
            </Card>
          ) : (
            <View style={s.facilityList}>
              {facilities.map((facility) => (
                <View key={facility._id} style={s.facilityCard}>
                  <FacilityPhoto facility={facility} styles={s} />
                  <View pointerEvents="none" style={s.facilityOverlay} />
                  <View style={s.facilityContent}>
                    <Text style={s.facilityName}>{facility.name}</Text>
                    <Text style={s.facilityDesc}>{facility.description}</Text>
                    <View style={s.facilityFooter}>
                      <Text style={s.facilityFee}>{facility.feeDescription}</Text>
                      <Button title="Request" onPress={() => handleOpenBooking(facility)} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionHeading}>My reservations</Text>
          {loading ? (
            <Card style={s.emptyCard}><Text style={s.emptySubtitle}>Loading your reservations…</Text></Card>
          ) : reservations.length === 0 ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyTitle}>No reservations yet</Text>
              <Text style={s.emptySubtitle}>Request a facility above to create your first reservation.</Text>
            </Card>
          ) : (
            <View style={s.reservationList}>
              {reservations.map((item) => (
                <Card key={item._id} style={s.reservationCard}>
                  <View style={s.reservationTopRow}>
                    <Text style={s.reservationFacility}>{item.facilityName}</Text>
                    <Badge label={item.status} variant={STATUS_VARIANT[item.status]} />
                  </View>
                  <Text style={s.reservationDateTime}>{formatDate(item.date)} · {formatTimeSlot(item)}</Text>
                  <Text style={s.facilityDesc}>{item.guestCount ?? 1} guest{item.guestCount === 1 ? '' : 's'}</Text>
                  <View style={s.reservationActions}>
                    <Button title="Details & updates" variant="outline" onPress={() => void openReservation(item)} />
                    {canCancel(item.status) ? <Button title="Cancel" variant="outline" onPress={() => cancelReservation(item)} /> : null}
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={selectedFacility !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleCloseBooking}>
        {selectedFacility ? (
          <BookingForm
            facility={selectedFacility}
            submitting={submitting}
            error={submitError}
            onCheckAvailability={(date, schedule) => checkAvailability(selectedFacility._id, date, schedule)}
            onSubmit={submitBooking}
            onClose={handleCloseBooking}
          />
        ) : null}
      </Modal>

      <Modal visible={selectedReservation !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedReservation(null)}>
        <SafeAreaView style={s.detailPage} edges={['top']}>
          <ScrollView contentContainerStyle={s.detailScroll}>
            {selectedReservation ? (
              <>
                <View style={s.detailHeader}>
                  <View style={s.detailTitleGroup}>
                    <Text style={s.detailTitle}>{selectedReservation.facilityName}</Text>
                    <Text style={s.reservationDateTime}>{formatDate(selectedReservation.date)} · {formatTimeSlot(selectedReservation)}</Text>
                  </View>
                  <Button title="Close" variant="outline" onPress={() => setSelectedReservation(null)} />
                </View>
                <View style={s.detailCard}>
                  <View style={s.reservationTopRow}>
                    <Text style={s.detailLabel}>Status</Text>
                    <Badge label={selectedReservation.status} variant={STATUS_VARIANT[selectedReservation.status]} />
                  </View>
                  <Text style={s.detailLabel}>Purpose</Text>
                  <Text style={s.detailText}>{selectedReservation.purpose}</Text>
                  <Text style={s.detailLabel}>Guests</Text>
                  <Text style={s.detailText}>{selectedReservation.guestCount ?? 1}</Text>
                  {selectedReservation.feeDescription ? <Text style={s.detailText}>{selectedReservation.feeDescription}</Text> : null}
                </View>
                {selectedReservation.adminNote ? (
                  <View style={s.noteBox}><Text style={s.noteLabel}>HOA update</Text><Text style={s.detailText}>{selectedReservation.adminNote}</Text></View>
                ) : null}
                <View style={s.detailCard}>
                  <Text style={s.detailLabel}>Activity history</Text>
                  {(selectedReservation.statusHistory ?? []).map((entry, index) => (
                    <View key={`${entry.at}-${index}`} style={s.timelineRow}>
                      <View style={s.timelineDot} />
                      <View style={s.timelineText}>
                        <Text style={s.detailText}>{entry.status}</Text>
                        <Text style={s.detailMeta}>
                          {new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(entry.at))}
                          {typeof entry.by === 'object' && entry.by?.name ? ` · ${entry.by.name}` : ''}
                        </Text>
                        {entry.note ? <Text style={s.detailText}>{entry.note}</Text> : null}
                      </View>
                    </View>
                  ))}
                </View>
                {canCancel(selectedReservation.status) ? (
                  <Button title="Cancel reservation" variant="outline" fullWidth onPress={() => cancelReservation(selectedReservation)} />
                ) : null}
              </>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
