import { drawCircle, MiniGame, randomInt } from "./commons"

enum Direction {
    NONE,
    LEFT,
    RIGHT,
    UP,
    DOWN
}

enum Wall {
    TOP, RIGHT, BOTTOM, LEFT
}
const walls: Wall[] = [Wall.TOP, Wall.RIGHT, Wall.BOTTOM, Wall.LEFT]

export class BallsDeflectorsGame implements MiniGame {

    private deflectors: Deflector[] = []
    private ball: Ball = {x:-1, y:-1, direction: Direction.UP}
    private lastHittedDeflector: Deflector | undefined = undefined
    private target: Target = {x:-1, y: -1, radius: -1}
    private dirty = false

    public initialize(ctx2D: CanvasRenderingContext2D, initTimeMs: number): void {
        const game = this
        ctx2D.canvas.addEventListener('mousedown', function(evt) {
            const rect = ctx2D.canvas.getBoundingClientRect();
            const mousePoint: Point = {
                x: evt.offsetX * (ctx2D?.canvas.width ?? 0) / rect.width,
                y: evt.offsetY * (ctx2D?.canvas.height ?? 0) / rect.height
            }
            const clickedDeflector = game.deflectors.find(deflector => isInsideDeflector(deflector, mousePoint))
            if (clickedDeflector) {
                clickedDeflector.angle = 180 - clickedDeflector.angle
                game.dirty = true
            }
        }, false);

        const cols = 5
        const rows = 5
        const colSpace = ctx2D.canvas.width  / (cols + 1.0)
        const rowSpace = ctx2D.canvas.height / (rows + 1.0)
        for (let col=0; col<cols; col++) {
            for (let row=0; row<rows; row++) {
                this.deflectors.push({
                    x: (1 + col) * colSpace,
                    y: (1 + row) * rowSpace,
                    angle: 45,
                    length: 10
                })
            }
        }

        // Starts in the top of the first column, going down
        this.ball = {
            x: colSpace,
            y: 0,
            direction: Direction.DOWN
        }

        const targetWall: Wall = walls[randomInt(0, 4)]
        if (targetWall===Wall.TOP || targetWall===Wall.BOTTOM) {
            this.target.x = randomInt(1, cols+1) * colSpace
            this.target.y = targetWall===Wall.TOP ? 0 : ctx2D.canvas.height
        } else {
            this.target.x = targetWall===Wall.LEFT ? 0 : ctx2D.canvas.width
            this.target.y = randomInt(1, rows+1) * rowSpace
        }
        this.target.radius = 10

        this.drawObjects(ctx2D)
    }

    public loop(ctx2D: CanvasRenderingContext2D, deltaMs: number): void {
        if (near(this.ball, this.target, 2.0)) {
            // Taget hitted
            this.ball.x = this.target.x
            this.ball.y = this.target.y
            this.ball.direction = Direction.NONE
        }
        this.moveBall(ctx2D)
        if (this.dirty) {
            this.drawObjects(ctx2D)
        }
    }

    private moveBall(ctx2D: CanvasRenderingContext2D) {
        // Check ball collisions with edges
        if (this.ball.x<=0 && this.ball.direction===Direction.LEFT) {
            this.ball.direction=Direction.RIGHT
        } else if (this.ball.x>=ctx2D.canvas.width && this.ball.direction===Direction.RIGHT) {
            this.ball.direction=Direction.LEFT
        } else  if (this.ball.y<=0 && this.ball.direction===Direction.UP) {
            this.ball.direction=Direction.DOWN
        } else if (this.ball.y>=ctx2D.canvas.height && this.ball.direction===Direction.DOWN) {
            this.ball.direction=Direction.UP
        }

        // Check ball collisions with deflectors
        const hittedDeflector = this.deflectors.find(deflector => near(this.ball, deflector, 3.0))
        if (hittedDeflector) {
            if (!this.lastHittedDeflector || hittedDeflector!==this.lastHittedDeflector) {
                this.lastHittedDeflector = hittedDeflector
                this.ball.x = hittedDeflector.x
                this.ball.y = hittedDeflector.y
                switch (this.ball.direction) {
                    case Direction.UP:
                        this.ball.direction = hittedDeflector.angle===45 ? Direction.RIGHT : Direction.LEFT
                        break
                    case Direction.DOWN:
                        this.ball.direction = hittedDeflector.angle===45 ? Direction.LEFT : Direction.RIGHT
                        break
                    case Direction.LEFT:
                        this.ball.direction = hittedDeflector.angle===45 ? Direction.DOWN : Direction.UP
                        break
                    case Direction.RIGHT:
                        this.ball.direction = hittedDeflector.angle===45 ? Direction.UP : Direction.DOWN
                        break
                }
            }
        } else {
            this.lastHittedDeflector = undefined
        }

        // Move the ball
        switch (this.ball.direction) {
            case Direction.UP:    this.ball.y--; break
            case Direction.DOWN:  this.ball.y++; break
            case Direction.LEFT:  this.ball.x--; break
            case Direction.RIGHT: this.ball.x++; break
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
                ctx2D.moveTo(deflector.x+deflector.length, deflector.y-deflector.length)
                ctx2D.lineTo(deflector.x-deflector.length, deflector.y+deflector.length)
            } else {
                ctx2D.moveTo(deflector.x-deflector.length, deflector.y-deflector.length)
                ctx2D.lineTo(deflector.x+deflector.length, deflector.y+deflector.length)
            }
            ctx2D.stroke()
        })

        drawCircle(ctx2D, this.target.x, this.target.y, this.target.radius, "green")

        drawCircle(ctx2D, this.ball.x, this.ball.y, 5, "blue")

        this.dirty = false
    }

}

function isInsideDeflector(deflector: Deflector, point: Point): boolean {
    return near(deflector, point, deflector.length)
}

function near(p1: Point, p2: Point, distance: number): boolean {
    return Math.abs(p1.x - p2.x) <= distance
        && Math.abs(p1.y - p2.y) <= distance

}

// Types
type Point = {
    x: number
    y: number
}

type Deflector = Point & {
    angle: number
    length: number
}

type Ball = Point & {
    direction: Direction
}

type Target = Point & {
    radius: number
}