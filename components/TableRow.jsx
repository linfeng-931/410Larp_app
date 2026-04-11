import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppStyles } from "../utils/useAppStyles";

export default function TableRow({
  label,
  price,
  count,
  total,
  isHeader = false,
  isTotal = false,
}) {
  const { styles, isLight } = useAppStyles();
  return (
    <View
      style={[
        styles.row,
        isHeader && styles.headerBorder,
        isTotal && styles.totalRow,
      ]}
    >
      <Text
        style={[
          styles.cell,
          styles.contentCell,
          isHeader && styles.headerText,
          isTotal && styles.totalText,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[styles.cell, styles.priceCell, isHeader && styles.headerText]}
      >
        {price}
      </Text>

      <Text
        style={[styles.cell, styles.countCell, isHeader && styles.headerText]}
      >
        {count}
      </Text>

      <Text
        style={[
          styles.cell,
          styles.totalCell,
          isHeader && styles.headerText,
          isTotal && styles.totalText,
        ]}
      >
        {total}
      </Text>
    </View>
  );
}
