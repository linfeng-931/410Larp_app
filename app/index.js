import { TouchableOpacity, Text, View, Image } from "react-native";
import { useState } from "react";
import {styles} from "../utils/styleFormat"
import Footer from "../components/Footer";

export default function Page() {
  return (
    <View style={styles.container}>
        <View style={styles.main}></View>
        <Footer page={1}/>
    </View>
  );
}