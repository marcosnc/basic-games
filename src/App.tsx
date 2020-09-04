import React from 'react';
import './App.css';

/* Option 1: Using simple game loop and setInterval
var callNumber:number = 0;
function gameLoop() {
    callNumber++;
    const now = new Date()
    console.log(callNumber, now)
}
setInterval(gameLoop, 1);
*/

// /* Option 2: Using GameLoop component and window.requestAnimationFrame
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
// */

function App() {
    return (
        <div className="App">
            <canvas id="myCanvas" width="500" height="500"></canvas>
            <GameLoop />
        </div>
    );
}

export default App;
