import {
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { getStyles } from "../utils/styleFormat";
import { useState } from "react";
import { colors } from "../utils/colors";

export default function SelectFunc({ colorScheme, placeholder, options }) {
    const styles = getStyles(colorScheme);
    const [value, setValue] = useState("");

    const isLight = colorScheme === 'light';
    const primaryColor = isLight ? colors.color3 : colors.color2;

    return (
        <Dropdown
            placeholder={placeholder}
            placeholderStyle={styles.content3}
            selectedTextStyle={styles.content1}
            containerStyle={{ backgroundColor: primaryColor}}
            itemTextStyle={styles.content1}
            activeColor={primaryColor}
            style={styles.selectFrame}
            data={options}
            labelField="label"
            valueField="value"
            value={value}
            onChange={item => {
                if(item.value === value) setValue("");
                else setValue(item.value);
            }} 

            renderItem={(item) => {
                const isSelected = value === item.value;

                return (
                    <View
                        style={{
                            padding: 12,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={[
                            isSelected? styles.content1 : styles.content3,
                            { 
                                fontWeight: isSelected ? 600 : 400,
                            }
                        ]}>
                            {item.label}
                        </Text>
                    </View>
                );
            }}
        />
    )
}
