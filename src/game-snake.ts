import { BouncingObject, drawCircle, MiniGame, ORIGIN_2D, randomInt, rgbToColor, Vector2D, wallsBouncing } from "./commons"


export class SnakeGame implements MiniGame {
    private snakes: Snake[] = []

    public initialize(ctx2D: CanvasRenderingContext2D, initTimeMs: number): void {
        this.snakes.push(new Snake(ctx2D))
        this.snakes.push(new Snake(ctx2D))
        this.snakes.push(new Snake(ctx2D))
        this.snakes.push(new Snake(ctx2D))
        this.snakes.push(new Snake(ctx2D))
    }

    public loop(ctx2D: CanvasRenderingContext2D, deltaMs: number): void {
        ctx2D.clearRect(0, 0, ctx2D.canvas.width, ctx2D.canvas.height)
        this.snakes.forEach(snake => {
            snake.move(deltaMs)
            snake.draw()
        })
    }
}

type BodySection = {
    radius: number
    color: string
}

class Snake {
    private speed: Vector2D = ORIGIN_2D
    private positions: Vector2D[] = []
    private body: BodySection[] = []

    private snakeSections = 20
    private positionsPerSection = 5

    constructor(private ctx2D: CanvasRenderingContext2D) {
        const center: Vector2D = { x: ctx2D.canvas.width / 2, y: ctx2D.canvas.height / 2 }

        const snakePositions = this.snakeSections * this.positionsPerSection
        for(let i=0; i<snakePositions; i++) {
            this.positions.push({...center})
        }

        let r = randomInt(0, 100)
        let g = randomInt(0, 100)
        let b = randomInt(0, 100)
        for(let i=0; i<this.snakeSections; i++) {
            this.body.push({
                radius: 10,
                color: rgbToColor(r, g, b)
            })
            r = Math.min(254, r+10)
            g = Math.min(254, g+10)
            b = Math.min(254, b+10)
        }
        this.speed = { x: randomInt(50, 100) * (randomInt(0, 2) > 0 ? -1 : 1), y: randomInt(50, 100) * (randomInt(0, 2) > 0 ? -1 : 1) }
    }

    public move(deltaMs: number) {
        for(let i=this.positions.length-1; i > 0; i--) {
            this.positions[i].x = this.positions[i-1].x
            this.positions[i].y = this.positions[i-1].y
        }
        const head: BouncingObject = {pos: this.positions[0], speed: this.speed, radius: this.body[0].radius}
        wallsBouncing(this.ctx2D, head)
        this.speed = head.speed
        this.positions[0].x = Math.min(Math.max(head.pos.x + this.speed.x / 30.0, head.radius), this.ctx2D.canvas.width - head.radius)
        this.positions[0].y = Math.min(Math.max(head.pos.y + this.speed.y / 30.0, head.radius), this.ctx2D.canvas.height - head.radius)
    }

    public draw() {
        for(let i=this.body.length-1; i >= 0; i--) {
            const position = this.positions[i*this.positionsPerSection]
            const section = this.body[i]
            drawCircle(this.ctx2D, position.x, position.y, section.radius, section.color)
        }
    }
}
