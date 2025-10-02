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
            source={require("../../../assets/logo_2025.png")}
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
        {/* Widget 1 - Cana-de-Açúcar */}
        <View style={styles.widget}>
          <View style={styles.widgetHeader}>
            <Image source={require("../../assets/Menu/cana.png")} style={styles.widgetIcon} />
            <View style={styles.widgetTitleContainer}>
              <Text style={styles.widgetTitle}>Cana-de-Açúcar</Text>
              <Text style={styles.widgetSubtitle}>Colheita automática</Text>
            </View>
            <View style={styles.widgetStatus}>
              <View style={[styles.statusIndicator, canaLigada && styles.statusActive]} />
              <Text style={styles.statusText}>{canaLigada ? 'ON' : 'OFF'}</Text>
            </View>
          </View>
          
          <View style={styles.widgetContent}>
            <View style={styles.productionInfo}>
              <Text style={styles.productionLabel}>Produção atual:</Text>
              <Text style={styles.productionValue}>{value5} un/seg</Text>
            </View>
            
            <View style={styles.widgetSwitchContainer}>
              <TouchableOpacity
                style={[
                  styles.widgetSwitchButton,
                  styles.switchLeft,
                  canaLigada && styles.widgetSwitchActive,
                ]}
                onPress={() => [
                  setCanaLigada(true),
                  sendMqttMessage("sugar_enable", "true"),
                ]}
              >
                <Text style={[styles.widgetSwitchText, canaLigada && styles.widgetSwitchTextActive]}>
                  Ligar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.widgetSwitchButton,
                  styles.switchRight,
                  !canaLigada && styles.widgetSwitchActive,
                ]}
                onPress={() => [
                  setCanaLigada(false),
                  sendMqttMessage("sugar_enable", "false"),
                ]}
              >
                <Text style={[styles.widgetSwitchText, !canaLigada && styles.widgetSwitchTextActive]}>
                  Desligar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Widget 2 - Cacau */}
        <View style={styles.widget}>
          <View style={styles.widgetHeader}>
            <Image source={require("../../assets/Menu/cacau.png")} style={styles.widgetIcon} />
            <View style={styles.widgetTitleContainer}>
              <Text style={styles.widgetTitle}>Cacau</Text>
              <Text style={styles.widgetSubtitle}>Colheita automática</Text>
            </View>
            <View style={styles.widgetStatus}>
              <View style={[styles.statusIndicator, cacauLigada && styles.statusActive]} />
              <Text style={styles.statusText}>{cacauLigada ? 'ON' : 'OFF'}</Text>
            </View>
          </View>
          
          <View style={styles.widgetContent}>
            <View style={styles.productionInfo}>
              <Text style={styles.productionLabel}>Produção atual:</Text>
              <Text style={styles.productionValue}>{value6} un/seg</Text>
            </View>
            
            <View style={styles.widgetSwitchContainer}>
              <TouchableOpacity
                style={[
                  styles.widgetSwitchButton,
                  styles.switchLeft,
                  cacauLigada && styles.widgetSwitchActive,
                ]}
                onPress={() => [
                  setCacauLigada(true),
                  sendMqttMessage("cocoa_enable", "true"),
                ]}
              >
                <Text style={[styles.widgetSwitchText, cacauLigada && styles.widgetSwitchTextActive]}>
                  Ligar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.widgetSwitchButton,
                  styles.switchRight,
                  !cacauLigada && styles.widgetSwitchActive,
                ]}
                onPress={() => [
                  setCacauLigada(false),
                  sendMqttMessage("cocoa_enable", "false"),
                ]}
              >
                <Text style={[styles.widgetSwitchText, !cacauLigada && styles.widgetSwitchTextActive]}>
                  Desligar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Widget 3 - Leite */}
        <View style={styles.widget}>
          <View style={styles.widgetHeader}>
            <Image source={require("../../assets/Menu/leite.png")} style={styles.widgetIcon} />
            <View style={styles.widgetTitleContainer}>
              <Text style={styles.widgetTitle}>Leite</Text>
              <Text style={styles.widgetSubtitle}>Produção automática</Text>
            </View>
            <View style={styles.widgetStatus}>
              <View style={[styles.statusIndicator, leiteLigada && styles.statusActive]} />
              <Text style={styles.statusText}>{leiteLigada ? 'ON' : 'OFF'}</Text>
            </View>
          </View>
          
          <View style={styles.widgetContent}>
            <View style={styles.productionInfo}>
              <Text style={styles.productionLabel}>Produção atual:</Text>
              <Text style={styles.productionValue}>50 un/seg</Text>
            </View>
            
            <View style={styles.widgetSwitchContainer}>
              <TouchableOpacity
                style={[
                  styles.widgetSwitchButton,
                  styles.switchLeft,
                  leiteLigada && styles.widgetSwitchActive,
                ]}
                onPress={() => [
                  setLeiteLigada(true),
                  sendMqttMessage("milk_enable", "true"),
                ]}
              >
                <Text style={[styles.widgetSwitchText, leiteLigada && styles.widgetSwitchTextActive]}>
                  Ligar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.widgetSwitchButton,
                  styles.switchRight,
                  !leiteLigada && styles.widgetSwitchActive,
                ]}
                onPress={() => [
                  setLeiteLigada(false),
                  sendMqttMessage("milk_enable", "false"),
                ]}
              >
                <Text style={[styles.widgetSwitchText, !leiteLigada && styles.widgetSwitchTextActive]}>
                  Desligar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Widget 4 - Tanque de Leite */}
        <TouchableOpacity style={styles.tankWidget} onPress={openModalTanque1}>
          <View style={styles.tankWidgetHeader}>
            <View style={styles.tankImageContainer}>
              <ImageBackground
                source={require("../../assets/Menu/novoTanqueLeite.png")}
                style={styles.tankImage}
                imageStyle={styles.tankImageStyle}
              />
            </View>
            <View style={styles.tankInfoContainer}>
              <Text style={styles.tankTitle}>Tanque de Leite</Text>
              <Text style={styles.tankSubtitle}>Armazenamento e controle</Text>
              <View style={styles.tankLevelContainer}>
                <Text style={styles.tankLevelLabel}>Nível atual:</Text>
                <Text style={styles.tankLevelValue}>{value3}%</Text>
              </View>
            </View>
            <View style={styles.tankStatusContainer}>
              <View style={styles.tankLevelIndicator}>
                <View style={[styles.tankLevelBar, { height: `${Math.min(value3, 100)}%` }]} />
              </View>
              <Text style={styles.tankModeText}>
                {tanque1Ligada ? 'AUTO' : 'MANUAL'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Widget 5 - Tanque de Chocolate */}
        <TouchableOpacity style={styles.tankWidget} onPress={openModalTanque2}>
          <View style={styles.tankWidgetHeader}>
            <View style={styles.tankImageContainer}>
              <ImageBackground
                source={require("../../assets/Menu/novoTanqueChoco.png")}
                style={styles.tankImage}
                imageStyle={styles.tankImageStyle}
              />
            </View>
            <View style={styles.tankInfoContainer}>
              <Text style={styles.tankTitle}>Tanque de Chocolate</Text>
              <Text style={styles.tankSubtitle}>Armazenamento e controle</Text>
              <View style={styles.tankLevelContainer}>
                <Text style={styles.tankLevelLabel}>Nível atual:</Text>
                <Text style={styles.tankLevelValue}>{value4}%</Text>
              </View>
            </View>
            <View style={styles.tankStatusContainer}>
              <View style={styles.tankLevelIndicator}>
                <View style={[
                  styles.tankLevelBar, 
                  { 
                    height: `${Math.min(value4, 100)}%`,
                    backgroundColor: '#8B4513'
                  }
                ]} />
              </View>
              <Text style={styles.tankModeText}>
                {tanque2Ligada ? 'AUTO' : 'MANUAL'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Modal para Tanque Leite */}
        <Modal
          visible={modalVisibleTanque1}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modernModalContent}>
              {/* Header do Modal */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Tanque de Leite</Text>
                  <Text style={styles.modalSubtitle}>
                    Gerenciamento completo do sistema
                  </Text>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.modernCloseButton}>
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Seção do Nível */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Nível Atual</Text>
                <View style={styles.tankDisplayContainer}>
                  <View style={styles.modernTank}>
                    <View style={[styles.modernTankFill, { height: `${Math.min(value3, 100)}%` }]} />
                    <Text style={styles.tankPercentage}>{value3}%</Text>
                  </View>
                  <View style={styles.tankInfo}>
                    <Text style={styles.tankLabel}>Volume</Text>
                    <Text style={styles.tankValue}>{value3}%</Text>
                    <Text style={styles.tankStatus}>
                      Status: {value3 > 80 ? 'Alto' : value3 > 50 ? 'Normal' : 'Baixo'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Seção do Modo de Operação */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Modo de Operação</Text>
                <View style={styles.modernSwitchContainer}>
                  <TouchableOpacity
                    style={[
                      styles.modernSwitchButton,
                      styles.switchLeft,
                      tanque1Ligada && styles.modernSwitchActive,
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
                    <Text style={[styles.modernSwitchText, tanque1Ligada && styles.modernSwitchTextActive]}>
                      Automático
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modernSwitchButton,
                      styles.switchRight,
                      !tanque1Ligada && styles.modernSwitchActive,
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
                    <Text style={[styles.modernSwitchText, !tanque1Ligada && styles.modernSwitchTextActive]}>
                      Manual
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Seção dos Controles */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Controles do Sistema</Text>
                
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Velocidade de Enchimento</Text>
                    <Text style={styles.sliderValue}>
                      {(payload1.fill_speed * 100).toFixed(2)} L/s
                    </Text>
                  </View>
                  <Slider
                    maximumTrackTintColor="#e0e0e0"
                    maximumValue={100}
                    minimumTrackTintColor="#2196F3"
                    minimumValue={0}
                    onValueChange={(value) => {
                      const rounded = Math.round(value);
                      const scaledValue = Number((rounded / 100).toFixed(2));
                      setValue1(scaledValue);
                      setPayload1((prevPayload) => {
                        const updatedPayload = {
                          ...prevPayload,
                          fill_speed: scaledValue,
                        };
                        handleSliderChange(updatedPayload, "milk_tank_config");
                        return updatedPayload;
                      });
                    }}
                    orientation="horizontal"
                    step={1}
                    style={styles.modernSlider}
                    thumbStyle={styles.modernThumb}
                    trackStyle={styles.modernTrack}
                    value={Math.round(payload1.fill_speed * 100)}
                  />
                </View>

                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Velocidade de Esvaziamento</Text>
                    <Text style={styles.sliderValue}>
                      {payload1.empty_speed.toFixed(2)} L/s
                    </Text>
                  </View>
                  <Slider
                    maximumTrackTintColor="#e0e0e0"
                    maximumValue={100}
                    minimumTrackTintColor="#FF5722"
                    minimumValue={0}
                    onValueChange={(value) => {
                      const rounded = Math.round(value);
                      const scaledValue = Number((rounded / 100).toFixed(2));
                      setValue2(scaledValue);
                      setPayload1((prevPayload) => {
                        const updatedPayload = {
                          ...prevPayload,
                          empty_speed: scaledValue,
                        };
                        handleSliderChange(updatedPayload, "milk_tank_config");
                        return updatedPayload;
                      });
                    }}
                    orientation="horizontal"
                    step={1}
                    style={styles.modernSlider}
                    thumbStyle={styles.modernThumb}
                    trackStyle={styles.modernTrack}
                    value={Math.round(payload1.empty_speed * 100)}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para Tanque Chocolate */}
        <Modal
          visible={modalVisibleTanque2}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modernModalContent}>
              {/* Header do Modal */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Tanque de Chocolate</Text>
                  <Text style={styles.modalSubtitle}>
                    Gerenciamento completo do sistema
                  </Text>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.modernCloseButton}>
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Seção do Nível */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Nível Atual</Text>
                <View style={styles.tankDisplayContainer}>
                  <View style={styles.modernTank}>
                    <View style={[
                      styles.modernTankFill, 
                      { 
                        height: `${Math.min(value4, 100)}%`,
                        backgroundColor: '#8B4513'
                      }
                    ]} />
                    <Text style={styles.tankPercentage}>{value4}%</Text>
                  </View>
                  <View style={styles.tankInfo}>
                    <Text style={styles.tankLabel}>Volume</Text>
                    <Text style={[styles.tankValue, { color: '#8B4513' }]}>{value4}%</Text>
                    <Text style={styles.tankStatus}>
                      Status: {value4 > 80 ? 'Alto' : value4 > 50 ? 'Normal' : 'Baixo'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Seção do Modo de Operação */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Modo de Operação</Text>
                <View style={styles.modernSwitchContainer}>
                  <TouchableOpacity
                    style={[
                      styles.modernSwitchButton,
                      styles.switchLeft,
                      tanque2Ligada && styles.modernSwitchActive,
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
                    <Text style={[styles.modernSwitchText, tanque2Ligada && styles.modernSwitchTextActive]}>
                      Automático
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modernSwitchButton,
                      styles.switchRight,
                      !tanque2Ligada && styles.modernSwitchActive,
                    ]}
                    onPress={() => {
                      setTanque2Ligada(false);
                      setPayload2((prevPayload) => ({
                        ...prevPayload,
                        mode: "manual",
                      }));
                      sendMqttMessage("chocolate_tank_config", {
                        ...payload2,
                        mode: "manual",
                      });
                    }}
                  >
                    <Text style={[styles.modernSwitchText, !tanque2Ligada && styles.modernSwitchTextActive]}>
                      Manual
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Seção dos Controles */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Controles do Sistema</Text>
                
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Velocidade de Enchimento</Text>
                    <Text style={styles.sliderValue}>
                      {(payload2.fill_speed * 100).toFixed(2)} L/s
                    </Text>
                  </View>
                  <Slider
                    maximumTrackTintColor="#e0e0e0"
                    maximumValue={100}
                    minimumTrackTintColor="#8B4513"
                    minimumValue={0}
                    onValueChange={(value) => {
                      const rounded = Math.round(value);
                      const scaledValue = Number((rounded / 100).toFixed(2));
                      setValue7(scaledValue);
                      setPayload2((prevPayload) => {
                        const updatedPayload = {
                          ...prevPayload,
                          fill_speed: scaledValue,
                        };
                        handleSliderChange(updatedPayload, "chocolate_tank_config");
                        return updatedPayload;
                      });
                    }}
                    orientation="horizontal"
                    step={1}
                    style={styles.modernSlider}
                    thumbStyle={styles.modernThumb}
                    trackStyle={styles.modernTrack}
                    value={Math.round(payload2.fill_speed * 100)}
                  />
                </View>

                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Velocidade de Esvaziamento</Text>
                    <Text style={styles.sliderValue}>
                      {payload2.empty_speed.toFixed(2)} L/s
                    </Text>
                  </View>
                  <Slider
                    maximumTrackTintColor="#e0e0e0"
                    maximumValue={100}
                    minimumTrackTintColor="#FF5722"
                    minimumValue={0}
                    onValueChange={(value) => {
                      const rounded = Math.round(value);
                      const scaledValue = Number((rounded / 100).toFixed(2));
                      setValue8(scaledValue);
                      setPayload2((prevPayload) => {
                        const updatedPayload = {
                          ...prevPayload,
                          empty_speed: scaledValue,
                        };
                        handleSliderChange(updatedPayload, "chocolate_tank_config");
                        return updatedPayload;
                      });
                    }}
                    orientation="horizontal"
                    step={1}
                    style={styles.modernSlider}
                    thumbStyle={styles.modernThumb}
                    trackStyle={styles.modernTrack}
                    value={Math.round(payload2.empty_speed * 100)}
                  />
                </View>
              </View>

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
  // Estilos dos Widgets
  widget: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginVertical: 8,
    marginHorizontal: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "90%",
  },
  widgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  widgetIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  widgetTitleContainer: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  widgetSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  widgetStatus: {
    alignItems: "center",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ccc",
    marginBottom: 4,
  },
  statusActive: {
    backgroundColor: "#4CAF50",
  },
  statusText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "bold",
  },
  widgetContent: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  productionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  productionLabel: {
    fontSize: 14,
    color: "#666",
  },
  productionValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  widgetSwitchContainer: {
    flexDirection: "row",
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  widgetSwitchButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
  widgetSwitchActive: {
    backgroundColor: "#693B8F",
  },
  widgetSwitchText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  widgetSwitchTextActive: {
    color: "#fff",
  },
  // Estilos dos Widgets dos Tanques
  tankWidget: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginVertical: 8,
    marginHorizontal: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "90%",
  },
  tankWidgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 100,
  },
  tankImageContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  tankImage: {
    width: 60,
    height: 60,
  },
  tankImageStyle: {
    borderRadius: 8,
  },
  tankInfoContainer: {
    flex: 1,
    paddingRight: 10,
  },
  tankTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  tankSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  tankLevelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tankLevelLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  tankLevelValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },
  tankStatusContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tankLevelIndicator: {
    width: 20,
    height: 60,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginBottom: 8,
  },
  tankLevelBar: {
    width: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 10,
    minHeight: 2,
  },
  tankModeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
  },
  // Estilos dos Modais Modernos
  modernModalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 0,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  modernCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  tankDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modernTank: {
    width: 80,
    height: 120,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  modernTankFill: {
    width: "100%",
    backgroundColor: "#2196F3",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    minHeight: 4,
  },
  tankPercentage: {
    position: "absolute",
    top: "50%",
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    zIndex: 1,
  },
  tankInfo: {
    flex: 1,
    marginLeft: 20,
  },
  tankLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  tankValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 4,
  },
  tankStatus: {
    fontSize: 12,
    color: "#666",
  },
  modernSwitchContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 4,
  },
  modernSwitchButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modernSwitchActive: {
    backgroundColor: "#2196F3",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modernSwitchText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  modernSwitchTextActive: {
    color: "#fff",
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  modernSlider: {
    height: 40,
  },
  modernThumb: {
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modernTrack: {
    height: 6,
    borderRadius: 3,
  },
  confirmButton: {
    backgroundColor: "#2196F3",
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
