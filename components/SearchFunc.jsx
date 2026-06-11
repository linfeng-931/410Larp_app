import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
import { getStyles } from "../utils/styleFormat";
import { useState } from "react";

export default function SearchFunc({ colorScheme, value, onValueChange, defaultValue }) {
  const styles = getStyles(colorScheme);

  return (
    <View style={styles.searchFrame}>
      <Search style={styles.cardIcon} />
      <TextInput
        value={value}
        onChangeText={(text) => {
          onValueChange(text);
        }}
        placeholder={defaultValue}
        placeholderTextColor={`${styles.content3.color}66`}
        style={[styles.content1, { height: "100%" }]}
      />
    </View>
  );
}
