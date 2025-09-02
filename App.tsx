import RootNavigator from "./components/RootNavigator";
import Providers from "./components/Providers";

export default function App() {
    return (
        <Providers>
            <RootNavigator />
        </Providers>
    )
}