import React from "react";
import JoinGame from "./components/JoinGame";
import Lobby from "./components/Lobby";
import Answer from "./components/Answer";
import Vote from "./components/Vote";
import {setCustomText} from "react-native-global-props";
import AppLoading from "expo-app-loading";
import {
    useFonts,
    EBGaramond_400Regular,
} from "@expo-google-fonts/eb-garamond";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {Linking, Platform} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import Leaderboard from "./components/Leaderboard";
import RedirectFile from "./components/RedirectFile";

const PERSISTENCE_KEY = "NAVIGATION_STATE";
const Stack = createStackNavigator();

export default function App() {
    let [fontsLoaded] = useFonts({
        EBGaramond_400Regular,
    });
    const [isReady, setIsReady] = React.useState(false);
    const [initialState, setInitialState] = React.useState();

    React.useEffect(() => {
        const restoreState = async () => {
            try {
                const initialUrl = await Linking.getInitialURL();

                if (Platform.OS !== "web" && initialUrl == null) {
                    const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
                    const state = savedStateString
                        ? JSON.parse(savedStateString)
                        : undefined;

                    if (state !== undefined) {
                        setInitialState(state);
                    }
                }
            } finally {
                setIsReady(true);
            }
        };

        if (!isReady) {
            restoreState();
        }
    }, [isReady]);

    if (!isReady) {
        return null;
    }

    setCustomText(customTextProps);
    if (!fontsLoaded) {
        return <AppLoading/>;
    }

    return (
        <NavigationContainer
            initialState={initialState}
                             onStateChange={(state) =>
            AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))
            }
        >
            <Stack.Navigator>
                <Stack.Screen
                    options={{headerShown: false}}
                    name="JoinGame"
                    component={JoinGame}
                />
                <Stack.Screen
                    options={{headerShown: false}}
                    name="Answer"
                    component={Answer}
                />
                <Stack.Screen
                    options={{headerShown: false}}
                    name="Lobby"
                    component={Lobby}
                />
                <Stack.Screen
                    options={{headerShown: false}}
                    name="Vote"
                    component={Vote}
                />
                <Stack.Screen
                    options={{headerShown: false}}
                    name="Leaderboard"
                    component={Leaderboard}
                />
                <Stack.Screen
                    options={{headerShown: false}}
                    name="RedirectFile"
                    component={RedirectFile}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const customTextProps = {
    style: {
        fontSize: 30,
        fontFamily: "EBGaramond_400Regular",
    },
};
