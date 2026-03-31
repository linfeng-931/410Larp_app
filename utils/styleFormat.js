import { StyleSheet, useColorScheme, } from "react-native";
import { colors } from "./colors";

export const getStyles = (theme) =>{
  const isLight = theme === 'light';
  const primaryColor = isLight ? colors.color2 : colors.color3;
  const oppositeColor = isLight ? colors.color3 : colors.color2;

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
    },
    main:{
      flex: 1,
      paddingTop: 48,
      paddingRight: 32,
      paddingLeft: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: 600,
      borderBottomWidth: 1,
      paddingBottom: 10,
      marginBottom: 50,
    },
    subtitle: {
      fontSize: 18,
      opacity: 0.6,
    },
    btn: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
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
      alignItems: 'center', 
      justifyContent: 'center', 
      color: colors.color1,
    },
    iconBtnDisact:{
      opacity: 0.6,
      alignItems: 'center', 
      justifyContent: 'center', 
      color: primaryColor,
    },
    roundedBtn:{
      width:56,
      height: 56,
      backgroundColor: colors.color1,
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center", 
    },
    iconOfRoundedBtn:{
      color: oppositeColor,
    },
    footer: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
      width: '100%',
      padding: 20,
      backgroundColor: colors.color3,
      shadowColor: colors.color2,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: -3},
      shadowRadius: 5,
      justifyContent: 'space-around',
      alignItems: 'center',
      borderRadius: 30,
    },
})};