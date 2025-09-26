import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Paho from "paho-mqtt";

import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Modal,
  LogBox,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";
import { Feather } from "@expo/vector-icons";

import { Slider } from "@rneui/base";

export default function Welcome() {
  // Estados para os switches
  const [canaLigada, setCanaLigada] = useState(false);
  const [cacauLigada, setCacauLigada] = useState(false);
  const [leiteLigada, setLeiteLigada] = useState(false);
  const [tanque1Ligada, setTanque1Ligada] = useState(false);
  const [tanque2Ligada, setTanque2Ligada] = useState(false);

  const [value1, setValue1] = useState(Number);
  const [value2, setValue2] = useState(Number);
  const [value3, setValue3] = useState(Number);
  const [value4, setValue4] = useState(Number);
  const [value5, setValue5] = useState(Number);
  const [value6, setValue6] = useState(Number);
  const [value7, setValue7] = useState(Number);
  const [value8, setValue8] = useState(Number);

  const [fillValve, setFillValve] = useState(0);
  const [dischargeValve, setDischargeValve] = useState(0);

  const [modalVisibleTanque1, setModalVisibleTanque1] = useState(false);
  const [modalVisibleTanque2, setModalVisibleTanque2] = useState(false);

  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);
  const [dropdown3Open, setDropdown3Open] = useState(false);

  const [broker, setBroker] = useState(null);
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);

  const [payload1, setPayload1] = useState({
    mode: "",
    fill_speed: Math.round(value1 * 100) / 100,
    empty_speed: Math.round(value2 * 100) / 100,
  });
  const [payload2, setPayload2] = useState({
    mode: "",
    fill_speed: value7,
    empty_speed: value8,
  });

  useEffect(() => {
    LogBox.ignoreLogs([
      "Warning: Slider: Support for defaultProps will be removed from function components in a future major release.",
    ]);
  }, []);

  useEffect(() => {
    const fetchBrokerData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@brokerConfig");
        console.log(jsonValue);
        if (jsonValue != null) {
          const data = JSON.parse(jsonValue);
          setBroker(data);
        } else {
          // Valores padrão
          const defaultConfig = {
            ip_address: "127.0.0.1",
            port: "1884",
            username: "thiago",
            password: "mestre",
          };
          setBroker(defaultConfig);
          await AsyncStorage.setItem(
            "@brokerConfig",
            JSON.stringify(defaultConfig)
          );
        }
      } catch (error) {
        console.error("Erro ao buscar configuração do broker: ", error);
      }
    };

    fetchBrokerData();
  }, []);

  useEffect(() => {
    if (broker) {
      const mqttClient = new Paho.Client(
        broker.ip_address,
        Number(broker.port),
        `id_ufpe-${parseInt(Math.random() * 100)}`
      );

      mqttClient.connect({
        onSuccess: () => {
          setConnected(true);
          setClient(mqttClient);
          console.log("Conectado com sucesso!");
          mqttClient.subscribe("milk_tank_level");
          mqttClient.subscribe("chocolate_tank_level");
          mqttClient.subscribe("sugar_items");
          mqttClient.subscribe("cocoa_items");

          mqttClient.onMessageArrived = (message) => {
            console.log("Mensagem recebida:", message.payloadString);
            handleMqttMessage(message); // Chama a função de tratamento de mensagens
          };
        },
        onFailure: (error) => console.error("Falha ao conectar!", error),
        userName: broker.username,
        password: broker.password,
      });

      return () => {
        if (mqttClient.isConnected()) mqttClient.disconnect();
      };
    }
  }, [broker]);

  const handleMqttMessage = (message) => {
    const topic = message.destinationName;
    const payload = parseFloat(message.payloadString);

    if (topic === "milk_tank_level") {
      setValue3((payload * 100).toFixed(2));
      console.log(value3.toFixed(2));
    } else if (topic === "chocolate_tank_level") {
      setValue4((payload * 100).toFixed(2));
      console.log(value4.toFixed(2));
    } else if (topic === "sugar_items") {
      setValue5(payload);
      console.log(value5);
    } else if (topic === "cocoa_items") {
      setValue6(payload);
      console.log(value6);
    }
  };

  const sendMqttMessage = (topic, message) => {
    if (client && client.isConnected()) {
      const mqttMessage = new Paho.Message(
        typeof message === "object" ? JSON.stringify(message) : message
      );

      if (typeof message === "object") {
        if (message.fill_speed !== undefined) {
          message.fill_speed = Math.round(message.fill_speed * 100) / 100;
        }
        if (message.empty_speed !== undefined) {
          message.empty_speed = Math.round(message.empty_speed * 100) / 100;
        }
      }

      mqttMessage.destinationName = topic;
      client.send(mqttMessage);
      console.log(
        `Mensagem enviada para o tópico ${topic}: ${mqttMessage.payloadString}`
      );
    } else {
      console.error("Cliente MQTT não está conectado.");
    }
  };

  const handleSliderChange = (payload, type) => {
    if (type === "milk_tank_config") {
      setFillValve(payload.fill_speed); // Atualiza o estado do valve
      sendMqttMessage("milk_tank_config", payload); // Envia o payload via MQTT
    } else if (type === "chocolate_tank_config") {
      setDischargeValve(payload.fill_speed); // Atualiza o valve do tanque de chocolate
      sendMqttMessage("chocolate_tank_config", payload); // Envia o outro payload
    }
    // Publicar a mensagem via MQTT e atualizar o banco de dados
  };

  const openModalTanque1 = () => {
    setModalVisibleTanque1(true);
  };

  const openModalTanque2 = () => {
    setModalVisibleTanque2(true);
  };

  const closeModal = () => {
    setModalVisibleTanque1(false);
    setModalVisibleTanque2(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerHeader}>
        <Animatable.View animation="fadeInDown" delay={500}>
          <Image
            style={styles.logo}
            source={require("../../../assets/icon.png")}
          />
        </Animatable.View>
        <Animatable.View
          animation="fadeInUp"
          style={styles.containerDispositivos}
        >
          <Feather style={styles.icon} name="package" size={24} color="#fff" />
          <Text style={styles.textDispositivos}>Minecraft</Text>
        </Animatable.View>
      </View>

      <ScrollView contentContainerStyle={styles.containerForm}>
        {/* Dropdown 1 - Cana-de-Açúcar */}
        <TouchableOpacity onPress={() => setDropdown1Open(!dropdown1Open)}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownText}>Colheita de Cana-de-Açúcar</Text>
            <Icon
              name={dropdown1Open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#333"
            />
          </View>
        </TouchableOpacity>
        {dropdown1Open && (
          <View style={styles.dropdownContent}>
            <Text style={{ marginTop: 10 }}>Volume de produção:</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 15,
              }}
            >
              <Image source={require("../../assets/Menu/cana.png")} />
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {value5} un.{"\n"} /seg
              </Text>
            </View>
            <Text>Liga/Desliga:</Text>
            <View>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    styles.switchLeft,
                    canaLigada && { backgroundColor: "#693B8F" },
                  ]}
                  onPress={() => [
                    setCanaLigada(true),
                    sendMqttMessage("sugar_enable", "true"),
                  ]}
                >
                  <Text
                    style={[
                      styles.switchText,
                      canaLigada && { color: "#f0f0f0" },
                      !canaLigada && { color: "#fff" },
                    ]}
                  >
                    Ligar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    styles.switchRight,
                    !canaLigada && { backgroundColor: "#693B8F" },
                  ]}
                  onPress={() => [
                    setCanaLigada(false),
                    sendMqttMessage("sugar_enable", "false"),
                  ]}
                >
                  <Text
                    style={[
                      styles.switchText,
                      !canaLigada && { color: "#f0f0f0" },
                    ]}
                  >
                    Desligar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Dropdown 2 - Cacau */}
        <TouchableOpacity onPress={() => setDropdown2Open(!dropdown2Open)}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownText}>Colheita de Cacau</Text>
            <Icon
              name={dropdown2Open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#333"
            />
          </View>
        </TouchableOpacity>
        {dropdown2Open && (
          <View style={styles.dropdownContent}>
            <Text style={{ marginTop: 10 }}>Volume de produção:</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 15,
              }}
            >
              <Image source={require("../../assets/Menu/cacau.png")} />
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {value6} un.{"\n"} /seg
              </Text>
            </View>
            <Text>Liga/Desliga:</Text>
            <View>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    styles.switchLeft,
                    cacauLigada && { backgroundColor: "#693B8F" },
                  ]}
                  onPress={() => [
                    setCacauLigada(true),
                    sendMqttMessage("cocoa_enable", "true"),
                  ]}
                >
                  <Text
                    style={[
                      styles.switchText,
                      cacauLigada && { color: "#f0f0f0" },
                      !cacauLigada && { color: "#fff" },
                    ]}
                  >
                    Ligar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    styles.switchRight,
                    !cacauLigada && { backgroundColor: "#693B8F" },
                  ]}
                  onPress={() => [
                    setCacauLigada(false),
                    sendMqttMessage("cocoa_enable", "false"),
                  ]}
                >
                  <Text
                    style={[
                      styles.switchText,
                      !cacauLigada && { color: "#f0f0f0" },
                    ]}
                  >
                    Desligar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Dropdown 3 - Leite */}
        <TouchableOpacity onPress={() => setDropdown3Open(!dropdown3Open)}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownText}>Produção de Leite</Text>
            <Icon
              name={dropdown3Open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#333"
            />
          </View>
        </TouchableOpacity>
        {dropdown3Open && (
          <View style={styles.dropdownContent}>
            <Text style={{ marginTop: 10 }}>Volume de produção:</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 15,
              }}
            >
              <Image source={require("../../assets/Menu/leite.png")} />
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                50 un.{"\n"} /seg
              </Text>
            </View>
            <Text style={{ marginTop: 10 }}>Liga/Desliga:</Text>
            <View>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    styles.switchLeft,
                    leiteLigada && { backgroundColor: "#693B8F" },
                  ]}
                  onPress={() => [
                    setLeiteLigada(true),
                    sendMqttMessage("milk_enable", "true"),
                  ]}
                >
                  <Text
                    style={[
                      styles.switchText,
                      leiteLigada && { color: "#f0f0f0" },
                      !leiteLigada && { color: "#fff" },
                    ]}
                  >
                    Ligar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    styles.switchRight,
                    !leiteLigada && { backgroundColor: "#693B8F" },
                  ]}
                  onPress={() => [
                    setLeiteLigada(false),
                    sendMqttMessage("milk_enable", "false"),
                  ]}
                >
                  <Text
                    style={[
                      styles.switchText,
                      !leiteLigada && { color: "#f0f0f0" },
                    ]}
                  >
                    Desligar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        {/* Botões abaixo dos dropdowns */}
        <View style={styles.dropdownHeader}>
          <Text style={styles.dropdownText}>Armazenamento de Leite</Text>
        </View>
        <View style={styles.bannerControle}>
          <TouchableOpacity onPress={openModalTanque1}>
            <ImageBackground
              source={require("../../assets/Menu/tanqueLeite.png")}
              style={styles.controlButton}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.dropdownHeader}>
          <Text style={styles.dropdownText}>Armazenamento de Chocolate</Text>
        </View>
        <View style={styles.bannerControle}>
          <TouchableOpacity onPress={openModalTanque2}>
            <ImageBackground
              source={require("../../assets/Menu/tanqueChoco.png")}
              style={styles.controlButton}
            />
          </TouchableOpacity>
        </View>

        {/* Modal para Tanque Leite */}
        <Modal
          visible={modalVisibleTanque1}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text
                  style={{ fontSize: 16, color: "#fff", fontWeight: "bold" }}
                >
                  Confirmar
                </Text>
              </TouchableOpacity>
              <Text style={styles.modalTextTitle}>Tanque de Leite</Text>
              <Text style={styles.modalTextDescription}>
                Gerenciamento do conjunto de sensores e atuadores do tanque.
              </Text>
              <Text
                style={{
                  position: "absolute",
                  top: 110,
                  left: 5,
                  padding: 20,
                }}
              >
                Nível dos tanques
              </Text>
              <View
                style={{ flexDirection: "row", justifyContent: "space-araund" }}
              >
                <View style={styles.tank}>
                  <View style={[styles.fill, { height: `${value3}%` }]} />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    top: 130,
                    left: 30,
                  }}
                >
                  {value3}%{"\n"}
                </Text>
              </View>
              <Text
                style={{
                  position: "absolute",
                  top: 350,
                  left: 5,
                  padding: 20,
                }}
              >
                Modo de operação:
              </Text>
              <View style={{ marginTop: 20 }}>
                <View style={styles.switchContainer}>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      styles.switchLeft,
                      tanque1Ligada && { backgroundColor: "#693B8F" },
                    ]}
                    onPress={() => {
                      setTanque1Ligada(true);
                      setPayload1((prevPayload) => ({
                        ...prevPayload,
                        mode: "auto",
                      }));
                      sendMqttMessage("milk_tank_config", {
                        ...payload1,
                        mode: "auto",
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        tanque1Ligada && { color: "#f0f0f0" },
                        !tanque1Ligada && { color: "#fff" },
                      ]}
                    >
                      Automático
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      styles.switchRight,
                      !tanque1Ligada && { backgroundColor: "#693B8F" },
                    ]}
                    onPress={() => {
                      setTanque1Ligada(false);
                      setPayload1((prevPayload) => ({
                        ...prevPayload,
                        mode: "manual",
                      }));
                      sendMqttMessage("milk_tank_config", {
                        ...payload1,
                        mode: "manual",
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        !tanque1Ligada && { color: "#f0f0f0" },
                      ]}
                    >
                      Manual
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ marginTop: 10 }}></View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  right: 48,
                }}
              >
                <Text>Encher os tanques: </Text>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {" "}
                  {(payload1.fill_speed * 100).toFixed(2)}L/s
                </Text>
              </View>
              <Slider
                maximumTrackTintColor="#ccc"
                maximumValue={100}
                minimumTrackTintColor="#693B8F"
                minimumValue={0}
                onSlidingComplete={() => console.log("onSlidingComplete()")}
                onSlidingStart={() => console.log("onSlidingStart()")}
                onValueChange={(value) => {
                  const rounded = Math.round(value);
                  const scaledValue = Number((rounded / 100).toFixed(2)); // Escala de 0-100 para 0-1
                  setValue1(scaledValue); // Atualiza o estado visual com o valor escalado
                  setPayload1((prevPayload) => {
                    const updatedPayload = {
                      ...prevPayload,
                      fill_speed: scaledValue, // Atualiza o fill_speed no payload escalado
                    };

                    handleSliderChange(updatedPayload, "milk_tank_config"); // Envia o objeto atualizado com o valor escalado
                    return updatedPayload; // Retorna o payload atualizado para o estado
                  });
                }}
                orientation="horizontal"
                step={1}
                style={{ width: "80%" }}
                thumbStyle={{ height: 20, width: 20 }}
                thumbTintColor="#f0f0f0"
                thumbTouchSize={{ width: 80, height: 80 }}
                // trackStyle={{ height: 10, borderRadius: 20 }}
                value={Math.round(payload1.fill_speed * 100)} // Exibe o valor de 0-1 como 0-100 no slider
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  right: 18,
                }}
              >
                <Text>Esvaziamento dos tanques: </Text>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {" "}
                  {payload1.empty_speed.toFixed(2)}L/s
                </Text>
              </View>
              <Slider
                maximumTrackTintColor="#ccc"
                maximumValue={100}
                minimumTrackTintColor="#693B8F"
                minimumValue={0}
                onSlidingComplete={() => console.log("onSlidingComplete()")}
                onSlidingStart={() => console.log("onSlidingStart()")}
                onValueChange={(value) => {
                  const rounded = Math.round(value);
                  const scaledValue = Number((rounded / 100).toFixed(2)); // Escala de 0-100 para 0-1
                  setValue2(scaledValue); // Atualiza o estado visual com o valor escalado
                  setPayload1((prevPayload) => {
                    const updatedPayload = {
                      ...prevPayload,
                      empty_speed: scaledValue, // Atualiza o fill_speed no payload escalado
                    };

                    handleSliderChange(updatedPayload, "milk_tank_config"); // Envia o objeto atualizado com o valor escalado
                    return updatedPayload; // Retorna o payload atualizado para o estado
                  });
                }}
                orientation="horizontal"
                step={1}
                style={{ width: "80%" }}
                thumbStyle={{ height: 20, width: 20 }}
                thumbTintColor="#f0f0f0"
                thumbTouchSize={{ width: 80, height: 80 }}
                // trackStyle={{ height: 10, borderRadius: 20 }}
                value={Math.round(payload1.empty_speed * 100)} // Exibe o valor de 0-1 como 0-100 no slider
              />
            </View>
          </View>
        </Modal>

        {/* Modal para Tanque Chocolate */}
        <Modal
          visible={modalVisibleTanque2}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text
                  style={{ fontSize: 16, color: "#fff", fontWeight: "bold" }}
                >
                  Confirmar
                </Text>
              </TouchableOpacity>
              <Text style={styles.modalTextTitle}>Tanque de Chocolate</Text>
              <Text style={styles.modalTextDescription}>
                Gerenciamento do conjunto de sensores e atuadores do tanque.
              </Text>
              <Text
                style={{
                  position: "absolute",
                  top: 110,
                  left: 5,
                  padding: 20,
                }}
              >
                Nível dos tanques
              </Text>
              <View
                style={{ flexDirection: "row", justifyContent: "space-araund" }}
              >
                <View style={styles.tank}>
                  <View
                    style={[
                      styles.fill,
                      { height: `${value4}%`, backgroundColor: "#904C04" },
                    ]}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    top: 130,
                    left: 30,
                  }}
                >
                  {value4}%{"\n"}
                </Text>
              </View>
              <Text
                style={{
                  position: "absolute",
                  top: 350,
                  left: 5,
                  padding: 20,
                }}
              >
                Modo de operação:
              </Text>
              <View style={{ marginTop: 20 }}>
                <View style={styles.switchContainer}>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      styles.switchLeft,
                      tanque2Ligada && { backgroundColor: "#693B8F" },
                    ]}
                    onPress={() => {
                      setTanque2Ligada(true);
                      setPayload2((prevPayload) => ({
                        ...prevPayload,
                        mode: "auto",
                      }));
                      sendMqttMessage("chocolate_tank_config", {
                        ...payload2,
                        mode: "auto",
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        tanque2Ligada && { color: "#f0f0f0" },
                        !tanque2Ligada && { color: "#fff" },
                      ]}
                    >
                      Automático
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      styles.switchRight,
                      !tanque2Ligada && { backgroundColor: "#693B8F" },
                    ]}
                    onPress={() => {
                      setTanque2Ligada(false);
                      setPayload2((prevPayload) => ({
                        ...prevPayload,
                        mode: "manual",
                      }));
                      sendMqttMessage("chocolate_tank_config", {
                        ...payload1,
                        mode: "manual",
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        !tanque2Ligada && { color: "#f0f0f0" },
                      ]}
                    >
                      Manual
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ marginTop: 10 }}></View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  right: 48,
                }}
              >
                <Text>Encher os tanques: </Text>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {" "}
                  {payload2.fill_speed}L/s
                </Text>
              </View>
              <Slider
                maximumTrackTintColor="#ccc"
                maximumValue={100}
                minimumTrackTintColor="#693B8F"
                minimumValue={0}
                onSlidingComplete={() => console.log("onSlidingComplete()")}
                onSlidingStart={() => console.log("onSlidingStart()")}
                onValueChange={(value) => {
                  const rounded = Math.round(value);
                  const scaledValue = Number((rounded / 100).toFixed(2)); // Escala de 0-100 para 0-1
                  setValue7(scaledValue); // Atualiza o estado visual com o valor escalado
                  setPayload2((prevPayload) => {
                    const updatedPayload = {
                      ...prevPayload,
                      fill_speed: scaledValue, // Atualiza o fill_speed no payload escalado
                    };

                    handleSliderChange(updatedPayload, "chocolate_tank_config"); // Envia o objeto atualizado com o valor escalado
                    return updatedPayload; // Retorna o payload atualizado para o estado
                  });
                }}
                orientation="horizontal"
                step={1}
                style={{ width: "80%" }}
                thumbStyle={{ height: 20, width: 20 }}
                thumbTintColor="#f0f0f0"
                thumbTouchSize={{ width: 80, height: 80 }}
                // trackStyle={{ height: 10, borderRadius: 20 }}
                value={Math.round(payload2.fill_speed * 100)} // Exibe o valor de 0-1 como 0-100 no slider
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  right: 18,
                }}
              >
                <Text>Esvaziamento dos tanques: </Text>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {" "}
                  {payload2.empty_speed.toFixed(2)}L/s
                </Text>
              </View>
              <Slider
                maximumTrackTintColor="#ccc"
                maximumValue={100}
                minimumTrackTintColor="#693B8F"
                minimumValue={0}
                onSlidingComplete={() => console.log("onSlidingComplete()")}
                onSlidingStart={() => console.log("onSlidingStart()")}
                onValueChange={(value) => {
                  const rounded = Math.round(value);
                  const scaledValue = Number((rounded / 100).toFixed(2)); // Escala de 0-100 para 0-1
                  setValue8(scaledValue); // Atualiza o estado visual com o valor escalado
                  setPayload2((prevPayload) => {
                    const updatedPayload = {
                      ...prevPayload,
                      empty_speed: scaledValue, // Atualiza o fill_speed no payload escalado
                    };

                    handleSliderChange(updatedPayload, "chocolate_tank_config"); // Envia o objeto atualizado com o valor escalado
                    return updatedPayload; // Retorna o payload atualizado para o estado
                  });
                }}
                orientation="horizontal"
                step={1}
                style={{ width: "80%" }}
                thumbStyle={{ height: 20, width: 20 }}
                thumbTintColor="#f0f0f0"
                thumbTouchSize={{ width: 80, height: 80 }}
                // trackStyle={{ height: 10, borderRadius: 20 }}
                value={Math.round(payload1.empty_speed * 100)} // Exibe o valor de 0-1 como 0-100 no slider
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1374BA",
  },
  containerHeader: {
    marginTop: "10%",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  containerForm: {
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    flexGrow: 1,
  },
  containerDispositivos: {
    backgroundColor: "#66BB9F",
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  textDispositivos: {
    fontSize: 18,
    color: "#FFF",
  },
  dropdownHeader: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  dropdownContent: {
    backgroundColor: "#fff",
    // padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: "90%",
    // height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerControle: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    // paddingHorizontal: 16,
    // marginTop: 20,
  },
  controlButton: {
    width: 159.5,
    height: 160,
    marginTop: 16,
  },
  switchContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: 290, // largura total dos dois botões
    height: 76,
  },
  switchButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    width: 250, // largura total dos dois botões
    height: 46,
  },
  switchLeft: {
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    width: 250, // largura total dos dois botões
    // height: 56,
  },
  switchRight: {
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    width: 250, // largura total dos dois botões
    // height: 56,
  },
  switchText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#A4A4A4",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 350,
    height: 700,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  modalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    bottom: 20,
    padding: 10,
    backgroundColor: "#693B8F",
    width: 250,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  modalTextTitle: {
    position: "absolute",
    top: 20,
    left: 5,
    padding: 20,
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalTextDescription: {
    position: "absolute",
    top: 50,
    left: 5,
    padding: 20,
    color: "#000",
    fontSize: 14,
  },
  modalText: {
    position: "absolute",
    top: 150,
    left: 5,
    padding: 20,
    color: "#000",
    fontSize: 14,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginVertical: 20,
  },

  controlButtonModal: {
    width: 80,
    height: 80,
  },

  modalTextSubTitle: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  controlRow: {
    flexDirection: "row", // Organiza as colunas lado a lado
    justifyContent: "space-between", // Espaçamento entre as colunas
    marginTop: 70, // Ajuste conforme necessário
  },
  controlColumn: {
    flexDirection: "column", // Organiza os botões em coluna
    justifyContent: "space-between", // Espaçamento entre os botões dentro da coluna
    alignItems: "center", // Centraliza os botões na coluna
  },
  controleButton: {
    width: 80,
    height: 80,
    marginVertical: 10,
    marginHorizontal: 30,
  },

  tankInfo: {
    marginTop: 10,
    alignItems: "center",
  },
  tankInfoText: {
    fontSize: 16,
    marginVertical: 5,
  },
  trackStyle: {
    height: 10, // Aumentar a altura da trilha (grossura)
    borderRadius: 5, // Arredondar a trilha
  },
  thumbStyle: {
    height: 30, // Altura da bolinha
    width: 30, // Largura da bolinha
    backgroundColor: "#693B8F", // Cor da bolinha
    borderRadius: 15, // Deixar a bolinha redonda
  },
  tank: {
    marginTop: 55,
    width: 100,
    height: 200,
    right: 30,
    borderWidth: 2,
    borderColor: "#BF5A44",
    justifyContent: "flex-end", // Preencher de baixo para cima
    backgroundColor: "#401C14", // Fundo branco para o tanque
  },
  fill: {
    width: "100%",
    backgroundColor: "#f0f0f0", // Cor padrão do nível do tanque
    transition: "background-color 0.5s ease", // Para animação suave (se suportado)
  },
});
