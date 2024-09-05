import { StyleSheet, Button, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from "react-native-vision-camera";
import { useWordContext } from "@/context/useWordContext";
import { useFocusEffect } from "expo-router";
import React from "react";
import { useCameraIsActive } from "@/context/useCameraContext";

export default function Detect() {
  const { isActive, setActive } = useCameraIsActive();
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const device = useCameraDevice("front");
  const [isCapturing, setIsCapturing] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { word: selectedWord, setWord: setWordSelected } = useWordContext();
  const similarityRef = useRef<number | null>(null);
  const [counter, setCounter] = useState<number>(10); // Set initial counter value
  const [showModal, setShowModal] = useState<boolean>(true); // Boolean to control modal visibility
  const [goodModal, setGoodModal] = useState<boolean>(false); // Boolean to control modal visibility
  const [loading, setLoading] = useState<boolean>(true);

  const format = useCameraFormat(device, [
    { photoResolution: { width: 540, height: 360 } },
  ]);

  const router = useRouter();

  const restoreDefaultValues = () => {
    setCounter(10);
    setShowModal(false);
    setIsCapturing(false);
    setGoodModal(false);
    setCameraActive(false);
    setLoading(true)
    similarityRef.current = null;
    clearInterval(captureIntervalRef.current!);
  };

  useFocusEffect(
    React.useCallback(() => {
      // Reset all state to default values
      restoreDefaultValues();
      return () => {
        // Cleanup camera reference and other resources
      };
    }, [])
  );

  useEffect(() => {
    if (showModal && counter > 0) {
      const timer = setInterval(() => {
        setCounter((prevCounter) => prevCounter - 1);
      }, 100);

      return () => clearInterval(timer);
    } else if (counter === 0) {
      setShowModal(false);
    }
  }, [showModal, counter]);

  useEffect(() => {
    if (isCapturing) {
      const ws = new WebSocket("ws://172.16.33.24:8080/ws");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to the signaling server");
      };

      ws.onmessage = (msg) => {
        console.log("Received message:", msg.data);
        var percentage = Number(msg.data);
        if (isNaN(percentage)) {
          console.error("Invalid percentage:", msg.data);
          return;
        }
        if (percentage > 70) {
          if (
            similarityRef.current == null ||
            similarityRef.current < percentage
          )
            similarityRef.current = percentage;
          setGoodModal(true);
          ws.close();
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log("Disconnected from signaling server", event);
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
  if (device == null) {
    return <Text>Loading...</Text>;
  }

  const convertirBlobToBase64 = (blob: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const captureAndSend = async () => {
    if (cameraRef.current == null) return;
    try {
      const photo = await cameraRef.current.takePhoto();
      const photoUri = `file://${photo.path}`;
      photo.isMirrored = true;
      photo.orientation = "portrait";

      const base64 = await fetch(photoUri);
      const blob = await base64.blob();
      const base64Image = await convertirBlobToBase64(blob);

      sendImageToServer(base64Image);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log("isActive:", isActive);
    setCameraActive(true);
  }, [isActive]);

  const sendImageToServer = async (base64Image: any) => {
    setTimeout(() => {
      if (wsRef.current == null || wsRef.current.readyState !== WebSocket.OPEN)
        return;
      console.log("Tipo:", selectedWord.index);
      wsRef.current.send(
        JSON.stringify({
          tipo: selectedWord.index,
          data: base64Image,
        })
      );
    }, 1);
  };

  const startCapturing = () => {
    setCameraActive(true);
    console.log("Start capturing");
    setIsCapturing(true);
    captureIntervalRef.current = setInterval(captureAndSend, 50);
  };
  if (selectedWord.word.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message} className="text-2xl">
          No ha seleccionado una palabra
        </Text>
      </SafeAreaView>
    );
  }

  if (goodModal) {
    setTimeout(() => {
      restoreDefaultValues();
      router.push("/");
    }, 5000);
    return (
      <Modal style={styles.modal}>
        <View className="justify-center items-center" style={{ flex: 1 }}>
          <Text className="text-2xl mx-auto m-3">
            {" "}
            Usted ha replicado la seña correctamente
          </Text>
          <Text className="text-3xl mx-auto font-bold mb-3">
            {" "}
            {selectedWord.word}
          </Text>
          <Image
            source={selectedWord.image}
            className="w-32 h-32 rounded-full mb-5"
          />
          <Button
            title="Volver a seleccionar palabra"
            onPress={() => {
              restoreDefaultValues();
              router.push("/");
            }}
          />
        </View>
      </Modal>
    );
  }

  // if (loading){
  //   console.log(isActive)
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.message} className="text-2xl">
  //         Cargando...
  //       </Text>
  //     </View>
  //   )
  //  }else {
    return (
      <SafeAreaView style={styles.container}>
        <Modal visible={goodModal} style={styles.modal}>
          <View className="justify-center items-center" style={{ flex: 1 }}>
            <Text className="text-2xl mx-auto m-3">
              {" "}
              Usted ha replicado la seña correctamente
            </Text>
            <Text className="text-3xl mx-auto font-bold mb-3">
              {" "}
              {selectedWord.word}
            </Text>
            <Image
              source={selectedWord.image}
              className="w-32 h-32 rounded-full mb-5"
            />
            <Button
              title="Volver a seleccionar palabra"
              onPress={() => {
                restoreDefaultValues();
                router.push("/");
              }}
            />
          </View>
        </Modal>
        <Modal visible={showModal} style={styles.modal}>
          <View className="justify-center items-center" style={{ flex: 1 }}>
            <Text className="text-2xl mx-auto m-3">
              {" "}
              Usted ha seleccionado la letra:
            </Text>
            <Text className="text-3xl mx-auto font-bold mb-3">
              {" "}
              {selectedWord.word}
            </Text>
            <Image
              source={selectedWord.image}
              className="w-32 h-32 rounded-full mb-5"
            />
            <Text style={styles.justifiedText}>
              {" "}
              Intente replicar la seña en la camara frontal de su dispositivo{" "}
            </Text>
          </View>
        </Modal>
        {!showModal && (
          <View
            style={styles.container}
            className="justify-center items-center flex-1"
          >
            <Text className="text-2xl">{selectedWord.word}</Text>
            <Camera
              style={styles.camera}
              device={device}
              isActive={isActive}
              pixelFormat="rgb"
              photo={true}
              ref={cameraRef}
              format={format}
              photoQualityBalance="speed"
            />
            <Button title="Start capturing" onPress={startCapturing} />
          </View>
        )}
      </SafeAreaView>
    );
  }


const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    position: "absolute",
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1 / 2,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    height: "50%",
    borderRadius: 500,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  justifiedText: {
    textAlign: "center",
    fontSize: 18, // Adjust the font size as needed
    fontWeight: "600", // Adjust the font weight as needed
    marginHorizontal: 20, // Add horizontal margin if needed
  },
});
