import React from 'react'
import './App.css'

//--------------------------------------------------
// Game State
//--------------------------------------------------
let lastCircleDrawMs = 0
//--------------------------------------------------
const GAME_LOOP_CALL_INTERVAL_MS = 1
function gameLoop() {
    const deltaMs = deltaTimeFromLastCall()
    const screen: HTMLCanvasElement | null = document.getElementById('gameScreen') as HTMLCanvasElement
    if (screen) {
        const ctx2D: CanvasRenderingContext2D | null = screen.getContext('2d')
        if (ctx2D) {
            // Game Logic
            lastCircleDrawMs += deltaMs
            if (lastCircleDrawMs > 500) {
                drawRandomCircle(ctx2D)
                lastCircleDrawMs=0
            }
        }
    }
    setTimeout(gameLoop, GAME_LOOP_CALL_INTERVAL_MS)
}
setTimeout(gameLoop, GAME_LOOP_CALL_INTERVAL_MS)
//--------------------------------------------------
const startTimeMs = Date.now()
let lastGameLoopCallMs = startTimeMs
// let elapsedTimeMs = 0
function deltaTimeFromLastCall(): number {
    const nowMs = Date.now()
    const deltaMs = nowMs - lastGameLoopCallMs
    lastGameLoopCallMs = nowMs
    // elapsedTimeMs = lastGameLoopCallMs - startTimeMs
    return deltaMs
}
//--------------------------------------------------
function drawRandomCircle(ctx2D: CanvasRenderingContext2D, minRadius: number = 5, maxRadius: number = 100) {
    ctx2D.beginPath()
    ctx2D.arc(
        randomInt(0, ctx2D.canvas.width),
        randomInt(0, ctx2D.canvas.height),
        randomInt(5, 50),
        0,
        2 * Math.PI)
    const color = getRandomColor() + "AA"
    ctx2D.fillStyle = color;
    ctx2D.fill();
    ctx2D.strokeStyle = color
    ctx2D.stroke()
}
function randomInt(lower: number, upper: number): number {
    return Math.floor((Math.random() * (upper - lower)) + lower)
}
function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}
//--------------------------------------------------

function App() {
    return (
        <div className="App">
            <canvas id="gameScreen" width="500" height="500"></canvas>
        </div>
    );
}
export default App
