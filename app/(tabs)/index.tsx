import { Image, StyleSheet, Platform, Button, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import {Camera, Frame, useCameraDevice, useCameraFormat, useCameraPermission, useFrameProcessor, } from 'react-native-vision-camera'
import { Worklets } from 'react-native-worklets-core';

export default function HomeScreen() {
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission()  
  const wsRef = useRef<WebSocket | null>(null);
  const format = useCameraFormat(device, [
    { videoResolution: { width: 960, height: 600 }, fps: 24, }
  ])

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
      ws.close();
    };
  }, []);

  const sendMessage =  Worklets.createRunOnJS((message: any) => {
    if (wsRef.current) {
      const data = message.toArrayBuffer()
      const dataAsUint = new Uint8Array(data)
      const sendInfo = {
        tipo: 1,
        data: message,
        width: message.width,
        height: message.height,
        channels: 3,
        isValid: message.isValid,
        arreglo: Array.from(dataAsUint)
      }
      wsRef.current.send(JSON.stringify(sendInfo));
    }
  })

  const frameProcesor = useFrameProcessor((frame) => {
    'worklet'
    if (frame.pixelFormat == 'rgb' && frame.isValid) {
      sendMessage(frame);
    }
  }, [])

  if (!hasPermission) 
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No camera permission</Text>
        <Button title="Request permission" onPress={requestPermission} />
      </View>
    );
  if (device == null){ return <Text>Loading...</Text>}
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcesor}
      format={format}
      pixelFormat='rgb'
    />
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
