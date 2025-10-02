import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageBackground,
} from "react-native";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Octicons } from "@expo/vector-icons";

const Config2 = () => {
  const [broker, setBroker] = useState(null);
  const [updatedBroker, setUpdatedBroker] = useState({
    ip_address: "",
    port: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    const fetchBrokerData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@brokerConfig");
        if (jsonValue != null) {
          const data = JSON.parse(jsonValue);
          setBroker(data);
          setUpdatedBroker(data);
        } else {
          // Valores padrão
          const defaultConfig = {
            ip_address: "192.168.0.15",
            port: "1884",
            username: "admin",
            password: "admin",
          };
          setBroker(defaultConfig);
          setUpdatedBroker(defaultConfig);
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

  const handleUpdateBroker = async () => {
    Alert.alert(
      "Atualizar configuração do Broker",
      "Tem certeza que deseja alterar as configurações do Broker?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: async () => {
            try {
              await AsyncStorage.setItem(
                "@brokerConfig",
                JSON.stringify(updatedBroker)
              );
              setBroker(updatedBroker);
            } catch (error) {
              console.error(
                "Erro ao atualizar configuração do broker: ",
                error
              );
            }
          },
        },
      ]
    );
  };

  const handleChangeText = (key, value) => {
    setUpdatedBroker((prevState) => ({
      ...prevState,
      [key]:
        key === "port" ? (isNaN(Number(value)) ? "" : Number(value)) : value, // Trata 'port' como número, mas mantém os outros campos como strings
    }));
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
          <Octicons style={styles.icon} name="link" size={24} color="#fff" />
          <Text style={styles.textDispositivos}>Comunicação</Text>
        </Animatable.View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Animatable.View animation="fadeInUp" style={styles.containerForm}>
          <View style={styles.containerConfig}>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 16,
                width: 335,
                height: 92,
                backgroundColor: "#fff",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <Text style={styles.textInput}>Endereço do Broker</Text>
              <TextInput
                placeholder="Endereço..."
                value={updatedBroker.ip_address}
                onChangeText={(text) => handleChangeText("ip_address", text)}
                style={styles.input}
              />
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 16,
                width: 335,
                height: 92,
                backgroundColor: "#fff",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <Text style={styles.textInput}>Porta</Text>
              <TextInput
                placeholder="Porta..."
                value={updatedBroker.port}
                onChangeText={(text) => handleChangeText("port", text)}
                style={styles.input}
              />
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 16,
                width: 335,
                height: 92,
                backgroundColor: "#fff",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <Text style={styles.textInput}>Usuário</Text>
              <TextInput
                placeholder="Usuário..."
                value={updatedBroker.username}
                onChangeText={(text) => handleChangeText("username", text)}
                style={styles.input}
              />
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 16,
                width: 335,
                height: 92,
                backgroundColor: "#fff",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <Text style={styles.textInput}>Senha</Text>
              <TextInput
                placeholder="Senha..."
                value={updatedBroker.password}
                onChangeText={(text) => handleChangeText("password", text)}
                style={styles.input}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdateBroker}
            >
              <Text style={styles.buttonText}>Conectar</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1374BA",
  },
  containerHeader: {
    marginTop: "10%",
    // marginBottom: '5%',
    display: "flex",
    alignItems: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  containerDispositivos: {
    backgroundColor: "#66BB9F",
    paddingVertical: 20,
    paddingHorizontal: 20,
    // marginHorizontal: 20,
    // borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    // marginBottom: '5%',
    flexDirection: "row",
    width: "100%",
  },
  input: {
    backgroundColor: "transparent",
    borderColor: "#000",
    borderWidth: 1,
    color: "#000",
    padding: 8,
    borderRadius: 10,
    // fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  textInput: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10,
  },
  containerForm: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    // paddingVertical: 10,
    // borderTopLeftRadius: 100,
  },
  icon: {
    marginRight: 10,
  },
  button: {
    width: 297,
    height: 54.53,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#693B8F",
    borderRadius: 16,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  logo: {
    width: 150,
    height: 150,
  },
  textDispositivos: {
    fontSize: 18,
    color: "#FFF",
    // fontFamily: 'AnonymousPro_700Bold',
  },
  containerConfig: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Config2;
