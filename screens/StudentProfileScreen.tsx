import React, {useEffect, useState} from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {Avatar, Card, Text, Button, Divider, ActivityIndicator} from "react-native-paper";
import {useProfile} from "../hooks/useProfile";
import {getData, STUDENT_ID_STORAGE_KEY} from "../utils/storage";

const StudentProfileScreen = () => {
    const [studentId, setStudentId] = useState("")

    useEffect(() => {
        const loadData = async () => {
            const studentId = await getData(STUDENT_ID_STORAGE_KEY)
            setStudentId(studentId!)
        }

        loadData()
    }, [])

    const { data: profile, isLoading, isError, refetch, isFetching } = useProfile(studentId)

    if (isLoading) {
        return <ActivityIndicator style={{ marginTop: 20 }} />;
    }

    if (isError) return <Text>Ошибка при загрузке профиля</Text>;

    if (!profile) return <Text>No user DATA!</Text>

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                <Card.Content style={styles.header}>
                    <Avatar.Text
                        size={64}
                        label={profile.fullName ? profile.fullName[0] : "?"}
                        style={styles.avatar}
                    />
                    <View style={styles.headerText}>
                        <Text variant="titleLarge" style={styles.name}>
                            {profile.fullName || "Имя не указано"}
                        </Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>
                            {profile.faculty || "Факультет неизвестен"}
                        </Text>
                    </View>
                </Card.Content>

                <Divider style={styles.divider} />

                <Card.Content>
                    <InfoRow label="Специальность" value={profile.specialty} />
                    <InfoRow label="Группа" value={profile.group} />
                    <InfoRow label="Курс" value={profile.course} />
                    <InfoRow label="Форма обучения" value={profile.form} />
                    <InfoRow label="Дата рождения" value={profile.birthDate} />
                    <InfoRow label="Profile ID" value={profile.profileId} />
                </Card.Content>

                <Card.Actions style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={() => refetch()}
                        loading={isFetching} // Покажет спиннер на кнопке, если обновляется
                    >
                        Обновить
                    </Button>
                </Card.Actions>
            </Card>
        </ScrollView>
    );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <View style={styles.infoRow}>
        <Text variant="bodyMedium" style={styles.infoLabel}>{label}</Text>
        <Text
            variant="bodyMedium"
            style={styles.infoValue}
            numberOfLines={1}
            ellipsizeMode="tail"
        >
            {value || "—"}
        </Text>
    </View>
);


const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#f6f7fb",
        flexGrow: 1,
        justifyContent: "center",
    },
    card: {
        borderRadius: 16,
        elevation: 4,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        backgroundColor: "#6200ee",
    },
    headerText: {
        marginLeft: 16,
        flexShrink: 1,
    },
    name: {
        fontWeight: "bold",
    },
    subtitle: {
        color: "#666",
        marginTop: 2,
    },
    divider: {
        marginVertical: 8,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start", // чтобы многострочный текст выравнивался
        paddingVertical: 6,
    },
    infoLabel: {
        color: "#555",
        width: "40%", // фиксированная ширина для лейбла
    },
    infoValue: {
        fontWeight: "600",
        flexShrink: 1,        // чтобы текст не вылазил
        flexWrap: "wrap",     // перенос строк
        textAlign: "right",   // выравнивание по правому краю
        maxWidth: "60%",      // чтобы не залезал на лейбл
    },
    actions: {
        justifyContent: "flex-end",
        padding: 8,
    },
});

export default StudentProfileScreen;