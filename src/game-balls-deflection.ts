import { drawCircle, drawText, MiniGame, randomInt } from "./commons"

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

const ANGLE1 = 45
const ANGLE2 = 180 - ANGLE1
export class BallsDeflectorsGame implements MiniGame {

    private deflectors: Deflector[] = []
    private ball: Ball = {x:-1, y:-1, direction: Direction.UP}
    private lastHittedDeflector: Deflector | undefined = undefined
    private target: Target = {x:-1, y: -1, radius: -1}
    private dirty = false
    private initTimeMs: number = 0
    private targetHitted = false
    private timePlayed: number | undefined = undefined
    private bouncesCount: number = 0
    private randomBallStart: RandomPlaceInWall = {x:-1, y:-1, wall: Wall.TOP}

    public initialize(ctx2D: CanvasRenderingContext2D, initTimeMs: number): void {
        this.initTimeMs = initTimeMs
        this.bouncesCount = 0

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
            } else {
                if (game.ball.direction===Direction.NONE && !game.targetHitted) {
                    switch( game.randomBallStart.wall) {
                        case Wall.BOTTOM: game.ball.direction = Direction.UP;    break
                        case Wall.LEFT:   game.ball.direction = Direction.RIGHT; break
                        case Wall.RIGHT:  game.ball.direction = Direction.LEFT;  break
                        case Wall.TOP:    game.ball.direction = Direction.DOWN;  break
                    }
                }
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
                    angle: randomInt(0,2)===0 ? ANGLE1 : ANGLE2,
                    length: 10
                })
            }
        }

        // Pick a random start for the ball
        this.randomBallStart = this.pickRandomPlaceInWall(ctx2D, cols, rows, colSpace, rowSpace)
        this.ball = {
            x: this.randomBallStart.x,
            y: this.randomBallStart.y,
            direction: Direction.NONE
        }

        // Pick a random target (different from the ball start)
        let randomTarget: RandomPlaceInWall = {x: this.ball.x, y: this.ball.y, wall: Wall.TOP}
        while( randomTarget.x===this.ball.x && randomTarget.y===this.ball.y) {
            randomTarget = this.pickRandomPlaceInWall(ctx2D, cols, rows, colSpace, rowSpace)
        }
        this.target.x = randomTarget.x
        this.target.y = randomTarget.y
        this.target.radius = 10

        this.drawObjects(ctx2D)
    }

    private pickRandomPlaceInWall(ctx2D: CanvasRenderingContext2D, cols: number, rows: number, colSpace: number, rowSpace: number): RandomPlaceInWall {
        const wall: Wall = walls[randomInt(0, 4)]
        if (wall===Wall.TOP || wall===Wall.BOTTOM) {
            return {
                x: randomInt(1, cols+1) * colSpace,
                y: wall===Wall.TOP ? 0 : ctx2D.canvas.height,
                wall
            }
        }
        return {
            x: wall===Wall.LEFT ? 0 : ctx2D.canvas.width,
            y: randomInt(1, rows+1) * rowSpace,
            wall
        }
    }

    public loop(ctx2D: CanvasRenderingContext2D, deltaMs: number): void {
        if (near(this.ball, this.target, 2.0) && this.ball.direction!==Direction.NONE) {
            // Taget hitted
            this.targetHitted = true
            this.ball.x = this.target.x
            this.ball.y = this.target.y
            this.ball.direction = Direction.NONE
            this.timePlayed = (Date.now() - this.initTimeMs) / 1000
        }
        this.moveBall(ctx2D)
        if (this.dirty) {
            this.drawObjects(ctx2D)
        }
    }

    private moveBall(ctx2D: CanvasRenderingContext2D) {
        // Check ball collisions with edges
        if (this.ball.x<=0 && this.ball.direction===Direction.LEFT) {
            this.ball.direction=Direction.RIGHT; this.bouncesCount++
        } else if (this.ball.x>=ctx2D.canvas.width && this.ball.direction===Direction.RIGHT) {
            this.ball.direction=Direction.LEFT; this.bouncesCount++
        } else  if (this.ball.y<=0 && this.ball.direction===Direction.UP) {
            this.ball.direction=Direction.DOWN; this.bouncesCount++
        } else if (this.ball.y>=ctx2D.canvas.height && this.ball.direction===Direction.DOWN) {
            this.ball.direction=Direction.UP; this.bouncesCount++
        }

        // Check ball collisions with deflectors
        const hittedDeflector = this.deflectors.find(deflector => near(this.ball, deflector, 3.0))
        if (hittedDeflector) {
            if (!this.lastHittedDeflector || hittedDeflector!==this.lastHittedDeflector) {
                ; this.bouncesCount++
                this.lastHittedDeflector = hittedDeflector
                this.ball.x = hittedDeflector.x
                this.ball.y = hittedDeflector.y
                switch (this.ball.direction) {
                    case Direction.UP:
                        this.ball.direction = hittedDeflector.angle===ANGLE1 ? Direction.RIGHT : Direction.LEFT
                        break
                    case Direction.DOWN:
                        this.ball.direction = hittedDeflector.angle===ANGLE1 ? Direction.LEFT : Direction.RIGHT
                        break
                    case Direction.LEFT:
                        this.ball.direction = hittedDeflector.angle===ANGLE1 ? Direction.DOWN : Direction.UP
                        break
                    case Direction.RIGHT:
                        this.ball.direction = hittedDeflector.angle===ANGLE1 ? Direction.UP : Direction.DOWN
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
            if (deflector.angle===ANGLE1) {
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

        drawText(ctx2D, 10, 20, 'Bouces: ' + this.bouncesCount, '#d40707')
        if (this.targetHitted) {
            drawText(ctx2D, 10, 50, 'Time Played: ' + this.timePlayed, '#d40707')
        }

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

type RandomPlaceInWall = Point & {
    wall: Wall
}
