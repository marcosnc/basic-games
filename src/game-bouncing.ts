import { drawCircle, drawText, getRandomColor, isAnyKeyPressed, KEY_A, KEY_D, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_S, KEY_UP, KEY_W, MiniGame, randomInt } from "./commons"

// TODO:
// - Review the formulas that generate the new speed vectors after collision to take into account the ball shapes and bounce them taking into account the collision angle.

export class BouncingGame implements MiniGame {
    private player: Ball = {
        posX: 0,
        posY: 0,
        color: "#24709c",
        radius: 25,
        speedX: 0,
        speedY: 0
    }
    private dirty = false
    private balls: Ball[] = []
    private collisionsCount = 0
    private movingWithMouse = false
    private timePlayed: number | undefined = undefined
    private initTimeMs: number = 0

    public initialize(ctx2D: CanvasRenderingContext2D, initTimeMs: number): void {
        const game = this
        ctx2D.canvas.addEventListener('mousemove', function(evt) {
            const rect = ctx2D.canvas.getBoundingClientRect();
            const mouseX = evt.offsetX * (ctx2D?.canvas.width ?? 0) / rect.width
            const mouseY = evt.offsetY * (ctx2D?.canvas.height ?? 0) / rect.height
            if (game.movingWithMouse) {
                if (mouseX > game.player.radius && mouseX < (ctx2D?.canvas.width ?? 0) - game.player.radius && mouseY > game.player.radius && mouseY < (ctx2D?.canvas.height ?? 0) - game.player.radius) {
                    game.player.posX = mouseX
                    game.player.posY = mouseY
                }
            }
          }, false);

        ctx2D.canvas.addEventListener('mousedown', function(evt) {
            game.movingWithMouse = true;
        }, false);
        ctx2D.canvas.addEventListener('mouseup', function(evt) {
            game.movingWithMouse = false;
        }, false);

        this.player.posX = ctx2D.canvas.width / 2
        this.player.posY = ctx2D.canvas.height / 2

        while( this.balls.length < BALLS_COUNT) {
            let radius = randomInt(5, 20)
            let ball = {
                posX: radius + randomInt(0, ctx2D.canvas.width - 2*radius),
                posY: radius + randomInt(0, ctx2D.canvas.height - 2*radius),
                speedX: randomInt(0, 100) - 50,
                speedY: randomInt(0, 100) - 50,
                radius,
                color: getRandomColor() + "AA"
            }
            if (!this.checkCollision(ball, this.player) && ! this.balls.some(existingBall => this.checkCollision(ball, existingBall))) {
                this.balls.push(ball)
            }
        }
        this.initTimeMs = initTimeMs
        this.dirty = true
    }

    public loop(ctx2D: CanvasRenderingContext2D, deltaMs: number): void {
        this.dirty = false
        this.processKeys(ctx2D)
        this.detectCollisions(ctx2D)
        this.moveBalls(ctx2D)
        if (this.dirty) {
            this.drawObjects(ctx2D)
        }
    }

    private processKeys(ctx2D: CanvasRenderingContext2D) {
        if (isAnyKeyPressed([KEY_LEFT, KEY_A]) && this.player.posX > this.player.radius) {
            this.player.posX--; this.dirty = true
        }
        if (isAnyKeyPressed([KEY_RIGHT, KEY_D]) && this.player.posX < ctx2D.canvas.width - this.player.radius) {
            this.player.posX++; this.dirty = true
        }
        if (isAnyKeyPressed([KEY_UP, KEY_W]) && this.player.posY > this.player.radius) {
            this.player.posY--; this.dirty = true
        }
        if (isAnyKeyPressed([KEY_DOWN, KEY_S]) && this.player.posY < ctx2D.canvas.height - this.player.radius) {
            this.player.posY++; this.dirty = true
        }
    }

    private drawObjects(ctx2D: CanvasRenderingContext2D) {
        ctx2D.clearRect(0, 0, ctx2D.canvas.width, ctx2D.canvas.height)

        this.balls.forEach(ball => {
            drawCircle(ctx2D, ball.posX, ball.posY, ball.radius, ball.color)
        })

        if (this.player.posX < ctx2D.canvas.width/2) {
            if (this.player.posY < ctx2D.canvas.height/2) {
                this.player.color = "#24709c"
            } else {
                this.player.color = "#e91e63"
            }
        } else {
            if (this.player.posY < ctx2D.canvas.height/2) {
                this.player.color = "#cddc39"
            } else {
                this.player.color = "#ff5722"
            }
        }
        drawCircle(ctx2D, this.player.posX, this.player.posY, this.player.radius, this.player.color)
        drawText(ctx2D, 10, 20, 'Collisions: ' + this.collisionsCount, '#d40707')
        if (this.collisionsCount > MAX_COLLISIONS) {
            if (!this.timePlayed) {
                this.timePlayed = (Date.now() - this.initTimeMs) / 1000
            }
            drawText(ctx2D, 10, 50, 'Time Played: ' + this.timePlayed, '#d40707')
        }
    }

