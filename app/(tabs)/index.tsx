import { Image, StyleSheet, Platform, Button, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import {Camera, Frame, useCameraDevice, useCameraFormat, useCameraPermission, useFrameProcessor, } from 'react-native-vision-camera'
import { Worklets } from 'react-native-worklets-core';

export default function HomeScreen() {
  const device = useCameraDevice('front');
  const [isCapturing, setIsCapturing] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission()  
  const cameraRef = useRef<Camera>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
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
    };

    return () => {
  
    };
  }, []);


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
      //console.log(cameraRef.current);
      if(cameraRef.current == null) return;
      try {
        const photo = await cameraRef.current.takePhoto();
        //console.log(photo);

        const photoUri = `file://${photo.path}`;

        const base64 = await fetch(photoUri);
        const blob = await base64.blob();
        const base64Image = await convertirBlobToBase64(blob);

        sendImageToServer(base64Image);
        //console.log(base64);
      }
      catch (error) {
        console.error(error);
      }
    }

    const sendImageToServer = async (base64Image: any) => {
      setTimeout(() => {
        if(wsRef.current == null) return;
        wsRef.current.send(
          JSON.stringify({
            tipo: 1,
            data: base64Image,
          })
        );
      },10000);
    }

    const startCapturing = () => {
      console.log('Start capturing');
      setIsCapturing(true)
      captureIntervalRef.current = setInterval(captureAndSend, 10000);
    }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        pixelFormat='rgb'
        photo={true}
        ref={cameraRef}
      />

      <Button title="Start capturing" onPress={startCapturing} />
    </View>
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
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
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
