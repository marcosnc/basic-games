import React from 'react'
import './App.css'
import { BouncingGame } from './game-bouncing'
import { MiniGame } from './commons'
import { MovingBallGame } from './game-moving-ball'
import { BallsDeflectorsGame } from './game-balls-deflection'
import { SnakeGame } from './game-snake'

function App() {

    const GAME_LOOP_CALL_INTERVAL_MS = 1

    let ctx2D: CanvasRenderingContext2D | null = null
    let gameLoopCalls = 0
    let startTimeMs = Date.now()
    let game: MiniGame | undefined = undefined

    //--------------------------------------------------
    function restart(newGame: MiniGame) {
        gameLoopCalls = 0
        startTimeMs = Date.now()
        game = newGame
    }
    //--------------------------------------------------
    setTimeout(callGameLoop, GAME_LOOP_CALL_INTERVAL_MS)
    function callGameLoop() {
        if (game) {
            if (!ctx2D) {
                const canvas: HTMLCanvasElement | null = document.getElementById('gameScreen') as HTMLCanvasElement
                if (canvas) {
                    const currentCtx2D: CanvasRenderingContext2D | null = canvas.getContext('2d')
                    if (currentCtx2D) {
                        ctx2D = currentCtx2D
                    }
                }
            }
            if (ctx2D) {
                gameLoopCalls++

                if (gameLoopCalls===1) {
                    ctx2D.clearRect(0, 0, ctx2D.canvas.width, ctx2D.canvas.height)
                    game?.initialize(ctx2D, startTimeMs)
                }
                game?.loop(ctx2D, deltaTimeFromLastCall())
            }
        }
        setTimeout(callGameLoop, GAME_LOOP_CALL_INTERVAL_MS)
    }
    //--------------------------------------------------
    let lastGameLoopCallMs = startTimeMs
    function deltaTimeFromLastCall(): number {
        const nowMs = Date.now()
        const deltaMs = nowMs - lastGameLoopCallMs
        lastGameLoopCallMs = nowMs
        return deltaMs
    }
    //--------------------------------------------------
    function showBlankGame() {
        restart({
            initialize: (ctx2D: CanvasRenderingContext2D, initTimeMs: number) => {},
            loop: (ctx2D: CanvasRenderingContext2D, deltaMs: number) => {},
        })
    }
    //--------------------------------------------------
    function showMovingBallGame() {
        restart(new MovingBallGame())
    }
    //--------------------------------------------------
    function showBouncingGame() {
        restart(new BouncingGame())
    }
    //--------------------------------------------------
    function showDeflectorsGame() {
        restart(new BallsDeflectorsGame())
    }
    //--------------------------------------------------
    function showSnakeGame() {
        restart(new SnakeGame())
    }
    //--------------------------------------------------
    return (
        <div className="App">
            <canvas id="gameScreen" width="500" height="500"></canvas>
            <div>
                <button className="GameSelectorButton" onClick={showBlankGame} >Blank</button>
                <button className="GameSelectorButton" onClick={showMovingBallGame}>Moving Ball</button>
                <button className="GameSelectorButton" onClick={showBouncingGame}>Bouncing Game</button>
                <button className="GameSelectorButton" onClick={showDeflectorsGame}>Deflectors Game</button>
                <button className="GameSelectorButton" onClick={showSnakeGame}>Snake</button>
            </div>
        </div>
    );
}
export default App
