import {
    View,
    FlatList,
    Text,
} from "react-native";
import { useState } from "react";

import Card from "./Card";
import Btn from "./Btn";

export default function StoriesList({ currentStories, pageStatus, styles, colorScheme }) {
    const [amount, SetAmount] = useState(5);

    return (
        <>
            {pageStatus === 0 &&
                <View style={styles.main}>
                    <Text style={styles.title}>更多精彩劇本</Text>
                    <FlatList
                        data={currentStories.slice(0, amount)}
                        scrollEnabled={false}
                        renderItem={({ item }) => <Card key={item.id} story={item} colorScheme={colorScheme} horizontal={true} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                        showsHorizontalScrollIndicator={false}
                    />
                    <View style={{ width: 152 }}>
                        <Btn colorScheme={colorScheme} font={'顯示更多'} func={() => SetAmount(amount + 5)} btnType={0} />
                    </View>
                </View> 
            }
            {pageStatus === 1 &&
                <View style={styles.main}>
                    <Text style={styles.title}>{currentStories.length}個結果</Text>
                    <FlatList
                        data={currentStories.slice(0, amount)}
                        scrollEnabled={false}
                        renderItem={({ item }) => <Card key={item.id} story={item} colorScheme={colorScheme} horizontal={true} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                        showsHorizontalScrollIndicator={false}
                    />
                    {currentStories.length > 5 &&
                        <View style={{ width: 152 }}>
                            <Btn colorScheme={colorScheme} font={'顯示更多'} func={() => SetAmount(amount + 5)} btnType={0} />
                        </View>
                    }
                </View>
            }
        </>
    );
}
