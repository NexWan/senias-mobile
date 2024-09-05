import {StyleSheet, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import {Camera, useCameraDevice, useCameraFormat, useCameraPermission } from 'react-native-vision-camera'
import { useWordContext } from '@/context/useWordContext';

export default function Detect() {
  const device = useCameraDevice('front');
  const [isCapturing, setIsCapturing] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission()  
  const cameraRef = useRef<Camera>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { word: selectedWord, setWord: setWordSelected } = useWordContext();
  const similarityRef = useRef<number | null>(null);

  const format = useCameraFormat(device, [
    { photoResolution: { width: 540, height: 360  } }
  ])
  
  useEffect(() => {
    if (isCapturing) {
      const ws = new WebSocket('ws://172.16.33.24:8080/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to the signaling server');
      };

      ws.onmessage = (msg) => {
        console.log('Received message:', msg.data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('Disconnected from signaling server', event);
        setIsCapturing(false);
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
  }, [isCapturing]);


  if (!hasPermission) 
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No camera permission</Text>
        <Button title="Request permission" onPress={requestPermission} />
      </View>
    );
  if (device == null){ return <Text>Loading...</Text>}

    const convertirBlobToBase64 = (blob: Blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    const captureAndSend = async () => {
      if(cameraRef.current == null) return;
      try {
        const photo = await cameraRef.current.takePhoto();
        const photoUri = `file://${photo.path}`;
        photo.isMirrored=true;
        photo.orientation='portrait';
        
        const base64 = await fetch(photoUri);
        const blob = await base64.blob();
        const base64Image = await convertirBlobToBase64(blob);
    
        sendImageToServer(base64Image);
      }
      catch (error) {
        console.error(error);
      }
    };

    const sendImageToServer = async (base64Image: any) => {
      setTimeout(() => {
        if(wsRef.current == null) return;
        wsRef.current.send(
          JSON.stringify({
            tipo: 0,
            data: base64Image,
          })
        );
      },0);
    }

    const startCapturing = () => {
      console.log('Start capturing');
      setIsCapturing(true)
      captureIntervalRef.current = setInterval(captureAndSend, 50);
    }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container} className='justify-center items-center'>
        <Text>
          {selectedWord}
        </Text>
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          pixelFormat='rgb'
          photo={true}
          ref={cameraRef}
          format={format}
          photoQualityBalance="speed" 
        />
        <Button title="Start capturing" onPress={startCapturing} />
        <Text className='text-2xl ' > {selectedWord} </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1/2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '80%'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