    private detectCollisions(ctx2D: CanvasRenderingContext2D) {
        let alreadyCollided = new Set<number>()
        for(let i=0; i<this.balls.length; i++) {
            let ball = this.balls[i]
            if (ball.posX <= ball.radius || ball.posX >= ctx2D.canvas.width - ball.radius) {
                ball.speedX = -ball.speedX
            }
            if (ball.posY <= ball.radius || ball.posY >= ctx2D.canvas.height - ball.radius) {
                ball.speedY = -ball.speedY
            }
            if (this.checkCollision(ball, this.player)) {
                this.collisionsCount++
                // This is not taking into account the collision angle
                let playerMass = 100000.0
                ball.speedX  = (ball.speedX * (ball.radius - playerMass) + (2.0 * playerMass * this.player.speedX)) / (ball.radius + playerMass)
                ball.speedY  = (ball.speedY * (ball.radius - playerMass) + (2.0 * playerMass * this.player.speedY)) / (ball.radius + playerMass)
                let movesLeft = 30
                while(movesLeft>0 && this.checkCollision(ball, this.player)) {
                    this.moveBall(ball, ctx2D)
                    movesLeft--
                }
                this.moveBall(ball, ctx2D)
                if (this.checkCollision(ball, this.player)) {
                    ball.posX = ctx2D.canvas.width - this.player.posX
                    ball.posY = ctx2D.canvas.height - this.player.posY
                }

            }
            if (!alreadyCollided.has(i)) {
                for(let j=i+1; j<this.balls.length; j++) {
                    let ball2 = this.balls[j]
                    if (!alreadyCollided.has(j)) {
                        if (this.checkCollision(ball, ball2)) {
                            // This is not taking into account the collision angle
                            let ballNewSpeedX  = (ball.speedX *(ball.radius -ball2.radius) + (2.0*ball2.radius*ball2.speedX)) / (ball.radius +ball2.radius)
                            let ballNewSpeedY  = (ball.speedY *(ball.radius -ball2.radius) + (2.0*ball2.radius*ball2.speedY)) / (ball.radius +ball2.radius)
                            let ball2NewSpeedX = (ball2.speedX*(ball2.radius-ball.radius ) + (2.0*ball.radius *ball.speedX )) / (ball2.radius+ball.radius )
                            let ball2NewSpeedY = (ball2.speedY*(ball2.radius-ball.radius ) + (2.0*ball.radius *ball.speedY )) / (ball2.radius+ball.radius )
                            ball.speedX = ballNewSpeedX
                            ball.speedY = ballNewSpeedY
                            this.moveBall(ball, ctx2D)
                            ball2.speedX = ball2NewSpeedX
                            ball2.speedY = ball2NewSpeedY
                            this.moveBall(ball2, ctx2D)
                            alreadyCollided.add(i)
                            alreadyCollided.add(j)
                        }
                    }
                }
            }
        }
    }
    private checkCollision(ball1: Ball, ball2: Ball): boolean {
        let distance = Math.sqrt(Math.pow(ball1.posX-ball2.posX, 2) + Math.pow(ball1.posY-ball2.posY, 2))
        return distance <= (ball1.radius + ball2.radius)
    }
    private moveBalls(ctx2D: CanvasRenderingContext2D) {
        this.balls.forEach(ball => this.moveBall(ball, ctx2D))
        this.dirty=true
    }
    private moveBall(ball:Ball, ctx2D: CanvasRenderingContext2D) {
        ball.posX = Math.min(Math.max(ball.posX + ball.speedX / 30.0, ball.radius), ctx2D.canvas.width - ball.radius)
        ball.posY = Math.min(Math.max(ball.posY + ball.speedY / 30.0, ball.radius), ctx2D.canvas.height - ball.radius)
    }
}

// Constants
const BALLS_COUNT = 10
const MAX_COLLISIONS = 25

// Types
type Ball = {
    posX: number
    posY: number
    speedX: number
    speedY: number
    radius: number
    color: string
}