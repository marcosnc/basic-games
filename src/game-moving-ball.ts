import { drawCircle, isAnyKeyPressed, KEY_A, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_S, KEY_UP, MiniGame } from "./commons"

export class MovingBallGame implements MiniGame {
    private player: Ball = {
        posX: 0,
        posY: 0,
        color: "#24709c",
        radius: 25,
    }
    private dirty = false

    public initialize(ctx2D: CanvasRenderingContext2D, initTimeMs: number): void {
        this.player.posX = ctx2D.canvas.width / 2
        this.player.posY = ctx2D.canvas.height / 2
        this.drawObjects(ctx2D)
    }

    public loop(ctx2D: CanvasRenderingContext2D, deltaMs: number): void {
        this.dirty = false
        this.processKeys(ctx2D)
        if (this.dirty) {
            this.drawObjects(ctx2D)
        }
    }

    private processKeys(ctx2D: CanvasRenderingContext2D) {
        if (isAnyKeyPressed([KEY_LEFT, KEY_A]) && this.player.posX > this.player.radius) {
            this.player.posX--; this.dirty = true
        }
        if (isAnyKeyPressed([KEY_RIGHT, KEY_A]) && this.player.posX < ctx2D.canvas.width - this.player.radius) {
            this.player.posX++; this.dirty = true
        }
        if (isAnyKeyPressed([KEY_UP, KEY_A]) && this.player.posY > this.player.radius) {
            this.player.posY--; this.dirty = true
        }
        if (isAnyKeyPressed([KEY_DOWN, KEY_S]) && this.player.posY < ctx2D.canvas.height - this.player.radius) {
            this.player.posY++; this.dirty = true
        }
    }

    private drawObjects(ctx2D: CanvasRenderingContext2D) {
        ctx2D.clearRect(0, 0, ctx2D.canvas.width, ctx2D.canvas.height)

        drawCircle(ctx2D, this.player.posX, this.player.posY, this.player.radius, this.player.color)
    }

}

// Types
type Ball = {
    posX: number
    posY: number
    radius: number
    color: string
}