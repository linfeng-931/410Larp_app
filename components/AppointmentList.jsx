import { View, Text, ScrollView, Image } from "react-native";

import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Weekly from "../../components/Weekly";
import HomeBtn from "../../components/HomeBtn";
import Payment from "../../components/Payment";
import Footer from "../../components/Footer";
import { useUser } from "../../utils/userContext";
import { useAppStyles } from "../../utils/useAppStyles";

import { User } from "lucide-react-native";

export default function AppointmentList() {
  const { styles, isLight } = useAppStyles();
  const { user, loading } = useUser();

  return <></>;
}
