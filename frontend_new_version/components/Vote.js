import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

const url = "http://192.168.0.103";
// const url = "http://172.20.98.20";
const port = "8080";

export default class Vote extends Component {
    state = {
        gameCode: '',
        round: '',
        roundCount: '',
        nextRoundCount: '',
        nextRound: '',
        colorUser1: 'green',
        colorUser2: 'red',
        votesCount: 0,
        vote: 0,
        idRound: '',
        question: 'Întrebare..?',
        answerUser1: 'Răspuns 1',
        answerUser2: 'Răspuns 2',
        idUser1: '',
        idUser2: '',
        voted1: false,
        voted2: false,
        currentUser: false,
        newRound: false
    }

    componentDidMount() {
        this.setState({
            gameCode: this.props.route.params.gameCode,
            roundCount: this.props.route.params.roundCount,
            round: this.props.route.params.round
        }, () => {
            this.assignAnswers();
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !this.state.newRound; // la false se apeleaza WillComponentUpdate si va reinitializa toate starile
    }

    assignAnswers = () => {
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
                this.setState({newRound: true});
                roundDetails = JSON.parse(roundDetails);

                if (!this.state.nextRoundCount) {
                    this.setState({nextRoundCount: 0});
                }

                for (let i = 0; i < roundDetails.length; i++) {
                    if (this.state.roundCount + 2 < roundDetails.length * 2) {
                        this.setState({nextRoundCount: this.state.roundCount + 2});
                    } else {
                        this.setState({nextRoundCount: 100});
                    }

                    if (this.state.nextRoundCount !== 100) {
                        (this.state.nextRoundCount === roundDetails[i].contor) ?
                            this.setState({nextRound: roundDetails[i].id}) : '';
                    } else {
                        this.setState({nextRound: 'finish'});
                    }

                    if (roundDetails[i].contor === this.state.roundCount) {
                        this.setState({
                            idRound: roundDetails[i].id, answerUser1: roundDetails[i].answerUser1,
                            answerUser2: roundDetails[i].answerUser2, idUser1: roundDetails[i].idUser1,
                            idUser2: roundDetails[i].idUser2
                        }, () => {
                            this.getData().then((myData) => {
                                if (this.state.idUser1 === myData.id || this.state.idUser2 === myData.id) {
                                    this.setState({currentUser: false});
                                    // ar trebui sa fie true, dar ca sa mearga cu 2 useri.. am pus pe false
                                }

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
                                            this.setState({isLoaded: true}, () => {
                                                this.fetchVotes();
                                            })
                                        });
                                    });


                            })
                        });
                    }

