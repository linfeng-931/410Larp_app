import { useColorScheme, View } from "react-native";
import { useEffect, useRef } from "react";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { useUser } from "../utils/userContext";

export default function Page() {
  const { user, loading } = useUser();
  const animationRef = useRef(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("subPage/Home");
      } else {
        router.replace("subPage/LogIn");
      }
    }
  }, [loading, user]);

  const splashAnimation =
    colorScheme == "light"
      ? require("../assets/animation/Splash_Screen_White.json")
      : require("../assets/animation/Splash_Screen_Black.json");

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <LottieView
        ref={animationRef}
        source={splashAnimation}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}
