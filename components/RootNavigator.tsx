import {createDrawerNavigator} from "@react-navigation/drawer";
import useAuthStore from "../hooks/useAuthStore";
import React, {useEffect, useState} from "react";
import {getData, STUDENT_ID_STORAGE_KEY} from "../utils/storage";
import DrawerNavigator from "./DrawerNavigator";
import {NavigationContainer} from "@react-navigation/native";
import {AuthStack} from "./AuthStack";
import {useNetInfo} from "@react-native-community/netinfo";
import {ActivityIndicator, Text} from "react-native-paper";
import {StyleSheet, View} from "react-native";

const Drawer = createDrawerNavigator()

export default function RootNavigator() {
    const { isConnected } = useNetInfo()
    const { setIsSigned, isSigned } = useAuthStore()

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const studentId = await getData(STUDENT_ID_STORAGE_KEY)
            setIsSigned(!!studentId)
            setIsLoading(false)
        }
        checkAuth()
    }, [])

    if (isLoading) return <ActivityIndicator style={{ marginTop: 20 }} />;

    if (isConnected === false) {
        return (
            <View style={styles.offlineContainer}>
                <Text style={styles.offlineText}>Нет соединения с интернетом</Text>
                <Text style={styles.offlineText}>Пожалуйста, включите сеть</Text>
            </View>
        )
    }

    return (
        <NavigationContainer>
            {isSigned ? <DrawerNavigator /> : <AuthStack />}
        </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    offlineContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    offlineText: {
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
        marginBottom: 10,
    }
})
