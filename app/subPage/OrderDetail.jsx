import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStyles } from '../../utils/useAppStyles';
import Header from '../../components/Header';
import { useUser } from '../../utils/userContext';

export default function OrderDetail() {
    const { styles: appStyles, isLight } = useAppStyles();
    const { user } = useUser(); // 取得當前使用者的個人資料
    const { data } = useLocalSearchParams();

    // 解析傳遞過來的資料，防呆處理
    let orderData = {};
    try {
        orderData = data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("資料解析錯誤", e);
    }

    // 顏色變數設定
    const bgColor = isLight ? '#ffffffff' : '#000000ff';
    const textColor = isLight ? '#000000' : '#FFFFFF';
    const subTextColor = isLight ? '#666666' : '#AAAAAA';
    const borderColor = isLight ? '#E5E5E5' : '#333333';

    const formatDisplayDate = (dateStr, timeStr) => {
        if (!dateStr) return '未知時間';
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
            return `${parts[0]}年 ${parseInt(parts[1])}月 ${parseInt(parts[2])}日 ${timeStr || ''}`;
        }
        return `${dateStr} ${timeStr || ''}`;
    };

    const peopleCount = Number(orderData.people) || 1;
    const totalPrice = Number(orderData.totalPrice) || 0;
    const hostFee = orderData.hostName ? 200 : 0;

    const originPrice = orderData.originPrice 
        ? Number(orderData.originPrice) 
        : Math.round((totalPrice - hostFee) / peopleCount);

    const subTotalPrice = originPrice * peopleCount;

    const InfoRow = ({ title, value }) => (
        <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: subTextColor }]}>{title}</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[appStyles.safeArea, { backgroundColor: bgColor }]} edges={["top", "left", "right"]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={{ width: '100%', marginBottom: 20, backgroundColor: isLight ? '#fff' : '#000' }}>
                <Header styles={appStyles} font={'訂單內容'} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 40 }}>
                
                {/* 訂單基本資訊 */}
                <View style={{ gap: 24, marginBottom: 32 }}>
                    <InfoRow title="訂單編號" value={orderData.bookingId || "無"} />
                    <InfoRow title="預約狀態" value={orderData.status || "已付款"} />
                    <InfoRow title="預約人" value={user?.name || orderData.userName || "未提供名稱"} />
                    <InfoRow title="聯絡電話" value={user?.phone || "未提供電話"} />
                    <InfoRow title="聯絡信箱" value={user?.email || "未提供信箱"} />
                    <InfoRow title="預約日期" value={formatDisplayDate(orderData.date, orderData.time)} />
                    <InfoRow title="備註" value={orderData.otherRequire || "無"} />
                </View>

                {/* 費用明細表格 */}
                <View style={{ gap: 16 }}>
                    {/* 表格標題 */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { color: subTextColor, flex: 2.5 }]}>內容</Text>
                        <Text style={[styles.tableHeader, { color: subTextColor, flex: 1.5 }]}>價格</Text>
                        <Text style={[styles.tableHeader, { color: subTextColor, flex: 1, textAlign: 'center' }]}>人數</Text>
                        <Text style={[styles.tableHeader, { color: subTextColor, flex: 1.5, textAlign: 'right' }]}>小計</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    {/* 劇本費 */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableData, { color: textColor, flex: 2.5 }]} numberOfLines={1}>
                            {orderData.title || "未知劇本"}
                        </Text>
                        <Text style={[styles.tableData, { color: textColor, flex: 1.5 }]}>
                            NT${originPrice}  {/* 💡 使用算好的單價 */}
                        </Text>
                        <Text style={[styles.tableData, { color: textColor, flex: 1, textAlign: 'center' }]}>
                            {peopleCount}
                        </Text>
                        <Text style={[styles.tableData, { color: textColor, flex: 1.5, textAlign: 'right' }]}>
                            NT${subTotalPrice} {/* 💡 使用算好的小計 */}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    {/* 指定主持人費 */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableData, { color: textColor, flex: 5 }]} numberOfLines={1}>
                            指定主持人：{orderData.hostName || "無"}
                        </Text>
                        <Text style={[styles.tableData, { color: textColor, flex: 1.5, textAlign: 'right' }]}>
                            NT${hostFee} {/* 💡 使用算好的主持費 */}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    {/* 折抵 */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableData, { color: textColor, flex: 5 }]}>折抵</Text>
                        <Text style={[styles.tableData, { color: textColor, flex: 1.5, textAlign: 'right' }]}>NT$0</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    {/* 總計 */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableData, { color: textColor, flex: 5, fontWeight: 'bold', fontSize: 16 }]}>總計</Text>
                        <Text style={[styles.tableData, { color: textColor, flex: 1.5, textAlign: 'right', fontWeight: 'bold', fontSize: 16 }]}>
                            NT${totalPrice}
                        </Text>
                    </View>
                    
                    <View style={[styles.divider, { backgroundColor: borderColor }]} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    infoRow: {
        gap: 8,
    },
    infoTitle: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tableHeader: {
        fontSize: 14,
    },
    tableData: {
        fontSize: 14
    },
    divider: {
        height: 1,
        width: '100%',
    }
});