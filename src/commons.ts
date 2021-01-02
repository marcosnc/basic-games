//--------------------------------------------------
export interface MiniGame {
    initialize(ctx2D: CanvasRenderingContext2D, initTimeMs: number): void
    loop(ctx2D: CanvasRenderingContext2D, deltaMs: number): void
}
//--------------------------------------------------
export const KEY_LEFT  = 37, KEY_A = 65
export const KEY_UP    = 38, KEY_W = 87
export const KEY_RIGHT = 39, KEY_D = 68
export const KEY_DOWN  = 40, KEY_S = 83
//--------------------------------------------------
// Input Events
const pressedKeys: Set<number> = new Set()
document.addEventListener('keydown', event => {
    pressedKeys.add(event.keyCode)
});
document.addEventListener('keyup', event => {
    pressedKeys.delete(event.keyCode)
});
export function isKeyPressed(key: number): boolean {
    return pressedKeys.has(key)
}
export function isAnyKeyPressed(keys: number[]): boolean {
    return keys.some(key => isKeyPressed(key))
}
//--------------------------------------------------
export function drawCircle(ctx2D: CanvasRenderingContext2D, x:number, y:number, radius: number, color: string) {
    ctx2D.beginPath()
    ctx2D.arc(x, y, radius, 0, 2 * Math.PI)
    ctx2D.fillStyle = color;
    ctx2D.fill();
    ctx2D.strokeStyle = color
    ctx2D.stroke()
    ctx2D.closePath()
}
export function drawText(ctx2D: CanvasRenderingContext2D, x:number, y:number, text: string, color: string) {
    ctx2D.fillStyle = color;
    ctx2D.font = 'bold 14px sans-serif'
    ctx2D.fillText(text, x, y)
}
export function randomInt(lowerIncluded: number, upperExcluded: number): number {
    return Math.floor((Math.random() * (upperExcluded - lowerIncluded)) + lowerIncluded)
}
export function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}
//--------------------------------------------------
