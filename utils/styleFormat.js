import { StyleSheet, Dimensions } from "react-native";
import { colors } from "./colors";
const { width } = Dimensions.get("window");

export const getStyles = (theme) => {
  const isLight = theme === "light";
  const primaryColor = isLight ? colors.color2 : colors.color3;
  const oppositeColor = isLight ? colors.color3 : colors.color2;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: oppositeColor,
    },
    container: {
      flexGrow: 1,
      alignItems: "center",
      paddingBottom: 48,
    },
    main: {
      flex: 1,
      paddingTop: 42,
      width: "100%",
      alignItems: "center",
      gap: 16,
    },
    logInContainer: {
      paddingTop: 64,
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      gap: 32,
    },
    //header
    header: {
      width: "100%",
      paddingHorizontal: 32,
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
    },
    headerButton: {
      backgroundColor: `${colors.color3}BF`,
      borderWidth: 1,
      borderColor: oppositeColor,
      padding: 15,
      borderRadius: 30,

      //iOS 陰影
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,

      //Android
      elevation: 6,
    },

    //font
    bigTitle: {
      fontSize: 36,
      marginTop: 20,
      marginBottom: 40,
      fontFamily: "ChFont",
      color: primaryColor,
    },
    logInTitle: {
      fontSize: 48,
      fontFamily: "Nobills",
      color: primaryColor,
    },
    bigTitleNormal: {
      fontSize: 36,
      fontWeight: 700,
      color: primaryColor,
    },
    title: {
      color: primaryColor,
      fontSize: 18,
      fontWeight: 700,
    },
    content1: {
      color: primaryColor,
      fontSize: 16,
    },
    content2: {
      color: primaryColor,
      fontSize: 16,
      opacity: 0.8,
    },
    content3: {
      color: primaryColor,
      fontSize: 16,
      opacity: 0.4,
    },
    content4: {
      color: primaryColor,
      fontSize: 14,
      opacity: 0.8,
    },
    content5: {
      color: primaryColor,
      fontSize: 24,
      opacity: 0.4,
      fontWeight: 600,
    },
    content6: {
      color: primaryColor,
      fontSize: 24,
      fontWeight: 600,
    },
    content7: {
      color: "#FFA000",
      fontSize: 16,
    },
    warnText: {
      color: "#ff3131",
      fontSize: 14,
    },
    btn: {
      backgroundColor: "#ffffff",
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 30,
      marginBottom: 10,

      // iOS 陰影
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      // Android 陰影
      elevation: 5,
    },

    //footer
    iconBtn: {
      alignItems: "center",
      justifyContent: "center",
      color: colors.color1,
    },
    iconBtnDisact: {
      opacity: 0.6,
      alignItems: "center",
      justifyContent: "center",
      color: primaryColor,
    },
    roundedBtn: {
      width: 56,
      height: 56,
      backgroundColor: colors.color1,
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center",
    },
    iconOfRoundedBtn: {
      color: oppositeColor,
    },
    footer: {
      flexDirection: "row",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
      width: "100%",
      padding: 20,
      backgroundColor: oppositeColor,
      shadowColor: colors.color2,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: -3 },
      shadowRadius: 5,
      justifyContent: "space-around",
      alignItems: "center",
      borderRadius: 30,
    },

    //-------------------------------------components-------------------------------------
    star: {
      flexDirection: "row",
    },

    //card
    card: {
      flexDirection: "column",
      backgroundColor: isLight ? oppositeColor : `${primaryColor}26`,
      borderRadius: 16,
      overflow: "hidden",
      minHeight: 450,
      width: "82%",
    },
    cardHorizantal: {
      flexDirection: "row",
      backgroundColor: isLight ? oppositeColor : `${primaryColor}26`,
      borderRadius: 16,
      overflow: "hidden",
      minHeight: 216,
      width: 320,
    },
    cardContentContainer: {
      top: "50%",
      paddingBottom: 32,
      paddingHorizontal: 15,
      gap: 12,
    },
    cardContentContainerHorizantal: {
      left: "45%",
      width: "55%",
      paddingBottom: 32,
      paddingHorizontal: 15,
      paddingVertical: 15,
      justifyContent: "center",
      gap: 12,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    cardIcon: {
      justifyContent: "center",
      alignItems: "center",
      color: primaryColor,
      opacity: 0.9,
    },
    bottomCroppedImage: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "80%",
      top: "-35%",
      resizeMode: "cover",
    },
    leftCroppedImage: {
      position: "absolute",
      left: 0,
      height: "100%",
      width: "45%",
      resizeMode: "cover",
    },
    cardTagContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    cardTag: {
      backgroundColor: `${primaryColor}26`,
      padding: 3,
      width: 90,
      textAlign: "center",
      borderRadius: 4,
      paddingVertical: 5,
      color: primaryColor,
    },
    cardTagHorizantal: {
      backgroundColor: `${primaryColor}26`,
      width: 68,
      textAlign: "center",
      borderRadius: 4,
      paddingVertical: 5,
      fontSize: 10,
      color: primaryColor,
    },
    cardTagType: {
      backgroundColor: colors.color1,
      padding: 3,
      width: 74,
      textAlign: "center",
      borderRadius: 4,
      paddingVertical: 5,
      color: primaryColor,
      fontSize: 10,
    },
    cardTagTypeHorizantal: {
      position: "absolute",
      backgroundColor: colors.color1,
      width: 72,
      textAlign: "center",
      color: primaryColor,
      fontSize: 10,
      paddingVertical: 6,
      top: 0,
    },

    //PaginationBar
    scrollBarList: {
      flexDirection: "column",
      alignItems: "center",
      height: 490,
    },
    list: {
      alignItems: "center",
      gap: 16,
    },
    dotContainer: {
      flexDirection: "row",
      gap: 8,
    },
    dot: {
      height: 12,
      width: 12,
      borderRadius: 100,
      borderColor: primaryColor,
      opacity: 0.3,
      borderWidth: 1.5,
    },
    dotActive: {
      height: 12,
      width: 12,
      borderRadius: 100,
      borderWidth: 1.5,
      borderColor: colors.color1,
      backgroundColor: colors.color1,
    },
    //inputFrame
    inputFrame: {
      backgroundColor: `${primaryColor}26`,
      width: "100%",
      maxWidth: 338,
      paddingHorizontal: 16,
      flexDirection: "row",
      gap: 24,
      height: 60,
      alignItems: "center",
      borderRadius: 8,
      color: isLight ? "#000" : "#fff",
    },

    //SearchFrame
    searchFrame: {
      backgroundColor: `${primaryColor}26`,
      width: "100%",
      padding: 16,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 24,
      height: 60,
      alignItems: "center",
      borderRadius: 8,
    },
    dropdownContainer: {
      backgroundColor: isLight ? colors.color3 : colors.color4,
      borderWidth: 0,
    },

    //SelectFrame
    selectFrame: {
      backgroundColor: `${primaryColor}26`,
      width: "100%",
      paddingHorizontal: 16,
      gap: 24,
      borderRadius: 8,
      paddingVertical: 15,
      minHeight: 60,
    },
    selectTag: {
      backgroundColor: colors.color1,
      width: 82,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 4,
      paddingVertical: 8,
      fontSize: 10,
      flexDirection: "row",
      gap: 8,
    },
    selectTagFont: {
      color: oppositeColor,
      fontSize: 12,
      fontWeight: 600,
    },
    selectIcon: {
      color: oppositeColor,
    },
    topButton: {
      position: "absolute",
      bottom: 100,
      right: 15,
      backgroundColor: isLight ? `${colors.color3}BF` : `${colors.color4}D9`,
      borderWidth: 1,
      borderColor: oppositeColor,
      padding: 15,
      borderRadius: 30,

      //iOS 陰影
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,

      //Android
      elevation: 6,
    },

    //id
    priceContainer: {
      width: "100%",
      paddingVertical: 24,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
      backgroundColor: isLight ? `${colors.color1}26` : `${colors.color3}26`,
      borderRadius: 8,
    },

    // 註冊
    avatarContainer: { alignSelf: "center", marginVertical: 20 },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: "#bababa",
    },
    cameraBtn: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#FFA000",
      padding: 6,
      borderRadius: 15,
    },
    emptyAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: `${primaryColor}26`,
      alignItems: "center",
      justifyContent: "center",
    },
    textInput: {
      fontSize: 16,
      flex: 1,
      height: "100%",
      paddingVertical: 8,
      color: isLight ? "#000" : "#fff",
    },
    radioRow: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 30,
      gap: 16,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "#FFA000",
      alignItems: "center",
      justifyContent: "center",
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#FFA000",
    },
    iosPickerContainer: {
      backgroundColor: isLight ? "#fff" : "#1A1A1A",
      borderTopColor: isLight ? "#bababa" : "#333",
      borderColor: isLight ? "#bababa" : "#333",
      borderWidth: 1,
      paddingBottom: 20,
      borderRadius: 15,
      marginTop: 10,
      overflow: "hidden",
    },
    toolbar: {
      height: 44,
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingHorizontal: 20,
      backgroundColor: isLight ? "rgb(225, 225, 225)aba" : "#262626",
      borderBottomWidth: 1,
      borderBottomColor: isLight ? "#bababa" : "#333",
    },

    // Weekly
    indicator: {
      position: "absolute",
      bottom: 0,
      width: (width - 128) / 7,
      height: 3,
      backgroundColor: "#FFA000",
      borderRadius: 2,
    },
    dayItem: {
      flex: 1,
      alignItems: "center",
      height: 80,
      justifyContent: "center",
    },
    dateBox: {
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },
    selectedBox: {
      backgroundColor: isLight ? "rgba(255,160,0,0.15)" : "rgba(255,160,0,0.4)",
      borderRadius: 12,
      paddingVertical: 10,
      width: "100%",
      height: "100%",
      alignItems: "center",
    },
    indicator: {
      position: "absolute",
      bottom: 0,
      width: (width - 40) / 7,
      height: 3,
      backgroundColor: "#FFA000",
      borderRadius: 2,
    },
    dot: {
      width: 6,
      height: 6,
      backgroundColor: "#FFA000",
      borderRadius: 3,
      marginTop: 4,
    },

    //Setting
    settingCard: {
      backgroundColor: isLight ? oppositeColor : `${primaryColor}26`,
      borderRadius: 8,
      width: "100%",
      paddingHorizontal: 16,
    },
  });
};
