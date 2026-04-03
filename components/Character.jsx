import {
    View,
    Text,
    Image,
    useColorScheme,
    ScrollView,
} from "react-native";

export default function Character({cover, name, tag, styles, color}){
    return(
        <View 
            style={{
                width:'100%', 
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: color,
                height: 135,
                flexDirection: 'row',
                gap: 32,
            }}
        >
            <Image source={cover} style={{borderRadius: 100, height:80, width:80}}/>
            <View style={{gap:4}}>
                <Text style={styles.title}>{name}</Text>
                {tag !== null &&
                    <Text style={styles.content2}>{tag}</Text>
                }
            </View>
        </View>
    )
}