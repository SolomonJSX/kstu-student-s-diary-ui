import React from 'react';
import {DrawerContentScrollView, DrawerItem, DrawerItemList} from '@react-navigation/drawer';
import {Alert, View} from 'react-native';
import {deleteData, STUDENT_ID_STORAGE_KEY} from '../utils/storage';
import useAuthStore from "../hooks/useAuthStore";

const CustomDrawerContent = (props: any) => {
    const {setIsSigned} = useAuthStore()
    const handleLogout = async () => {
        await deleteData(STUDENT_ID_STORAGE_KEY);
        setIsSigned(false)
    }

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{flexGrow: 0}}>
            <View>
                <DrawerItemList {...props} />

                <DrawerItem
                    label={"Выйти"}
                    onPress={() => {
                        Alert.alert(
                            "Выход",
                            "Вы уверены, что хотите выйти?",
                            [
                                {text: "Отмена", style: "cancel"},
                                {text: "Выйти", style: "destructive", onPress: handleLogout}
                            ]
                        )
                    }}/>
            </View>
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;
