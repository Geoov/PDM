import React, {Component} from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import {TextInput} from "react-native-web";
import RNEventSource from "react-native-event-source";

const url = "http://192.168.0.103";
const port = "8080";

export default class Answer extends Component {
    state = {
        gameCode: "",
        colorPrimary: "#ffffff",
        colorSecondary: "#ffffff",
        question: "",
        answers: "",
        rounds: 0,
        user1: false,
        user2: false,
        userId: "",
        roundId: "",
        answered: false,
        isLoaded: false,
    };

    componentDidMount() {
        this.setState({gameCode: this.props.route.params.gameCode}, () => {
            this.assignQuestions();
            this.fetchAnswers();
        });
    }

    assignQuestions() {
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

                this.setState({rounds: roundDetails.length});

                for (let i = 0; i < roundDetails.length; i++) {
                    if (roundDetails[i].contor === 0) {
                        this.setState({firstRound: roundDetails[i].id});
                    }

                    this.getData().then((myData) => {
                        this.setState({userId: myData.id}, () => {
                            if (
                                this.state.userId === roundDetails[i].idUser1 ||
                                this.state.userId === roundDetails[i].idUser2
                            ) {
                                if (this.state.userId === roundDetails[i].idUser1) {
                                    this.setState({user1: true});
                                } else {
                                    this.setState({user2: true});
                                }

                                if (this.state.userId === myData.id) {
                                    this.setState({colorPrimary: myData.colorPrimary});

                                    this.setState({colorSecondary: myData.colorSecondary}, () => {
                                        let aux = this.state.colorSecondary;
                                        aux = aux.replace(", 1)", ", 0.1)");
                                        this.setState({colorSecondary: aux});
                                    });
                                }
                                this.setState({roundId: roundDetails[i].id}, () => {
                                    fetch(
                                        url +
                                        ":" +
                                        port +
                                        "/api/getQuestion?id=" +
                                        roundDetails[i].idQuestion,
                                        {
                                            method: "GET",
                                        }
                                    )
                                        .then((response) => response.json())
                                        .then((question) => {
                                            this.setState({question: question['text']}, () => {
                                                this.setState({isLoaded: true})
                                            });
                                        });
                                })

                            }
                        });
                    });
                }
            });
    }

    fetchAnswers = () => {
        const getPlayersAnswer = new EventSource(
            url +
            ":" +
            port +
            "/api/round/answer/getAnswerCount?table_id=" +
            this.state.gameCode
        );

        getPlayersAnswer.addEventListener("message", (event) => {
            const answers = JSON.parse(event.data);
            this.setState({answers: parseInt(answers.toString(), 10)}, () => {
                if (this.state.rounds * 2 === this.state.answers) {
                  setTimeout(() => {
                      this.props.navigation.navigate("Vote", {
                          gameCode: this.state.gameCode,
                          round: this.state.firstRound,
                          roundCount: 0
                      });
                  }, 500);
                }
            });
        });
    };

    handleAnswer = (text) => {
        this.setState({answer: text});
    };

    submitAnswer = (answer) => {
        if (!answer) {
            alert("Răspunsul nu poate fi null");
        } else {
            this.setState({answered: true});

            if (this.state.user1) {
                fetch(url + ":" + port + "/api/round/setAnswer", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({idRound: this.state.roundId, answer_user_1: answer}),
                }).then();
            } else {
                fetch(url + ":" + port + "/api/round/setAnswer", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({idRound: this.state.roundId, answer_user_2: answer}),
                }).then();
            }
        }
    };

    componentWillUnmount() {
        this.getPlayersAnswer.close();
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
            <View style={styles.containerWrapper}>
                <View style={styles.container}>
                    <Text
                        style={{
                            color: "#ffffff",
                            fontSize: 18,
                            textAlign: "center",
                        }}
                    >
                        <u>{this.state.question}</u>
                    </Text>
                </View>

                <View style={styles.container}>
                    <TextInput
                        style={[
                            styles.input,
                            {borderColor: this.state.colorPrimary},
                            {backgroundColor: this.state.colorSecondary},
                        ]}
                        onChangeText={this.handleAnswer}
                    />
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {backgroundColor: this.state.colorSecondary},
                            {border: "2.5px solid " + this.state.colorPrimary},
                        ]}
                        onPress={
                            this.state.answered !== ""
                                ? () => this.submitAnswer(this.state.answer)
                                : ""
                        }
                    >
                        <Text style={styles.submitAnswerText}> Submit </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    containerWrapper: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: "#000000",
    },
    container: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        alignSelf: "stretch",
        flexWrap: "wrap",
    },
    input: {
        marginHorizontal: 15,
        height: 40,
        alignSelf: "stretch",
        borderWidth: 1,
        marginTop: 20,
        borderRadius: 30,
        paddingVertical: 10,
        paddingRight: 3,
        paddingLeft: 15,
        color: "#ffffff",
    },
    submitButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: "2rem",
        height: "3rem",
        borderRadius: 30,
        justifyContent: "center",
    },
    submitAnswerText: {
        color: "white",
        textAlign: "center",
        fontSize: 16,
    },
});
