import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../utils/styleFormat';

export default function Footer({ page }) {
    const router = useRouter();

    return (
        <View style={styles.footer}>
            {page == 1 ?
                <View style={styles.iconBtn}>
                    <Image
                        source={require('../assets/images/Home.svg')}
                        style={{ width: 30, height: 30 }}
                    />
                </View> :
                <Pressable
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.5 : 1,
                    })}
                    onPress={() => {
                        router.replace('/')
                    }}
                >
                    <View style={styles.iconBtnDisact}>
                        <Image
                            source={require('../assets/images/Home.svg')}
                            style={{ width: 30, height: 30 }}
                        />
                    </View>
                </Pressable>
            }
            {/* 
            {page == 2 ?
                <View style={styles.iconBtn}>
                    <Image
                        source={require('../assets/images/icon_nav_bookmark_actived.png')}
                        style={{ width: 30, height: 30 }}
                    />
                </View>
                :
                <Pressable
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.5 : 1,
                    })}
                    onPress={() => {
                        router.push('/subPage/bookMark')
                    }}
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            source={require('../assets/images/icon_nav_bookmark.png')}
                            style={{ width: 30, height: 30 }}
                        />
                        <Text style={{ fontFamily: 'Roboto_400Regular', color: '#666' }}>Wishist</Text>
                    </View>
                </Pressable>
            }

            {page == 3 ?
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        source={require('../assets/images/icon_mybook_actived.png')}
                        style={{ width: 30, height: 30 }}
                    />
                    <Text style={{ fontFamily: 'Roboto_400Regular', color: '#6200EE' }}>My books</Text>
                </View>
                :
                <Pressable
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.5 : 1,
                    })}
                    onPress={() => {
                        router.push('/subPage/myBook')
                    }}
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            source={require('../assets/images/icon_mybook.png')}
                            style={{ width: 30, height: 30 }}
                        />
                        <Text style={{ fontFamily: 'Roboto_400Regular', color: '#666' }}>My books</Text>
                    </View>
                </Pressable>
            }*/}
        </View>
    );
}