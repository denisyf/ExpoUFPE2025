import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import Home from './pages/Home/index';
import Factory from './pages/Factory/index';
import Comunicacao from './pages/Comunicacao/index';

import { FontAwesome6,
        Octicons,
        Feather
 } from '@expo/vector-icons'

const Tab = createBottomTabNavigator();

export default function Routes(){
    return(
        <Tab.Navigator
            screenOptions={{
                tabBarStyle:{
                    height: 55,
                    backgroundColor: '#FFF',
                    borderTopColor: 'transparent',
                    paddingBottom: 5,
                    paddingTop: 5
                },
                tabBarActiveTintColor: '#66BB9F',
                
            }}
        >
            <Tab.Screen 
            name="Minecraft" 
            component={Home} 
            options={{
                headerShown: false,
                tabBarIcon: ({ size, color}) => (
                    <Feather name="box" size={size} color={color} />
                )
            }}
            />

            <Tab.Screen 
            name="Factory"
            component={Factory} 
            options={{
                headerShown: false,
                tabBarIcon: ({ size, color}) => (
                    <FontAwesome6 name="microchip" size={size} color={color} />
                )
            }}
            />

            <Tab.Screen 
            name="Comunicaçao"
            component={Comunicacao} 
            options={{
                headerShown: false,
                tabBarIcon: ({ size, color}) => (
                    <Octicons name="link" size={size} color={color} />
                )
            }}
            />

        </Tab.Navigator>
    )
}