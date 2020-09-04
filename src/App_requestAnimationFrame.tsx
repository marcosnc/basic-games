import React from 'react';
import './App.css';

class GameLoop extends React.Component {
    private animationID: number|null;
    private callNumber: number;
    constructor(props: any) {
        super(props);
        this.animationID = null;
        this.callNumber = 0;
    }

    componentDidMount() {
        this.animationID = window.requestAnimationFrame(() => this.update());
    }
    componentWillUnmount() {
        if (this.animationID) {
            window.cancelAnimationFrame(this.animationID);
        }
    }

    update() {
        this.callNumber++;
        const now = new Date()
        console.log(this.callNumber, now)
        this.animationID = window.requestAnimationFrame(() => this.update());
    }

    render() {
        return(
            <div>The Game Loop</div>
        )
    }
}

function App() {
    return (
        <div className="App">
            <canvas id="myCanvas" width="500" height="500"></canvas>
            <GameLoop />
        </div>
    );
}

export default App;
