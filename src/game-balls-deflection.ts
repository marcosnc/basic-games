import { drawCircle, MiniGame } from "./commons"

enum Direction {
    NONE,
    LEFT,
    RIGHT,
    UP,
    DOWN
}

export class BallsDeflectorsGame implements MiniGame {

    private deflectors: Deflector[] = []
    private ball: Ball = {posX:-1, posY:-1, direction: Direction.UP}
    private lastHittedDeflector: Deflector | undefined = undefined
    private target: Target = {posX:-1, posY: -1, radius: -1}
    private dirty = false

    public initialize(ctx2D: CanvasRenderingContext2D, initTimeMs: number): void {
        const game = this
        ctx2D.canvas.addEventListener('mousedown', function(evt) {
            const rect = ctx2D.canvas.getBoundingClientRect();
            const mouseX = evt.offsetX * (ctx2D?.canvas.width ?? 0) / rect.width
            const mouseY = evt.offsetY * (ctx2D?.canvas.height ?? 0) / rect.height
            const clickedDeflector = game.deflectors.find(deflector => isInsideDeflector(deflector, mouseX, mouseY))
            if (clickedDeflector) {
                clickedDeflector.angle = 180 - clickedDeflector.angle
                game.dirty = true
            }
        }, false);

        const cols = 5
        const rows = 5
        for (let x=0; x<cols; x++) {
            for (let y=0; y<rows; y++) {
                this.deflectors.push({
                    posX: (x+1) * ctx2D.canvas.width  / (cols+1.0),
                    posY: (y+1) * ctx2D.canvas.height / (rows+1.0),
                    angle: 45,
                    length: 10
                })
            }
        }

        this.ball = {
            posX: ctx2D.canvas.width  / (cols+1.0),
            posY: 0,
            direction: Direction.DOWN
        }

        const targetWall = Math.random()
        if (targetWall < 0.25) {
            // Top Wall
            this.target.posX = (1 + Math.floor(Math.random() * cols)) * ctx2D.canvas.width / (cols+1.0)
            this.target.posY = 0
        } else if (targetWall < 0.50) {
            // Right Wall
            this.target.posX = ctx2D.canvas.width
            this.target.posY = (1 + Math.floor(Math.random() * rows)) * ctx2D.canvas.height / (rows+1.0)
        } else if (targetWall < 0.75) {
            // Bottom Wall
            this.target.posX = (1 + Math.floor(Math.random() * cols)) * ctx2D.canvas.width  / (cols+1.0)
            this.target.posY = ctx2D.canvas.height
        } else {
            // Left Wall
            this.target.posX = 0
            this.target.posY = (1 + Math.floor(Math.random() * rows)) * ctx2D.canvas.height / (rows+1.0)
        }
        this.target.radius = 10

        this.drawObjects(ctx2D)
    }

    public loop(ctx2D: CanvasRenderingContext2D, deltaMs: number): void {
        if (Math.abs(this.ball.posX-this.target.posX)<=2.0 && Math.abs(this.ball.posY-this.target.posY)<=2.0) {
            // Taget hitted
            this.ball.posX = this.target.posX
            this.ball.posY = this.target.posY
            this.ball.direction = Direction.NONE
        }
        this.moveBall(ctx2D)
        if (this.dirty) {
            this.drawObjects(ctx2D)
        }
    }

    private moveBall(ctx2D: CanvasRenderingContext2D) {
        // Check ball collisions with edges
        if (this.ball.posX<=0 && this.ball.direction===Direction.LEFT) {
            this.ball.direction=Direction.RIGHT
        } else if (this.ball.posX>=ctx2D.canvas.width && this.ball.direction===Direction.RIGHT) {
            this.ball.direction=Direction.LEFT
        } else  if (this.ball.posY<=0 && this.ball.direction===Direction.UP) {
            this.ball.direction=Direction.DOWN
        } else if (this.ball.posY>=ctx2D.canvas.height && this.ball.direction===Direction.DOWN) {
            this.ball.direction=Direction.UP
        }

        // Check ball collisions with deflectors
        const hittedDeflector = this.deflectors.find(deflector => Math.abs(this.ball.posX-deflector.posX)<=3.0 && Math.abs(this.ball.posY-deflector.posY)<=3.0)
        if (hittedDeflector) {
            if (!this.lastHittedDeflector || hittedDeflector!==this.lastHittedDeflector) {
                this.lastHittedDeflector = hittedDeflector
                this.ball.posX = hittedDeflector.posX
                this.ball.posY = hittedDeflector.posY
                if (hittedDeflector.angle===45 && this.ball.direction===Direction.UP) {
                    this.ball.direction=Direction.RIGHT
                } else if (hittedDeflector.angle===45 && this.ball.direction===Direction.DOWN) {
                    this.ball.direction=Direction.LEFT
                } else if (hittedDeflector.angle===45 && this.ball.direction===Direction.LEFT) {
                    this.ball.direction=Direction.DOWN
                } else if (hittedDeflector.angle===45 && this.ball.direction===Direction.RIGHT) {
                    this.ball.direction=Direction.UP
                }

                if (hittedDeflector.angle===135 && this.ball.direction===Direction.UP) {
                    this.ball.direction=Direction.LEFT
                } else if (hittedDeflector.angle===135 && this.ball.direction===Direction.DOWN) {
                    this.ball.direction=Direction.RIGHT
                } else if (hittedDeflector.angle===135 && this.ball.direction===Direction.LEFT) {
                    this.ball.direction=Direction.UP
                } else if (hittedDeflector.angle===135 && this.ball.direction===Direction.RIGHT) {
                    this.ball.direction=Direction.DOWN
                }
            }
        } else {
            this.lastHittedDeflector = undefined
        }

        // Move the ball
        if (this.ball.direction===Direction.UP) {
            this.ball.posY--
        } else if (this.ball.direction===Direction.DOWN) {
            this.ball.posY++
        } else if (this.ball.direction===Direction.LEFT) {
            this.ball.posX--
        } else if (this.ball.direction===Direction.RIGHT) {
            this.ball.posX++
        }

        this.dirty = true
    }

    private drawObjects(ctx2D: CanvasRenderingContext2D) {
        ctx2D.clearRect(0, 0, ctx2D.canvas.width, ctx2D.canvas.height)
        ctx2D.strokeStyle = 'red';
        ctx2D.lineWidth = 5;

        this.deflectors.forEach(deflector => {
            ctx2D.beginPath()
            if (deflector.angle===45) {
                ctx2D.moveTo(deflector.posX+deflector.length, deflector.posY-deflector.length)
                ctx2D.lineTo(deflector.posX-deflector.length, deflector.posY+deflector.length)
            } else {
                ctx2D.moveTo(deflector.posX-deflector.length, deflector.posY-deflector.length)
                ctx2D.lineTo(deflector.posX+deflector.length, deflector.posY+deflector.length)
            }
            ctx2D.stroke()
        })

        drawCircle(ctx2D, this.target.posX, this.target.posY, this.target.radius, "green")

        drawCircle(ctx2D, this.ball.posX, this.ball.posY, 5, "blue")

        this.dirty = false
    }

}

function isInsideDeflector(deflector: Deflector, posX: number, posY: number): boolean {
    return Math.abs(posX-deflector.posX)<=deflector.length
        && Math.abs(posY-deflector.posY)<=deflector.length
}

// Types
type Deflector = {
    posX: number
    posY: number
    angle: number
    length: number
}

type Ball = {
    posX: number
    posY: number
    direction: Direction
}

type Target = {
    posX: number
    posY: number
    radius: number
}