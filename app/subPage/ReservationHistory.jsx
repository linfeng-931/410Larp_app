import { View, Text, ScrollView, ActivityIndicator, scrollRef } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useAppStyles } from '../../utils/useAppStyles';
import { useUser } from '../../utils/userContext';
import { fetchUserAppointments } from '../../utils/authService';
import ReservationCard from '../../components/ReservationCard';
import Header from '../../components/Header';

export default function ReservationHistory() {
    const { styles, isLight } = useAppStyles();
    const { user } = useUser();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const loadAppointments = async () => {
            if (!user?.uid) return;
            try {
                const data = await fetchUserAppointments(user.uid);

                const sortedData = data.sort((a, b) => {
                    return new Date(b.bookedAt) - new Date(a.bookedAt);
                });

                setAppointments(sortedData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadAppointments();
    }, [user?.uid]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isLight ? '#fff' : '#121212' }}>
                <ActivityIndicator size="large" color="#FFA000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <Stack.Screen />
            <ScrollView
                contentContainerStyle={[styles.container, { gap: 32 }]}
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ width: '100%', marginBottom: 20, backgroundColor: isLight ? '#fff' : '#000' }}>
                    <Header styles={styles} font={'預約紀錄'} />
                </View>
                {appointments.length > 0 ? (
                    appointments.map((item, index) => (
                        <ReservationCard
                            key={item.bookingId || index}
                            item={item}
                            isLight={isLight}
                        />
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', marginTop: 40, color: isLight ? '#999' : '#666' }}>
                        目前無預約紀錄
                    </Text>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}