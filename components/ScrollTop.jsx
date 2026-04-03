import { Pressable } from 'react-native';
import { ChevronUp } from 'lucide-react-native';
import { colors } from '../utils/colors';

export default function ScrollTop({scrollRef, styles}) {
  const onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,  
      animated: true,
    });
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [
            styles.topButton,
            {
                backgroundColor: pressed ? `${colors.color1}BF` : styles.topButton.backgroundColor,
            },
        ]}
        onPress={onPressTouch}
      >
        <ChevronUp style={styles.cardIcon}/>
      </Pressable>
    </>
  );
}