import React from 'react'
import './App.css'

// TODO:
// - Review the formulas that generate the new speed vectors after collision to take into account the ball shapes and bounce them taking into account the collision angle.

//--------------------------------------------------
// Game State
//--------------------------------------------------
let player: Ball = {
    posX: 0,
    posY: 0,
    color: "#24709c",
    radius: 25,
    speedX: 0,
    speedY: 0
}
let dirty = false
let balls: Ball[] = []
let collisionsCount = 0
let ctx2D: CanvasRenderingContext2D | null = null
let movingWithMouse = false
//--------------------------------------------------
const GAME_LOOP_CALL_INTERVAL_MS = 1
let gameLoopCalls = 0
function gameLoop(deltaMs: number, ctx2D: CanvasRenderingContext2D) {
    gameLoopCalls++
    // Game Logic
    dirty = false
    if (gameLoopCalls===1) {
        initialize(ctx2D)
    }
    processKeys(ctx2D)
    detectCollisions(ctx2D)
    moveBalls(ctx2D)
    if (dirty) {
        drawObjects(ctx2D)
    }
    setTimeout(callGameLoop, GAME_LOOP_CALL_INTERVAL_MS)
}
setTimeout(callGameLoop, GAME_LOOP_CALL_INTERVAL_MS)

function callGameLoop() {
    if (!ctx2D) {
        const canvas: HTMLCanvasElement | null = document.getElementById('gameScreen') as HTMLCanvasElement
        if (canvas) {
            const currentCtx2D: CanvasRenderingContext2D | null = canvas.getContext('2d')
            if (currentCtx2D) {
                ctx2D = currentCtx2D
                canvas.addEventListener('mousemove', function(evt) {
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = evt.offsetX * (ctx2D?.canvas.width ?? 0) / rect.width
                    const mouseY = evt.offsetY * (ctx2D?.canvas.height ?? 0) / rect.height
                    if (movingWithMouse) {
                        if (mouseX > player.radius && mouseX < (ctx2D?.canvas.width ?? 0) - player.radius && mouseY > player.radius && mouseY < (ctx2D?.canvas.height ?? 0) - player.radius) {
                            player.posX = mouseX
                            player.posY = mouseY
                        }
                    }
                  }, false);

                canvas.addEventListener('mousedown', function(evt) {
                    movingWithMouse = true;
                }, false);
                canvas.addEventListener('mouseup', function(evt) {
                    movingWithMouse = false;
                }, false);

            }
        }
    }
    if (ctx2D) {
        gameLoop(deltaTimeFromLastCall(), ctx2D)
    }
}
//--------------------------------------------------
type Ball = {
    posX: number
    posY: number
    speedX: number
    speedY: number
    radius: number
    color: string
}
//--------------------------------------------------
function initialize(ctx2D: CanvasRenderingContext2D) {
    player.posX = ctx2D.canvas.width / 2
    player.posY = ctx2D.canvas.height / 2

    while( balls.length < 10) {
        let radius = randomInt(5, 20)
        let ball = {
            posX: radius + randomInt(0, ctx2D.canvas.width - 2*radius),
            posY: radius + randomInt(0, ctx2D.canvas.height - 2*radius),
            speedX: randomInt(0, 100) - 50,
            speedY: randomInt(0, 100) - 50,
            radius,
            color: getRandomColor() + "AA"
        }
        if (!checkCollision(ball, player) && ! balls.some(existingBall => checkCollision(ball, existingBall))) {
            balls.push(ball)
        }
    }

    dirty = true
}
//--------------------------------------------------
function processKeys(ctx2D: CanvasRenderingContext2D) {
    if ((isKeyPressed(KEY_LEFT) || isKeyPressed(KEY_A)) && player.posX > player.radius) {
        player.posX--; dirty = true
    }
    if ((isKeyPressed(KEY_RIGHT) || isKeyPressed(KEY_D)) && player.posX < ctx2D.canvas.width - player.radius) {
        player.posX++; dirty = true
    }
    if ((isKeyPressed(KEY_UP) || isKeyPressed(KEY_W)) && player.posY > player.radius) {
        player.posY--; dirty = true
    }
    if ((isKeyPressed(KEY_DOWN) || isKeyPressed(KEY_S)) && player.posY < ctx2D.canvas.height - player.radius) {
        player.posY++; dirty = true
    }
}
//--------------------------------------------------
function moveBalls(ctx2D: CanvasRenderingContext2D) {
    balls.forEach(ball => moveBall(ball, ctx2D))
    dirty=true
}
function moveBall(ball:Ball, ctx2D: CanvasRenderingContext2D) {
    ball.posX = Math.min(Math.max(ball.posX + ball.speedX / 30.0, ball.radius), ctx2D.canvas.width - ball.radius)
    ball.posY = Math.min(Math.max(ball.posY + ball.speedY / 30.0, ball.radius), ctx2D.canvas.height - ball.radius)
}
//--------------------------------------------------
function detectCollisions(ctx2D: CanvasRenderingContext2D) {
    let alreadyCollided = new Set<number>()
    for(let i=0; i<balls.length; i++) {
        let ball = balls[i]
        if (ball.posX <= ball.radius || ball.posX >= ctx2D.canvas.width - ball.radius) {
            ball.speedX = -ball.speedX
        }
        if (ball.posY <= ball.radius || ball.posY >= ctx2D.canvas.height - ball.radius) {
            ball.speedY = -ball.speedY
        }
        if (checkCollision(ball, player)) {
            collisionsCount++
            // This is not taking into account the collision angle
            let playerMass = 100000.0
            ball.speedX  = (ball.speedX * (ball.radius - playerMass) + (2.0 * playerMass * player.speedX)) / (ball.radius + playerMass)
            ball.speedY  = (ball.speedY * (ball.radius - playerMass) + (2.0 * playerMass * player.speedY)) / (ball.radius + playerMass)
            let movesLeft = 30
            while(movesLeft>0 && checkCollision(ball, player)) {
                moveBall(ball, ctx2D)
                movesLeft--
            }
            moveBall(ball, ctx2D)
            if (checkCollision(ball, player)) {
                ball.posX = ctx2D.canvas.width - player.posX
                ball.posY = ctx2D.canvas.height - player.posY
            }

        }
        if (!alreadyCollided.has(i)) {
            for(let j=i+1; j<balls.length; j++) {
                let ball2 = balls[j]
                if (!alreadyCollided.has(j)) {
                    if (checkCollision(ball, ball2)) {
                        // This is not taking into account the collision angle
                        let ballNewSpeedX  = (ball.speedX *(ball.radius -ball2.radius) + (2.0*ball2.radius*ball2.speedX)) / (ball.radius +ball2.radius)
                        let ballNewSpeedY  = (ball.speedY *(ball.radius -ball2.radius) + (2.0*ball2.radius*ball2.speedY)) / (ball.radius +ball2.radius)
                        let ball2NewSpeedX = (ball2.speedX*(ball2.radius-ball.radius ) + (2.0*ball.radius *ball.speedX )) / (ball2.radius+ball.radius )
                        let ball2NewSpeedY = (ball2.speedY*(ball2.radius-ball.radius ) + (2.0*ball.radius *ball.speedY )) / (ball2.radius+ball.radius )
                        ball.speedX = ballNewSpeedX
                        ball.speedY = ballNewSpeedY
                        moveBall(ball, ctx2D)
                        ball2.speedX = ball2NewSpeedX
                        ball2.speedY = ball2NewSpeedY
                        moveBall(ball2, ctx2D)
                        alreadyCollided.add(i)
                        alreadyCollided.add(j)
                    }
                }
            }
        }
}
}
function checkCollision(ball1: Ball, ball2: Ball): boolean {
    let distance = Math.sqrt(Math.pow(ball1.posX-ball2.posX, 2) + Math.pow(ball1.posY-ball2.posY, 2))
    return distance <= (ball1.radius + ball2.radius)
}
//--------------------------------------------------
function drawObjects(ctx2D: CanvasRenderingContext2D) {
    ctx2D.clearRect(0, 0, ctx2D.canvas.width, ctx2D.canvas.height)

    balls.forEach(ball => {
        drawCircle(ctx2D, ball.posX, ball.posY, ball.radius, ball.color)
    })

    if (player.posX < ctx2D.canvas.width/2) {
        if (player.posY < ctx2D.canvas.height/2) {
            player.color = "#24709c"
        } else {
            player.color = "#e91e63"
        }
    } else {
        if (player.posY < ctx2D.canvas.height/2) {
            player.color = "#cddc39"
        } else {
            player.color = "#ff5722"
        }
    }
    drawCircle(ctx2D, player.posX, player.posY, player.radius, player.color)
    drawText(ctx2D, 10, 20, 'Collisions: ' + collisionsCount, '#d40707')
}
//--------------------------------------------------
const startTimeMs = Date.now()
let lastGameLoopCallMs = startTimeMs
function deltaTimeFromLastCall(): number {
    const nowMs = Date.now()
    const deltaMs = nowMs - lastGameLoopCallMs
    lastGameLoopCallMs = nowMs
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
function drawCircle(ctx2D: CanvasRenderingContext2D, x:number, y:number, radius: number, color: string) {
    ctx2D.beginPath()
    ctx2D.arc(x, y, radius, 0, 2 * Math.PI)
    ctx2D.fillStyle = color;
    ctx2D.fill();
    ctx2D.strokeStyle = color
    ctx2D.stroke()
    ctx2D.closePath()
}
function drawText(ctx2D: CanvasRenderingContext2D, x:number, y:number, text: string, color: string) {
    ctx2D.fillStyle = color;
    ctx2D.font = 'bold 14px sans-serif'
    ctx2D.fillText(text, x, y)
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
