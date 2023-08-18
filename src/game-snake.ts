import { BouncingObject, drawCircle, MiniGame, randomInt, wallsBouncing } from "./commons"


export class SnakeGame implements MiniGame {
    private snakeSections = 20
    private positionsPerSection = 5
    private snake: Snake = {
        speedX: 0,
        speedY: 0,
        allPositions: [],
        body: []
    }

    public initialize(ctx2D: CanvasRenderingContext2D, initTimeMs: number): void {
        const centerX = ctx2D.canvas.width / 2
        const centerY = ctx2D.canvas.height / 2
        const snakePositions = this.snakeSections * this.positionsPerSection
        for(let i=0; i<snakePositions; i++) {
            this.snake.allPositions.push({
                posX: centerX,
                posY: centerY,
            })
        }

        let r = 0
        let g = 0
        let b = 200
        for(let i=0; i<this.snakeSections; i++) {
            this.snake.body.push({
                radius: 10,
                color: rgbToColor(r, g, b)
            })
            r+=10
            g+=10
        }
        this.snake.speedX = randomInt(50, 100)
        this.snake.speedY = randomInt(50, 100)
        if (randomInt(0, 2) > 0) {
            this.snake.speedX = -this.snake.speedX
        }
        if (randomInt(0, 2) > 0) {
            this.snake.speedY = -this.snake.speedY
        }
    }

    public loop(ctx2D: CanvasRenderingContext2D, deltaMs: number): void {
        this.bounceSnake(ctx2D)
        this.moveSnake(ctx2D)
        this.drawObjects(ctx2D)
    }

    private drawObjects(ctx2D: CanvasRenderingContext2D) {
        ctx2D.clearRect(0, 0, ctx2D.canvas.width, ctx2D.canvas.height)

        for(let i=this.snake.body.length-1; i >= 0; i--) {
            const position = this.snake.allPositions[i*this.positionsPerSection]
            const section = this.snake.body[i]
            drawCircle(ctx2D, position.posX, position.posY, section.radius, section.color)
        }
    }

    private bounceSnake(ctx2D: CanvasRenderingContext2D) {
        const head: BouncingObject = {...this.snake, ...this.snake.allPositions[0], radius: this.snake.body[0].radius}
        wallsBouncing(ctx2D, head)
        this.snake.speedX = head.speedX
        this.snake.speedY = head.speedY
    }

    private moveSnake(ctx2D: CanvasRenderingContext2D) {
        for(let i=this.snake.allPositions.length-1; i > 0; i--) {
            this.snake.allPositions[i].posX = this.snake.allPositions[i-1].posX
            this.snake.allPositions[i].posY = this.snake.allPositions[i-1].posY
        }
        const head: BouncingObject = {...this.snake, ...this.snake.allPositions[0], radius: this.snake.body[0].radius}
        this.snake.allPositions[0].posX = Math.min(Math.max(head.posX + this.snake.speedX / 30.0, head.radius), ctx2D.canvas.width - head.radius)
        this.snake.allPositions[0].posY = Math.min(Math.max(head.posY + this.snake.speedY / 30.0, head.radius), ctx2D.canvas.height - head.radius)
    }
}

function rgbToColor(red: number, green: number, blue: number): string {
    let r = red.toString(16);
    let g = green.toString(16);
    let b = blue.toString(16);

    if (r.length === 1) r = "0" + r;
    if (g.length === 1) g = "0" + g;
    if (b.length === 1) b = "0" + b;

    return "#" + r + g + b;
}

// Constants


// Types
type Snake = {
    speedX: number
    speedY: number
    allPositions: {posX: number, posY: number}[]
    body: BodySection[]
}

type BodySection = {
    radius: number
    color: string
}

