import React from 'react'
import './App.css'

//--------------------------------------------------
// Game State
//--------------------------------------------------
// let lastCircleDrawMs = 0
let posX = 0
let posY = 0
//--------------------------------------------------
const GAME_LOOP_CALL_INTERVAL_MS = 1
let gameLoopCalls = 0
function gameLoop() {
    gameLoopCalls++
    const deltaMs = deltaTimeFromLastCall()
    const screen: HTMLCanvasElement | null = document.getElementById('gameScreen') as HTMLCanvasElement
    if (screen) {
        const ctx2D: CanvasRenderingContext2D | null = screen.getContext('2d')
        if (ctx2D) {
            // Game Logic
            // lastCircleDrawMs += deltaMs
            // if (lastCircleDrawMs > 500) {
            //     drawRandomCircle(ctx2D)
            //     lastCircleDrawMs=0
            // }
            let dirty = false
            if (gameLoopCalls===1) {
                posX = ctx2D.canvas.width / 2
                posY = ctx2D.canvas.height / 2
                dirty = true
            }
            if ((isKeyPressed(KEY_LEFT) || isKeyPressed(KEY_A)) && posX > 0) {
                posX--; dirty = true
            }
            if ((isKeyPressed(KEY_RIGHT) || isKeyPressed(KEY_D)) && posX < ctx2D.canvas.width) {
                posX++; dirty = true
            }
            if ((isKeyPressed(KEY_UP) || isKeyPressed(KEY_W)) && posY > 0) {
                posY--; dirty = true
            }
            if ((isKeyPressed(KEY_DOWN) || isKeyPressed(KEY_S)) && posY < ctx2D.canvas.height) {
                posY++; dirty = true
            }
            if (dirty) {
                ctx2D.clearRect(0, 0, ctx2D.canvas.width, ctx2D.canvas.height)
                drawCircle(ctx2D, posX, posY, 50, "#24709c")
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
// Input Events
const KEY_LEFT  = 37, KEY_A = 65
const KEY_UP    = 38, KEY_W = 87
const KEY_RIGHT = 39, KEY_D = 68
const KEY_DOWN  = 40, KEY_S = 83
const pressedKeys: Set<number> = new Set()
document.addEventListener('keydown', event => {
    pressedKeys.add(event.keyCode)
});
document.addEventListener('keyup', event => {
    pressedKeys.delete(event.keyCode)
});
function isKeyPressed(key: number): boolean {
    return pressedKeys.has(key)
}
//--------------------------------------------------
function drawRandomCircle(ctx2D: CanvasRenderingContext2D, minRadius: number = 5, maxRadius: number = 100) {
    drawCircle(
        ctx2D,
        randomInt(0, ctx2D.canvas.width),
        randomInt(0, ctx2D.canvas.height),
        randomInt(5, 50),
        getRandomColor() + "AA")
}
function drawCircle(ctx2D: CanvasRenderingContext2D, x:number, y:number, radius: number, color: string) {
    ctx2D.beginPath()
    ctx2D.arc(x, y, radius, 0, 2 * Math.PI)
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
