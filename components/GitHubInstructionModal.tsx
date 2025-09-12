// components/GitHubInstructionModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useModalStore } from '../hooks/useModalStore';

const GitHubInstructionModal = () => {
    const { isModalVisible, closeModal } = useModalStore();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={closeModal}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.title}>📘 Инструкция</Text>

                    <Text style={styles.subtitle}>Репозиторий</Text>
                    <Text
                        style={styles.link}
                        onPress={() => Linking.openURL("https://github.com/KSTU-gif/pythonic")}
                    >
                        🔗 https://github.com/KSTU-gif/pythonic
                    </Text>
                    <Text style={styles.text}>
                        Репозиторий доступен всем студентам. В нём вы будете создавать свои ветки и добавлять проекты.
                    </Text>

                    <Text style={styles.subtitle}>1. Создание ветки</Text>
                    <Text style={styles.text}>
                        - Найди себя в списке студентов{"\n"}
                        - Нажми кнопку "Создать"{"\n"}
                        - У тебя автоматически появится ветка в GitHub репозитории
                    </Text>

                    <Text style={styles.subtitle}>2. Добавление проекта</Text>
                    <Text style={styles.text}>
                        - Клонируй репозиторий: {"\n"}
                        git clone https://github.com/KSTU-gif/pythonic.git{"\n\n"}
                        - Переключись на свою ветку: {"\n"}
                        git checkout Фамилия_Имя_Отчество{"\n\n"}
                        - Скопируй проект в папку{"\n"}
                        - Выполни: {"\n"}
                        git add .{"\n"}
                        git commit -m "Мой проект"{"\n"}
                        git push
                    </Text>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                        <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    text: {
        fontSize: 14,
        marginBottom: 5,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#2196F3',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    link: {
        fontSize: 14,
        color: "#007bff",
        textDecorationLine: "underline",
        marginBottom: 8,
    },
});

export default GitHubInstructionModal;
