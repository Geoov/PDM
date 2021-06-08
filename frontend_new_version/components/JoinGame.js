import React, {Component} from 'react';
import {TextInput} from 'react-native';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';

const url = "http://192.168.0.103";
const port = "8080";

export default class JoinGame extends Component {
    state = {
        nickname: '',
        gameCode: ''
    }

    handleNickname = (text) => {
        this.setState({nickname: text})
    }

    handleGamecode = (text) => {
        this.setState({gameCode: text})
    }

    create = (nickname) => {
        if (!nickname) {
            alert("Nickname-ul nu poate fi null");
        } else {
            const config = {
                headers: {
                    "Content-Type": "text/plain",
                }
            };
            let code = '';
            axios.put(url + ':' + port + '/api/gameTable/createGameTable').then((createdGameTable) => {
                code = createdGameTable.data;
                axios.put(url + ':' + port + '/api/users/addUser', nickname, config).then(userId => {
                    axios.put(url + ':' + port + '/api/users/setTableId', {
                        user_id: userId.data,
                        table_id: code
                    }).then(_ => {
                        axios.put(url + ':' + port + '/api/gameTable/addHostId', {
                            host_id: userId.data,
                            table_id: code
                        }).then(_ => {
                            axios.put(url + ':' + port + '/api/users/setUserVotes', {
                                user_id: userId.data,
                                votes: 0
                            }).then(_ => {
                                axios.put(url + ':' + port + '/api/gameTable/incrementPlayersNr', code, config).then(_ => {
                                    axios.put(url + ':' + port + '/api/gameTable/incrementPlayersReady', code, config).then(_ => {
                                        let userData = {'id': userId.data, 'name': nickname, 'imHost': 'yes'};

                                        this.storeData(userData).then(_ => {
                                            this.props.navigation.navigate('Lobby', {
                                                gameCode: code
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
    }

// create = (nickname) => {
//     if (!nickname) {
//         alert("Nickname-ul nu poate fi null");
//     } else {
//         let code = '';
//         fetch(url + ':' + port + '/api/gameTable/createGameTable', {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'text/xml'
//             },
//         }).then(response => response.text()).then(createdGameCode => {
//             code = createdGameCode;
//             fetch(url + ':' + port + '/api/users/addUser', {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'text/xml',
//                 },
//                 body: nickname
//             }).then(response => response.text()).then(userId => {
//                 fetch(url + ':' + port + '/api/users/setTableId', {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify({user_id: userId, table_id: code})
//                 }).then(_ => {
//                     fetch(url + ':' + port + '/api/gameTable/addHostId', {
//                         method: 'PUT',
//                         headers: {
//                             'Content-Type': 'application/json'
//                         },
//                         body: JSON.stringify({host_id: userId, table_id: code})
//                     }).then(_ => {
//                         fetch(url + ':' + port + '/api/users/setUserVotes', {
//                             method: 'PUT',
//                             headers: {
//                                 'Content-Type': 'application/json'
//                             },
//                             body: JSON.stringify({user_id: userId, votes: 0})
//                         }).then(_ => {
//                             fetch(url + ':' + port + '/api/gameTable/incrementPlayersNr', {
//                                 method: 'PUT',
//                                 headers: {
//                                     'Content-Type': 'application/json'
//                                 },
//                                 body: code
//                             }).then(_ => {
//                                 fetch(url + ':' + port + '/api/gameTable/incrementPlayersReady', {
//                                     method: 'PUT',
//                                     headers: {
//                                         'Content-Type': 'application/json'
//                                     },
//                                     body: code
//                                 }).then(_ = async () => {
//                                     let userData = {'id': userId, 'name': nickname, 'imHost': 'yes'};
//
//                                     this.storeData(userData).then(_ => {
//                                         this.props.navigation.navigate('Lobby', {
//                                             gameCode: code
//                                         });
//                                     });
//                                 }).catch((err) => {
//                                     throw (err);
//                                 })
//                             }).catch((err) => {
//                                 throw (err);
//                             })
//                         }).catch((err) => {
//                             throw (err);
//                         })
//                     }).catch((err) => {
//                         throw (err);
//                     })
//                 }).catch((err) => {
//                     throw (err);
//                 })
//             }).catch((err) => {
//                 throw (err);
//             })
//         }).catch((err) => {
//             throw (err);
//         })
//     }
// }
//

    join = (nickname, gameCode) => {
        if (!nickname || !gameCode) {
            alert("Nickname-ul și codul jocului nu pot fi nule");
        } else {
            const config = {
                headers: {
                    "Content-Type": "text/plain",
                }
            };
            axios.get(url + ':' + port + '/api/gameTable/getGameTable?id=' + gameCode).then(() => {
                axios.put(url + ':' + port + '/api/users/addUser', nickname, config).then(userId => {
                    axios.put(url + ':' + port + '/api/users/setTableId', {
                        user_id: userId.data,
                        table_id: gameCode
                    }).then(_ => {
                        axios.put(url + ':' + port + '/api/users/setUserVotes', {
                            user_id: userId.data,
                            votes: 0
                        }).then(_ => {
                            axios.put(url + ':' + port + '/api/gameTable/incrementPlayersNr', gameCode, config).then(_ => {
                                // axios.put(url + ':' + port + '/api/gameTable/incrementPlayersReady', gameCode, config).then(_ => {
                                this.clearAll().then(_ => {

                                    let userData = {'id': userId.data, 'name': nickname, 'imHost': '0'};

                                    this.storeData(userData).then(_ => {
                                        this.props.navigation.navigate('Lobby', {
                                            gameCode: gameCode
                                        });
                                    });

                                    // });
                                });
                            });
                        });
                    });
                })
            });
        }
    }

// join = (nickname, gameCode) => {
//     if (!nickname || !gameCode) {
//         alert("Nickname-ul și codul jocului nu pot fi nule");
//     } else {
//         fetch(url + ':' + port + '/api/gameTable/getGameTable?id=' + gameCode, {
//             method: 'GET',
//             headers: {
//                 'Cache-Control': 'no-cache'
//             }
//         }).then(response => response.json()).then(tableData => {
//             fetch(url + ':' + port + '/api/users/addUser', {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'text/xml',
//                 },
//                 body: nickname
//             }).then(response => response.text()).then(userId => {
//                 fetch(url + ':' + port + '/api/users/setTableId', {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify({user_id: userId, table_id: gameCode})
//                 }).then(_ => {
//                     fetch(url + ':' + port + '/api/users/setUserVotes', {
//                         method: 'PUT',
//                         headers: {
//                             'Content-Type': 'application/json'
//                         },
//                         body: JSON.stringify({user_id: userId, votes: 0})
//                     }).then(_ => {
//                         fetch(url + ':' + port + '/api/gameTable/incrementPlayersNr', {
//                             method: 'PUT',
//                             headers: {
//                                 'Content-Type': 'application/json'
//                             },
//                             body: gameCode
//                         }).then(_ = async () => {
//                             this.clearAll().then(_ => {
//
//                                 let userData = {'id': userId, 'name': nickname, 'imHost': '0'};
//
//                                 this.storeData(userData).then(_ => {
//                                     this.props.navigation.navigate('Lobby', {
//                                         gameCode: gameCode
//                                     });
//                                 }).catch((err) => {
//                                     throw(err);
//                                 })
//                             }).catch((err) => {
//                                 throw(err);
//                             })
//                         }).catch((err) => {
//                             throw(err);
//                         })
//                     }).catch((err) => {
//                         throw(err);
//                     })
//                 }).catch((err) => {
//                     throw(err);
//                 })
//             }).catch((err) => {
//                 throw(err);
//             })
//         }).catch((err) => {
//             throw (err);
//         })
//     }
// }

    storeData = async (value) => {
        try {
            const jsonValue = JSON.stringify(value)
            await AsyncStorage.setItem('myData', jsonValue)
        } catch (e) {
            throw(e);
        }
    }

    clearAll = async () => {
        try {
            await AsyncStorage.clear()
        } catch (e) {
            // clear error
        }

        console.log('Cleared.')
    }

    render() {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: 42, paddingBottom: 100}}>Join Game</Text>

                <Text>Nickname</Text>

                <TextInput
                    style={styles.input}
                    onChangeText={this.handleNickname}
                />

                <Text>Game Code</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={this.handleGamecode}
                />

                <View style={{flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 30}}>
                    <TouchableOpacity
                        style={(this.state.nickname.length === 0 || this.state.gameCode.length === 0) ?
                            styles.disabledButton : styles.submitButton}
                        disabled={this.state.nickname.length === 0 || this.state.gameCode.length === 0}
                        onPress={
                            () => this.join(this.state.nickname, this.state.gameCode)
                        }>
                        <Text style={styles.submitButtonText}> Join </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={this.state.gameCode.length !== 0 ||
                        (this.state.nickname.length === 0 && this.state.gameCode.length === 0) ?
                            styles.disabledButton : styles.submitButton}
                        disabled={this.state.gameCode.length !== 0 ||
                        (this.state.nickname.length === 0 && this.state.gameCode.length === 0)}
                        onPress={
                            () => this.create(this.state.nickname)
                        }>
                        <Text style={styles.submitButtonText}> Create </Text>
                    </TouchableOpacity>

                </View>
            </View>
        );
    }
}

const
    styles = StyleSheet.create({
        container: {
            paddingTop: 23
        },
        input: {
            margin: 15,
            height: 40,
            alignSelf: 'stretch',
            borderColor: '#06bcee',
            borderWidth: 1,
            marginTop: 20,
            borderRadius: 30,
            paddingTop: 10,
            paddingRight: 3,
            paddingBottom: 10,
            paddingLeft: 15,
        },
        submitButton: {
            backgroundColor: '#06bcee',
            paddingTop: 15,
            paddingRight: 20,
            paddingBottom: 50,
            paddingLeft: 20,
            margin: 15,
            height: 40,
            minWidth: 150
        },
        submitButtonText: {
            color: 'white',
            textAlign: 'center',
        },
        disabledButton: {
            backgroundColor: '#06bcee',
            paddingTop: 15,
            paddingRight: 20,
            paddingBottom: 50,
            paddingLeft: 20,
            margin: 15,
            height: 40,
            minWidth: 150,
            opacity: 0.5
        }
    })
