import { getRandomInt } from './Utils';

/**
 * RGB Color.
 */
export default class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toRGBString(): string {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    toRGBAString(): string {
        return `rgb(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    /**
     * Generates random Color
     */
    static random(minVal = 0, maxVal = 255, a = 1): Color {
        return new Color(
            getRandomInt(minVal, maxVal),
            getRandomInt(minVal, maxVal),
            getRandomInt(minVal, maxVal),
            a
        );
    }
}
