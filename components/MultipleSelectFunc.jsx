import {
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import { MultiSelect } from 'react-native-element-dropdown';
import { getStyles } from "../utils/styleFormat";
import { useState } from "react";
import { colors } from "../utils/colors";
import { X } from "lucide-react-native";

export default function MultipleSelectFunc({ colorScheme, value, onValueChange }) {
    const styles = getStyles(colorScheme);
    
    const options = [
        { value: '新手入門', label: '新手入門' },
        { value: '硬核推理', label: '硬核推理' },
        { value: '機制陣營', label: '機制陣營' },
        { value: '真相還原', label: '真相還原' },
        { value: '情感沈浸', label: '情感沈浸' },
        { value: '演繹沈浸', label: '演繹沈浸' },
        { value: '恐怖驚悚', label: '恐怖驚悚' },
        { value: '歡樂搞笑', label: '歡樂搞笑' },
        { value: '推理緝兇', label: '推理緝兇' },
        { value: '環繞投影', label: '環繞投影' },
        { value: '城市限定', label: '城市限定' },
        { value: '刑偵緝兇', label: '刑偵緝兇' },
        { value: '開醺派對', label: '開醺派對' },
        { value: 'VR虛擬實境', label: 'VR虛擬實境' },
    ];
    const isLight = colorScheme === 'light';
    const primaryColor = isLight ? colors.color3 : colors.color2;

    return (
        <MultiSelect
            placeholderStyle={styles.content3}
            selectedTextStyle={styles.content1}
            itemTextStyle={styles.content1}
            activeColor={primaryColor}
            style={styles.selectFrame}
            data={options}
            labelField="label"
            valueField="value"
            placeholder={value.length === 0 ? "劇本類型" : ''}
            value={value}
            containerStyle={styles.dropdownContainer}

            alwaysRenderSelectedItem={false}
            visibleSelectedItem={false}

            onChange={(item) => {
                onValueChange(item);
            }}

            renderLeftIcon={(item, unSelect) => {
                if (value.length === 0) return null;
                return(
                <View style={{ gap: 8, flexDirection: 'row', flexWrap:'wrap', width: '90%' }}>
                    {value.map((val) => {
                        const item = options.find(o => o.value === val);
                        if (!item) return null;
                        return (
                            <TouchableOpacity
                                key={val}
                                activeOpacity={0.5}
                                onPress={() => onValueChange(value.filter(v => v !== val))}
                                style={styles.selectTag}
                            >
                                <Text style={styles.selectTagFont}>{item.label}</Text>
                                <X style={styles.selectIcon} size={12} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}}

            renderItem={(item) => {
                const isSelected = value.includes(item.value);

                return (
                    <View style={{
                        padding: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Text style={[
                            isSelected? styles.content1 : styles.content3,
                            { fontWeight: isSelected ? 600 : 400 }
                        ]}>
                            {item.label}
                        </Text>
                    </View>
                );
            }}
        />
    )
}