                    if (roundDetails.length === 1) {
                        this.setState({votesCount: 2});
                    } else {
                        this.setState({votesCount: roundDetails.length * 2 - 2});
                    }
                }

            });
    }

    fetchVotes = () => {
        const getPlayersVotes = new EventSource(
            url +
            ":" +
            port +
            "/api/round/vote/getVoteCount?round_id=" +
            this.state.idRound
        );

        getPlayersVotes.addEventListener("message", (event) => {
            const votes = JSON.parse(event.data);
            this.setState({votes: parseInt(votes.toString(), 10)});
            if (this.state.votesCount === this.state.votes) {
                fetch(url + ":" + port + '/api/round/vote/checkVotes?round_id=' + this.state.idRound, {
                    method: 'GET'
                }).then(response => response.text()).then(verifiedVotes => {
                    if (parseInt(this.state.votes, 10) === parseInt(verifiedVotes, 10)) {

                        if (this.state.nextRound !== 'finish') {
                            this.props.navigation.navigate("Vote", {
                                gameCode: this.state.gameCode,
                                round: this.state.nextRound,
                                roundCount: parseInt(this.state.nextRoundCount, 10)
                            }, () => {
                                this.setState({newRound: true});
                            });
                        } else {
                            this.props.navigation.navigate("Leaderboard", {
                                gameCode: this.state.gameCode
                            })
                        }
                    }
                });
            }
        });
    }

    voteUser(value) {
        if (value === "user1") {
            this.getData().then((myData) => {
                // if (myData.id !== this.state.idUser1 && myData.id !== this.state.idUser2) { - comentata doar ca sa mearga cu 2 useri
                    fetch(url + ":" + port + "/api/round/setVotes", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({idRound: this.state.idRound, votes_user_1: 1}),
                    }).then(() => {
                        this.setState({colorUser1: myData.colorPrimary});
                    })
                // }
            })
            this.setState({voted1: true});
        } else if (value === "user2") {
            this.getData().then((myData) => {
                // if (myData.id !== this.state.idUser1 && myData.id !== this.state.idUser2) {
                    fetch(url + ":" + port + "/api/round/setVotes", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({idRound: this.state.idRound, votes_user_2: 1}),
                    }).then(() => {
                        this.setState({colorUser2: myData.colorPrimary});
                    })
                // }
            })
            this.setState({voted2: true});
        }
    }


    //
    // voteUser(value) {
    //     if (value === this.state.idUser1) {
    //         this.getData().then((myData) => {
    //             if (myData.id === this.state.idUser1) {
    //                 fetch(url + ":" + port + "/api/round/setVotes", {
    //                     method: "PUT",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                     },
    //                     body: JSON.stringify({idRound: this.state.idRound, votes_user_1: 1}),
    //                 }).then(() => {
    //                     this.setState({colorUser1: myData.colorPrimary});
    //                 })
    //             }
    //         })
    //         this.setState({voted1: true});
    //     } else if (value === this.state.idUser2) {
    //         this.getData().then((myData) => {
    //             if (myData.id === this.state.idUser2) {
    //                 fetch(url + ":" + port + "/api/round/setVotes", {
    //                     method: "PUT",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                     },
    //                     body: JSON.stringify({idRound: this.state.idRound, votes_user_2: 1}),
    //                 }).then(() => {
    //                     this.setState({colorUser2: myData.colorPrimary});
    //                 })
    //             }
    //         })
    //         this.setState({voted2: true});
    //     }
    // }

    componentWillUnmount() {
        this.getPlayersVotes.close();
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
                <View style={[styles.container, {flexBasis: '20%'}]}>
                    <Text style={{
                        color: '#ffffff',
                        fontSize: '2.22rem',
                    }}>{this.state.question}</Text>
                </View>
                <View style={[styles.container, {flexBasis: '80%'}, {padding: '10px'}]}>
                    <View
                        style={[styles.userContainer, this.state.voted1 ? {border: '3px solid ' + this.state.colorUser1} : ""]}
                        onClick={!this.state.voted1 && !this.state.voted2 && !this.state.currentUser ?
                            () => this.voteUser("user1") : () => ''}>
                        <Text style={[styles.userFont, this.state.voted1 ? {color: this.state.colorUser1} : '']}>
                            {this.state.answerUser1}
                        </Text>
                        {this.state.voted1 === false && this.state.voted2 === false &&
                        <Text style={{color: '#ffffff', marginTop: '1.5rem'}}>Apăsați pe răspuns pentru a-l vota.</Text>
                        }
                    </View>
                    <View
                        style={[styles.userContainer, this.state.voted2 ? {border: '3px solid ' + this.state.colorUser2} : ""]}
                        onClick={!this.state.voted1 && !this.state.voted2 && !this.state.currentUser
                            ? () => this.voteUser("user2") : () => ''}>
                        <Text style={[styles.userFont, this.state.voted2 ? {color: this.state.colorUser2} : '']}>
                            {this.state.answerUser2}
                        </Text>
                        {this.state.voted1 === false && this.state.voted2 === false &&
                        <Text style={{color: '#ffffff', marginTop: '1.5rem'}}>Apăsați pe răspuns pentru a-l vota.</Text>
                        }
                    </View>
                </View>
            </View>
        )
    }
}

const
    styles = StyleSheet.create({
        containerWrapper: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            alignSelf: 'stretch',
            backgroundColor: '#000000'
        },
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'stretch'
        },
        userContainer: {
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'stretch'
        },
        userFont: {
            color: '#ffffff',
            fontSize: 23
        }
    });
