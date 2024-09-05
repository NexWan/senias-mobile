
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWordContext } from '@/context/useWordContext';
import { StyleSheet, Text, TouchableOpacity, Image, FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useState } from 'react';


export default function HomeScreen() {
  const { word: selectedWord, setWord: setWordSelected } = useWordContext();
  const handWord = [
    {word:'A',index: '0', image: require('../../assets/images/hands/A.png')},
    {word:'B',index: '1', image: require('../../assets/images/hands/B.png') },
    {word:'C',index: '2', image: require('../../assets/images/hands/C.png') },
    {word:'D',index: '3', image: require('../../assets/images/hands/D.png') },
    {word:'E',index: '4', image: require('../../assets/images/hands/E.png') },
    {word:'F',index: '5', image: require('../../assets/images/hands/F.png') },
   /* {word:'I',index: '8', image: require('../../assets/images/hands/I.png')},
    {word:'L',index: '9', image: require('../../assets/images/hands/L.png')},
    {word:'M',index: '10', image: require('../../assets/images/hands/M.png')},
    {word:'N',index: '11', image: require('../../assets/images/hands/N.png')},
    {word:'O',index: '12', image: require('../../assets/images/hands/O.png')},
    {word:'P',index: '13', image: require('../../assets/images/hands/P.png')},
    {word:'T',index: '16', image: require('../../assets/images/hands/T.png')},
    {word:'U',index: '17', image: require('../../assets/images/hands/U.png')},
    {word:'V',index: '18', image: require('../../assets/images/hands/V.png')},
    {word:'W',index: '19', image: require('../../assets/images/hands/W.png')},
    {word:'Y',index: '20', image: require('../../assets/images/hands/Y.png')},*/
  ];
  const router = useRouter();
  const [wordString, setWordString] = useState<string>('');

  interface Hand {
    word: string
    image: any
    index: string
  }

  const handlePressedWord = (word: Hand) => {
    setWordSelected(word);
    setWordString(word.word);
    router.push('/detect');
  }

  const renderItem = ({ item }: {item:Hand}) => (
    <TouchableOpacity onPress={() => handlePressedWord(item)}>
      <Image source={item.image} style={styles.image} />
      <Text className='text-xl mx-auto font-bold'>{item.word}</Text>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>
        Para iniciar seleccuiona una letra
      </Text>
      <View style={styles.flatListContainer}>
        <FlatList
          data={handWord}
          renderItem={renderItem}
          keyExtractor={(item) => item.word}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      </View>
      <Text style={styles.selectedWordText}>Selected Word: {wordString}</Text>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  titleText: {
    fontSize: 20,
    marginBottom: 20,
  },
  flatListContainer: {
    height: '60%',
    width: '100%',
  },
  list: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    margin: 10,
  },
  selectedWordText: {
    fontSize: 20,
    marginTop: 20,
  },
});
