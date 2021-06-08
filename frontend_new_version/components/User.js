import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import Switchable from "react-native-switchable";
import AsyncStorage from "@react-native-community/async-storage";

const url = "http://192.168.0.103";

const port = "8080";

export default class User extends Component {
  state = {
    colorPrimary: "#000000",
    colorSecondary: "#000000",
    name: "unnamed",
    ready: "Waiting",
  };

  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      name: props.name,
      colorPrimary: props.colorPrimary,
      colorSecondary: props.colorSecondary,
    };
  }

  getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("myData");
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      throw e;
    }
  };

  selectReady(value) {
    this.getData().then((myData) => {
      if (myData.id === this.state.id) {
        this.setState({ ready: value }, () => {
          if (this.state.ready === "Ready") {
            fetch(url + ":" + port + "/api/gameTable/incrementPlayersReady", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: this.props.gameCode,
            }).then();
          } else {
            fetch(url + ":" + port + "/api/gameTable/decrementPlayersReady", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: this.props.gameCode,
            }).then();
          }
        });
      }
    });
  }

  render() {
    return (
      <View
        style={[
          styles.userCardWrapper,
          this.state.ready === "Ready"
            ? {
                shadowOffset: {
                  width: 0,
                  height: 6,
                },
                shadowOpacity: 0.6,
                shadowRadius: 2.62,
                shadowColor: this.state.colorPrimary,
                elevation: 6,
              }
            : {
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.4,
                shadowRadius: 2.62,
                shadowColor: this.state.colorPrimary,
                elevation: 4,
              },
        ]}
      >
        <View style={styles.userCard}>
          <Text
            style={[
              styles.userFont,
              this.state.ready === "Ready"
                ? { color: this.state.colorSecondary }
                : { color: "#ffffff" },
            ]}
          >
            {this.state.name}
          </Text>
        </View>

        <Switchable
          styles={
            this.state.ready === "Ready"
              ? {
                  display: "flex",
                  flex: 1,
                  backgroundColor: this.state.colorPrimary,
                  justifyContent: "center",
                  marginRight: 20,
                }
              : {
                  display: "flex",
                  flex: 1,
                  backgroundColor: "rgba(235, 235, 245, 0.1)",
                  justifyContent: "center",
                  marginRight: 20,
                }
          }
          values={["Waiting", "Ready"]}
          onChange={this.selectReady.bind(this)}
          defaultValue={"Waiting"}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  userCardWrapper: {
    height: 50,
    backgroundColor: "#1C1C1E",
    flexDirection: "row",
    alignSelf: "stretch",
    marginHorizontal: 10,
    marginVertical: 14,
    paddingVertical: 5,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveUserCardWrapper: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 2.62,
    elevation: 4,
  },
  activeUserCardWrapper: {
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 6,
  },
  userCard: {
    alignSelf: "stretch",
    flexWrap: "nowrap",
    backgroundColor: "rgba(235, 235, 245, 0.1)",
    display: "flex",
    justifyContent: "center",
    marginLeft: 20,
    paddingLeft: 15,
    paddingRight: 20,
    borderRadius: 50,
    marginRight: 10,
  },
  userFont: {
    color: "#ffffff",
    fontSize: 22,
    letterSpacing: 2,
  },
});
