import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import UserLeaderboard from "./UserLeaderboard";
import AsyncStorage from '@react-native-community/async-storage';

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


export default class Vote extends Component {
    state = {
        gameCode: "null",
        users: [],
    }

    componentDidMount() {
        // this.setState({gameCode: this.props.route.params.gameCode}, () =>
        this.setState({gameCode: 'be5183'}, () => {
            this.getAllData();
        })
        // );
    }

    getAllData = () => {
        fetch(
            url +
            ":" +
            port +
            "/api/round/getRoundsByTableId?idGameTable=" +
            this.state.gameCode,
            {
                method: "GET",
            }
        )
            .then((response) => response.text())
            .then((roundDetails) => {
                roundDetails = JSON.parse(roundDetails);

                fetch(
                    url +
                    ":" +
                    port +
                    "/api/users/getLobbyUsers?table_id=" +
                    this.state.gameCode,
                    {
                        method: "GET",
                    }
                ).then((response) => response.text())
                    .then((users) => {
                            users = JSON.parse(users);

                            for (let i = 0; i < users.length; i++) {
                                let tempUser = [];

                                tempUser["id"] = users[i].id;
                                tempUser["name"] = users[i].name;

                                for (let j = 0; j < colorDictionary.length; j++) {
                                    if (colorDictionary[j].colorBD === users[i].color) {
                                        tempUser["colorPrimary"] = colorDictionary[j].color1;
                                        tempUser["colorSecondary"] = colorDictionary[j].color2;
                                    }
                                }

                                for (let j = 0; j < roundDetails.length; j++) {

                                    if (roundDetails[j].idUser1 === users[i].id) {
                                        tempUser['score'] = roundDetails[j].votesUser1;
                                        // break;
                                    }

                                    if (roundDetails[j].idUser2 === users[i].id) {
                                        tempUser['score'] = roundDetails[j].votesUser2;
                                        // break;
                                    }
                                }


                                this.state.users.push(tempUser);
                                this.setState({isLoaded: true});
                            }

                        }
                    )

            });
    }


    getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("myData");
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            throw e;
        }
    };

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
                        <UserLeaderboard
                            key={user.id}
                            id={user.id}
                            colorPrimary={user.colorPrimary}
                            colorSecondary={user.colorSecondary}
                            name={user.name}
                            score={user.score}
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
