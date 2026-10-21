import { useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge, { type BadgeVariant } from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import {
  sampleFacilities,
  sampleReservations,
  type Facility,
  type Reservation,
  type ReservationStatus,
} from '@/constants/sample-data';
import { useAppTheme } from '@/hooks/use-app-theme';
import BookingForm from '@/screens/Resident/booking-form';
import getBookingsStyles from '@/styles/bookings-styles';

const reservationStatusVariantMap: Record<ReservationStatus, BadgeVariant> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
};

export default function BookingsScreen() {
  const c = useAppTheme();
  const s = getBookingsStyles(c);

  const [facilities] = useState<Facility[]>(sampleFacilities);
  const [reservations] = useState<Reservation[]>(sampleReservations);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);

  const handleOpenBooking = (facilityName: string) => {
    setSelectedFacility(facilityName);
  };

  const handleCloseBooking = () => {
    setSelectedFacility(null);
  };

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Bookings</Text>

        {/* 1. Facilities */}
        <View style={s.section}>
          <Text style={s.sectionHeading}>Facilities</Text>

          {facilities.length === 0 ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyTitle}>No facilities available</Text>
              <Text style={s.emptySubtitle}>Available facilities will appear here.</Text>
            </Card>
          ) : (
            <View style={s.facilityList}>
              {facilities.map((facility) => (
                <Card key={facility.id} style={s.facilityCard}>
                  <Text style={s.facilityName}>{facility.name}</Text>
                  <Text style={s.facilityDesc}>{facility.description}</Text>

                  <View style={s.facilityFooter}>
                    <Text style={s.facilityFee}>{facility.fee}</Text>
                    <Button
                      title="Request"
                      variant="outline"
                      onPress={() => handleOpenBooking(facility.name)}
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* 2. My reservations */}
        <View style={s.section}>
          <Text style={s.sectionHeading}>My reservations</Text>

          {reservations.length === 0 ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyTitle}>No reservations yet</Text>
              <Text style={s.emptySubtitle}>
                Request a facility above to create your first reservation.
              </Text>
            </Card>
          ) : (
            <View style={s.reservationList}>
              {reservations.map((item) => (
                <Card key={item.id} style={s.reservationCard}>
                  <View style={s.reservationTopRow}>
                    <Text style={s.reservationFacility}>{item.facility}</Text>
                    <Badge
                      label={item.status}
                      variant={reservationStatusVariantMap[item.status]}
                    />
                  </View>
                  <Text style={s.reservationDateTime}>
                    {item.date} • {item.timeSlot}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 3. Booking Modal */}
      <Modal
        visible={selectedFacility !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseBooking}>
        {selectedFacility ? (
          <BookingForm
            facilityName={selectedFacility}
            onClose={handleCloseBooking}
          />
        ) : null}
      </Modal>
    </SafeAreaView>
  );
}
