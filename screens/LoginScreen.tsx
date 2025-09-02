import { Controller, useForm } from "react-hook-form";
import { useLogin } from "../hooks/useLogin";
import { Alert, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { saveData, STUDENT_ID_STORAGE_KEY } from "../utils/storage";
import useAuthStore from "../hooks/useAuthStore";

type FormValues = {
    username: string;
    password: string;
};

const LoginScreen = () => {
    const { control, handleSubmit } = useForm<FormValues>({
        defaultValues: {
            username: "",
            password: "",
        }
    });

    const setIsSignedIn = useAuthStore(state => state.setIsSigned)
    const login = useLogin();

    const onSubmit = async (data: FormValues) => {
        if (!data.username || !data.password) {
            Alert.alert("Ошибка", "Введите логин и пароль");
            return;
        }

        try {
            const response = await login.mutateAsync(data)
            const studentId = response.studentId

            await saveData(STUDENT_ID_STORAGE_KEY, studentId.toString())

            setIsSignedIn(true);
            Alert.alert("Успех", `Вы успешно вошли! ID: ${studentId}`);
        } catch (error: any) {
            const message = error.response?.data || error.message || "Неизвестная ошибка";
            Alert.alert("Ошибка", message);
        }
    };

    return (
        <View style={{ padding: 16, marginTop: 80 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>
                Вход
            </Text>
            <Text variant="bodyMedium" style={{
                marginBottom: 20,
                textAlign: 'center',
                color: '#666',
                fontStyle: 'italic'
            }}>
                Введите ваши логин и пароль от образовательного портала университета
            </Text>


            <Controller
                control={control}
                name="username"
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        label="Логин"
                        value={value}
                        onChangeText={onChange}
                        style={{ marginBottom: 16 }}
                    />
                )}
            />

            <Controller
                control={control}
                name="password"
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        label="Пароль"
                        value={value}
                        onChangeText={onChange}
                        secureTextEntry
                        style={{ marginBottom: 24 }}
                    />
                )}
            />

            <Button
                mode="contained"
                loading={login.isPending}
                onPress={handleSubmit(onSubmit)}
            >
                Войти
            </Button>
        </View>
    );
}

export default LoginScreen;