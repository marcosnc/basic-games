import { BouncingObject, drawCircle, getRandomColor, MiniGame, randomInt, wallsBouncing } from "./commons"


export class SnakeGame implements MiniGame {
    private snake: Snake = {
        speedX: 0,
        speedY: 0,
        body: []
    }

    public initialize(ctx2D: CanvasRenderingContext2D, initTimeMs: number): void {
        const centerX = ctx2D.canvas.width / 2
        const centerY = ctx2D.canvas.height / 2
        let r = 0
        let g = 0
        let b = 200
        for(let i=0; i<100; i++) {
            this.snake.body.push({
                posX: centerX,
                posY: centerY,
                radius: 10,
                color: rgbToColor(r, g, b)
            })
            r+=2
            g+=2
        }
        this.snake.speedX = randomInt(0, 200) - 100
        this.snake.speedY = randomInt(0, 200) - 100
    }

    public loop(ctx2D: CanvasRenderingContext2D, deltaMs: number): void {
        this.bounceSnake(ctx2D)
        this.moveSnake(ctx2D)
        this.drawObjects(ctx2D)
    }

    private drawObjects(ctx2D: CanvasRenderingContext2D) {
        ctx2D.clearRect(0, 0, ctx2D.canvas.width, ctx2D.canvas.height)

        for(let i=this.snake.body.length-1; i >= 0; i--) {
            const section = this.snake.body[i]
            drawCircle(ctx2D, section.posX, section.posY, section.radius, section.color)
        }
    }

    private bounceSnake(ctx2D: CanvasRenderingContext2D) {
        const bouncingSnake: BouncingObject = {...this.snake, ...this.snake.body[0]}
        wallsBouncing(ctx2D, bouncingSnake)
        this.snake.speedX = bouncingSnake.speedX
        this.snake.speedY = bouncingSnake.speedY
    }

    private moveSnake(ctx2D: CanvasRenderingContext2D) {
        for(let i=this.snake.body.length-1; i > 0; i--) {
            this.snake.body[i].posX = this.snake.body[i-1].posX
            this.snake.body[i].posY = this.snake.body[i-1].posY
        }
        const head = this.snake.body[0]
        head.posX = Math.min(Math.max(head.posX + this.snake.speedX / 30.0, head.radius), ctx2D.canvas.width - head.radius)
        head.posY = Math.min(Math.max(head.posY + this.snake.speedY / 30.0, head.radius), ctx2D.canvas.height - head.radius)
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
    body: BodySection[]
}

type BodySection = {
    posX: number
    posY: number
    radius: number
    color: string
}

