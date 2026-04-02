import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const getStyles = (theme) =>{
  const isLight = theme === 'light';
  const primaryColor = isLight ? colors.color2 : colors.color3;
  const oppositeColor = isLight ? colors.color3 : colors.color2;

  return StyleSheet.create({
    safeArea:{
      flex:1,
      backgroundColor: oppositeColor,
    },
    container: {
      flexGrow: 1, 
      alignItems: "center",
      paddingBottom: 48,
    },
    main:{
      flex: 1,
      paddingTop: 48,
      width: '100%',
      alignItems: 'center',
      gap: 16,
    },

    //font
    bigTitle:{
      fontSize: 40, 
      marginTop: 20,
      marginBottom: 40,
      fontFamily: 'ChFont',
      color: primaryColor,
    },
    title: {
      color: primaryColor,
      fontSize: 18,
      fontWeight: 700,
    },
    content1: {
      color: primaryColor,
      fontSize: 14,
    },
    content2: {
      color: primaryColor,
      fontSize: 14,
      opacity: 0.8,
    },
    content3: {
      color: primaryColor,
      fontSize: 14,
      opacity: 0.5,
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
      backgroundColor: oppositeColor,
      shadowColor: colors.color2,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: -3},
      shadowRadius: 5,
      justifyContent: 'space-around',
      alignItems: 'center',
      borderRadius: 30,
    },

    //components
    star:{
      flexDirection: 'row',
    },
    card:{
      flexDirection: 'column',
      backgroundColor: isLight? oppositeColor: `${primaryColor}26`,
      borderRadius: 16,
      overflow: 'hidden',
      minHeight: 450,
      width: 300,
    },
    cardHorizantal:{
      flexDirection: 'row',
      backgroundColor: isLight? oppositeColor: `${primaryColor}26`,
      borderRadius: 16,
      overflow: 'hidden',
      minHeight: 216,
      width: 320,
    },
    cardContentContainer:{
      top: '50%',
      paddingBottom: 32,
      paddingHorizontal: 15,
      gap: 12,
    },
    cardContentContainerHorizantal:{
      left: '45%',
      width: '55%',
      paddingBottom: 32,
      paddingHorizontal: 15,
      paddingVertical: 15,
      justifyContent: 'center',
      gap: 12,
    },
    cardContent:{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    cardIcon:{
      justifyContent: 'center',
      alignItems: 'center',
      color: primaryColor,
      opacity: 0.9,
    },
    bottomCroppedImage: {
      position: 'absolute', 
      left: 0,
      right: 0,
      bottom: 0, 
      height: '80%',          
      top: '-35%',            
      resizeMode: 'cover', 
    },
    leftCroppedImage: {
      position: 'absolute', 
      left: 0,
      height: '100%', 
      width: '45%',                    
      resizeMode: 'cover', 
    },
    cardTagContainer:{
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    cardTag: {
      backgroundColor: `${primaryColor}26`,
      padding: 3,
      width: 90,
      textAlign: 'center',
      borderRadius: 4,
      paddingVertical:5,
      color: primaryColor,
    },
    cardTagHorizantal: {
      backgroundColor: `${primaryColor}26`,
      width: 68,
      textAlign: 'center',
      borderRadius: 4,
      paddingVertical:5,
      fontSize: 10,
      color: primaryColor,
    },
    cardTagType:{
      backgroundColor: colors.color1,
      padding: 3,
      width: 74,
      textAlign: 'center',
      borderRadius: 4,
      paddingVertical:5,
      color: primaryColor,
      fontSize: 10,
    },
    cardTagTypeHorizantal:{
      position: 'absolute', 
      backgroundColor: colors.color1,
      width: 72,
      textAlign: 'center',
      color: primaryColor,
      fontSize: 10,
      paddingVertical:6,
      top: 0,
    },
    scrollBarList:{
      flexDirection: 'column',
      alignItems: 'center',
      height: 490,
    },
    list:{
      alignItems: 'center',
      gap: 16,
    },
    dotContainer:{
      flexDirection: 'row',
      gap: 8,
    },
    dot:{
      height: 12,
      width: 12,
      borderRadius: 100,
      borderColor: primaryColor,
      opacity: 0.3,
      borderWidth: 1.5,
    },
    dotActive:{
      height: 12,
      width: 12,
      borderRadius: 100,
      borderWidth: 1.5,
      borderColor: colors.color1,
      backgroundColor: colors.color1,
    }
})};