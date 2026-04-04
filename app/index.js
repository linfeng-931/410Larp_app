import { useColorScheme, View } from "react-native";
import { useEffect, useRef } from "react";
import { router } from "expo-router";
import LottieView from "lottie-react-native";

export default function Page() {
  const animationRef = useRef(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("subPage/LogIn");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
