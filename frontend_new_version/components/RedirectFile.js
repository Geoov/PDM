import React, {Component} from 'react';

const url = "http://192.168.0.103";


const port = "8080";

export default class Vote extends Component {
    state = {
        gameCode: '',
        round: '',
        roundCount: '',
    }

    componentDidMount() {
        this.setState({
            gameCode: this.props.route.params.gameCode,
            roundCount: this.props.route.params.roundCount,
            round: this.props.route.params.round
        }, () => {
            console.log(this.state);
            this.props.navigation.navigate("Vote", {
                gameCode: this.state.gameCode,
                round: this.state.nextRound,
                roundCount: this.state.nextRoundCount
            });
        });
    }

    render() {
    }
}
