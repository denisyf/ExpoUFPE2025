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
import * as Animatable from "react-native-animatable";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Paho from "paho-mqtt";

export default function Welcome() {
  const [broker, setBroker] = useState(null);
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);

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
            source={require("../../../assets/logo_2025.png")}
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
        {/* Widget 1 - Entradas Lógicas */}
        <View style={styles.widget}>
          <View style={styles.widgetHeader}>
            <View style={styles.widgetIconContainer}>
              <FontAwesome6 name="arrow-right-to-bracket" size={24} color="#2196F3" />
            </View>
            <View style={styles.widgetTitleContainer}>
              <Text style={styles.widgetTitle}>Entradas Lógicas</Text>
              <Text style={styles.widgetSubtitle}>Estados das entradas digitais</Text>
            </View>
            <View style={styles.widgetStatus}>
              <View style={[styles.statusIndicator, styles.statusActive]} />
              <Text style={styles.statusText}>ATIVO</Text>
            </View>
          </View>
          
          <View style={styles.widgetContent}>
            <View style={styles.ioContainer}>
              {estados.map((estado) => (
                <View key={estado.id} style={styles.ioItem}>
                  <View style={[
                    styles.ioIndicator,
                    { backgroundColor: estado.ligado ? "#4CAF50" : "#ccc" }
                  ]} />
                  <Text style={styles.ioLabel}>{estado.nome}</Text>
                  <Text style={[
                    styles.ioStatus,
                    { color: estado.ligado ? "#4CAF50" : "#999" }
                  ]}>
                    {estado.ligado ? "ON" : "OFF"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Widget 2 - Saídas Lógicas */}
        <View style={styles.widget}>
          <View style={styles.widgetHeader}>
            <View style={styles.widgetIconContainer}>
              <FontAwesome6 name="arrow-right-from-bracket" size={24} color="#FF5722" />
            </View>
            <View style={styles.widgetTitleContainer}>
              <Text style={styles.widgetTitle}>Saídas Lógicas</Text>
              <Text style={styles.widgetSubtitle}>Estados das saídas digitais</Text>
            </View>
            <View style={styles.widgetStatus}>
              <View style={[styles.statusIndicator, styles.statusActive]} />
              <Text style={styles.statusText}>ATIVO</Text>
            </View>
          </View>
          
          <View style={styles.widgetContent}>
            <View style={styles.ioContainer}>
              {estados2.map((estado) => (
                <View key={estado.id} style={styles.ioItem}>
                  <View style={[
                    styles.ioIndicator,
                    { backgroundColor: estado.ligado ? "#4CAF50" : "#ccc" }
                  ]} />
                  <Text style={styles.ioLabel}>{estado.nome}</Text>
                  <Text style={[
                    styles.ioStatus,
                    { color: estado.ligado ? "#4CAF50" : "#999" }
                  ]}>
                    {estado.ligado ? "ON" : "OFF"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
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
  widgetIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
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
  ioContainer: {
    flexDirection: "column",
    gap: 12,
  },
  ioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  ioIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  ioLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  ioStatus: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
