import {
  View,
} from "react-native";
import { Star } from "lucide-react-native";
import { colors } from "../utils/colors";

export default function Rank({ rank, styles }) {
  return (
    <View style={styles.star}>
        {Array.from({length: 5}).map((_, index)=>{
            if(index< rank){
                return(
                    <Star key={index} size={18} fill={colors.color1} color={colors.color1}/>
                )
            }
            else{
                return(
                    <Star key={index} size={18} color={colors.color1}/>
                )
            }
        })}
    </View>
  )}