import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router'; // 💡 1. 引入 router

export default function ReservationCard({ item, isLight = true }) {
    const bgColor = isLight ? '#FFFFFF' : '#1E1E1E';
    const textColor = isLight ? '#000000' : '#FFFFFF';
    const subTextColor = isLight ? '#666666' : '#AAAAAA';
    const borderColor = isLight ? '#E5E5E5' : '#333333';

    const displayStatus = item.status || "已付款";
    const displayPrice = item.totalPrice ? `NT$${item.totalPrice}` : "NT$0";

    return (
        <Pressable 
            style={[styles.card, { backgroundColor: bgColor, borderColor: borderColor }]}
            onPress={() => {
                router.push({
                    pathname: "/subPage/OrderDetail",
                    params: { data: JSON.stringify(item) }
                });
            }}
        >
            <View style={styles.orderRow}>
                <Text style={{ fontSize: 12, color: textColor }}>訂單編號</Text>
                <Text style={{ fontSize: 12, color: textColor, marginLeft: 12 }} numberOfLines={1}>
                    {item.bookingId} 
                </Text>
            </View>

            <View style={styles.tableRow}>
                <Text style={[styles.headerText, { color: subTextColor, flex: 2.5 }]}>劇本</Text>
                <Text style={[styles.headerText, { color: subTextColor, flex: 1, textAlign: 'center' }]}>人數</Text>
                <Text style={[styles.headerText, { color: subTextColor, flex: 1.5, textAlign: 'center' }]}>預約狀態</Text>
                <Text style={[styles.headerText, { color: subTextColor, flex: 1.5, textAlign: 'right' }]}>金額</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <View style={styles.tableRow}>
                <Text style={[styles.dataText, { color: textColor, flex: 2.5, fontWeight: 'bold' }]} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={[styles.dataText, { color: textColor, flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
                    {item.people}
                </Text>
                <Text style={[styles.dataText, { color: textColor, flex: 1.5, textAlign: 'center', fontWeight: 'bold' }]}>
                    {displayStatus}
                </Text>
                <Text style={[styles.dataText, { color: textColor, flex: 1.5, textAlign: 'right', fontWeight: 'bold' }]} numberOfLines={1}>
                    {displayPrice}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '85%',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        fontSize: 12,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 12,
    },
    dataText: {
        fontSize: 12,
    }
});