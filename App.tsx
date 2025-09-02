import RootNavigator from "./components/RootNavigator";
import Providers from "./components/Providers";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
    return (
        <Providers>
            <SafeAreaView style={{ flex: 1 }}>
                <RootNavigator />
            </SafeAreaView>
        </Providers>
    )
}