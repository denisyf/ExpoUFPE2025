import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Paho from "paho-mqtt";

export default function Welcome() {
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);

  const estados = [
    { id: 1, nome: "I0.0", ligado: true },
    { id: 2, nome: "I0.1", ligado: true },
    { id: 3, nome: "I0.2", ligado: true },
    { id: 4, nome: "I0.3", ligado: true },
    { id: 5, nome: "I0.4", ligado: true },
  ];

  const estados2 = [
    { id: 1, nome: "Q0.0", ligado: false },
    { id: 2, nome: "Q0.1", ligado: true },
    { id: 3, nome: "Q0.2", ligado: false },
    { id: 4, nome: "Q0.3", ligado: true },
    { id: 5, nome: "Q0.4", ligado: false },
  ];

  const [broker, setBroker] = useState(null);
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchBrokerData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@brokerConfig");
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

    // if (topic === 'milk_tank_level') {
    //     setValue3(payload);
    //     console.log(value3);
    // } else if (topic === 'chocolate_tank_level') {
    //     setValue4(payload);
    //     console.log(value4);
    // }
    // else if (topic === 'sugar_items') {
    //     setValue5(payload);
    //     console.log(value5)
    // }
    // else if (topic === 'cocoa_items') {
    //     setValue6(payload);
    //     console.log(value6);
    // }
  };

  // const sendMqttMessage = (topic, message) => {
  //     if (client && client.isConnected()) {
  //         const mqttMessage = new Paho.Message(
  //             typeof message === 'object' ? JSON.stringify(message) : message
  //         );

  //         mqttMessage.destinationName = topic;
  //         client.send(mqttMessage);
  //         console.log(`Mensagem enviada para o tópico ${topic}: ${mqttMessage.payloadString}`);
  //     } else {
  //         console.error('Cliente MQTT não está conectado.');
  //     }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerHeader}>
        <Animatable.View animation="fadeInDown" delay={500}>
          <Image
            style={styles.logo}
            source={require("../../assets/icon.png")}
          />
        </Animatable.View>
        <Animatable.View
          animation="fadeInUp"
          style={styles.containerDispositivos}
        >
          <FontAwesome6
            style={styles.icon}
            name="microchip"
            size={24}
            color="#fff"
          />
          <Text style={styles.textDispositivos}>Factory</Text>
        </Animatable.View>
      </View>

      <ScrollView contentContainerStyle={styles.containerForm}>
        {/* Dropdown 1 */}
        <TouchableOpacity onPress={() => setDropdown1Open(!dropdown1Open)}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownText}>Entradas Lógicas</Text>
            <Icon
              name={dropdown1Open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#333"
            />
          </View>
        </TouchableOpacity>
        {dropdown1Open && (
          <View style={styles.dropdownContent}>
            {estados.map((estado) => (
              <View key={estado.id} style={styles.circleContainer}>
                <View
                  style={[
                    styles.circle,
                    { backgroundColor: estado.ligado ? "#66BB9F" : "#D6D6D6" },
                  ]}
                />
                <Text style={styles.circleText}>{estado.nome}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dropdown 2 */}
        <TouchableOpacity onPress={() => setDropdown2Open(!dropdown2Open)}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownText}>Saídas Lógicas</Text>
            <Icon
              name={dropdown2Open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#333"
            />
          </View>
        </TouchableOpacity>
        {dropdown2Open && (
          <View style={styles.dropdownContent}>
            {estados2.map((estado) => (
              <View key={estado.id} style={styles.circleContainer}>
                <View
                  style={[
                    styles.circle,
                    { backgroundColor: estado.ligado ? "#66BB9F" : "#D6D6D6" },
                  ]}
                />
                <Text style={styles.circleText}>{estado.nome}</Text>
              </View>
            ))}
          </View>
        )}
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
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
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
    borderRadius: 5,
    marginTop: 10,
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 20,
  },
  circle: {
    width: 25,
    height: 25,
    borderRadius: 20,
    margin: 10,
  },
  circleText: {
    marginTop: 5,
    textAlign: "center",
  },
});
