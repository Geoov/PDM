import React, {Component} from "react";
import {StyleSheet, Text, View} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import User from "./User";
import RNEventSource from "react-native-event-source";

// const EventSource = require("rn-eventsource");

const url = "http://192.168.0.103";
const port = "8080";

const colorDictionary = [
    {
        colorBD: "red",
        color1: "rgb(142,16,16)",
        color2: "rgba(255, 108, 108, 1)",
    },
    {
        colorBD: "orange",
        color1: "rgba(255, 149, 0, 1)",
        color2: "rgba(255, 206, 130, 1)",
    },
    {
        colorBD: "green",
        color1: "rgba(29, 68, 29, 1)",
        color2: "rgba(52,199,89,1)",
    },
    {
        colorBD: "blue",
        color1: "rgba(11, 56, 103, 1)",
        color2: "rgba(8, 116, 255, 1)",
    },
    {
        colorBD: "purple",
        color1: "rgba(91,87,177, 1)",
        color2: "rgba(116, 114, 251, 1)",
    },
    {
        colorBD: "cyan",
        color1: "rgba(89,168,173, 1)",
        color2: "rgba(168, 250, 255, 1)",
    },
];

export default class Lobby extends Component {
    state = {
        gameCode: "null",
        alreadyInLobby: [],
        users: [],
        isLoaded: false,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.setState({gameCode: this.props.route.params.gameCode}, () =>
            this.constantFluxes()
        );
    }

    constantFluxes = () => {
        this.fetchData();
        this.getReadyPlayers();
    };

    fetchData = () => {
        this.getPlayersSource = new EventSource(
            url +
            ":" +
            port +
            "/api/users/lobby/getUsers?table_id=" +
            this.state.gameCode
        );

        this.getPlayersSource.addEventListener("message", (event) => {
            this.updateUsers(event.data);
        });
    };

    getReadyPlayers = () => {
        this.getReadyPlayersSource = new EventSource(
            url +
            ":" +
            port +
            "/api/gameTable/lobby/getReadyPlayers?table_id=" +
            this.state.gameCode
        );

        this.getReadyPlayersSource.addEventListener("message", (event) => {
            this.updateReadyUsers(event.data);
        });
    };

    updateUsers = (data) => {
        let jsonUsers = JSON.parse(data);
        for (let i = 0; i < jsonUsers.length; i++) {
            let tempUser = [];

            tempUser["id"] = jsonUsers[i].id;
            tempUser["name"] = jsonUsers[i].name;
            tempUser["score"] = jsonUsers[i].votes;

            const colorIndexPromise = new Promise(function (resolve) {
                for (let j = 0; j < colorDictionary.length; j++) {
                    if (colorDictionary[j].colorBD === jsonUsers[i].color) {
                        resolve(j);
                    }
                }
            });

            colorIndexPromise.then((index) => {
                tempUser["colorPrimary"] = colorDictionary[index].color1;
                tempUser["colorSecondary"] = colorDictionary[index].color2;
                let userData = {
                    colorPrimary: colorDictionary[index].color1,
                    colorSecondary: colorDictionary[index].color2,
                };

                this.mergeData(userData).then(() => {
                    if (!this.state.alreadyInLobby.includes(tempUser["id"])) {
                        this.state.users.push(tempUser);

                        let joinedAlreadyInLobby = this.state.alreadyInLobby.concat(
                            tempUser["id"]
                        );
                        this.setState({alreadyInLobby: joinedAlreadyInLobby}, () => {
                            this.setState({isLoaded: true});
                        });
                    }
                })

            })
        }
    };

    updateReadyUsers = (data) => {
        let readyPlayers = JSON.parse(data);
        const currentReadyPlayers = parseInt(readyPlayers.toString(), 10);

        if (
            currentReadyPlayers === this.state.alreadyInLobby.length &&
            this.state.alreadyInLobby.length % 2 === 0 &&
            this.state.alreadyInLobby.length >= 2
        ) {
            this.getData().then((myData) => {
                if (myData.imHost === 'yes') {
                    fetch(url + ":" + port + "/api/round/createRound", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            gameCode: this.state.gameCode,
                            users: this.state.alreadyInLobby,
                        }),
                    }).then(() => {
                        this.props.navigation.navigate("Answer", {
                            gameCode: this.state.gameCode,
                        });
                    });
                } else {
                    this.props.navigation.navigate("Answer", {
                        gameCode: this.state.gameCode,
                    });
                }
            });
        }
    };

    mergeData = async (value) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.mergeItem("myData", jsonValue);
        } catch (e) {
            throw e;
        }
    };

    getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("myData");
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            throw e;
        }
    };

    componentWillUnmount() {
        // this.getPlayersSource.removeAllListeners();
        this.getPlayersSource.close();
        // this.getReadyPlayersSource.removeEventListener();
        this.getReadyPlayersSource.close();
    }

    render() {
        return (
            <View style={styles.container}>
                <View
                    style={{
                        flexDirection: "column",
                        alignItems: "center",
                        alignSelf: "stretch",
                        marginVertical: 50,
                    }}
                >
                    <Text style={{color: "#ffffff", fontSize: 20}}>
                        Game code: {this.state.gameCode}
                    </Text>
                </View>

                <View
                    style={{flex: 1, flexDirection: "column", alignSelf: "stretch"}}
                >
                    {this.state.isLoaded &&
                    this.state.users.map((user, index) => (
                        <User
                            key={user.id}
                            id={user.id}
                            colorPrimary={user.colorPrimary}
                            colorSecondary={user.colorSecondary}
                            name={user.name}
                            gameCode={this.state.gameCode}
                        />
                    ))}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: "#000000",
    },
});
