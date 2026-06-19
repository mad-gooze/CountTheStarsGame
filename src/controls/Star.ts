import Control from './Control';
import Color from '../Color';
import { getRandomInt } from '../Utils';

const MIN_COLOR = 180;
const MAX_COLOR = 255;

const MIN_SIZE = 8;
const MAX_SIZE = 15;

const BLINK_MIN = 1000;
const BLINK_MAX = BLINK_MIN * 100;

export default class Star extends Control {
    constructor(node: HTMLElement, blinking = false) {
        super(node);

        if (blinking) {
            // enable "blinking"
            const blinkTimeout = getRandomInt(BLINK_MIN, BLINK_MAX);
            setTimeout(() => {
                node.classList.remove('control_blinking');
                node.classList.add('control_blinking');
            }, blinkTimeout);
        }
    }

    /**
     * Generates Star object with randomized size, position and color.
     */
    static generateRandom(): Star {
        const node = document.createElement('div');
        node.classList.add('control_star');
        node.classList.add('control_hidden');

        // randomize size
        const size = getRandomInt(MIN_SIZE, MAX_SIZE);
        node.style.width = node.style.height = `${size}px`;

        // randomize position
        node.style.top = `${getRandomInt(0, 100)}%`;
        node.style.left = `${getRandomInt(0, 100)}%`;

        // randomize color
        const colors = [
            Color.random(MIN_COLOR, MAX_COLOR),
            Color.random(MIN_COLOR, MAX_COLOR),
            Color.random(MIN_COLOR, MAX_COLOR, 0.9),
        ];
        node.style.background = `radial-gradient(
                ellipse at center,
                ${colors[0].toRGBString()} 0%,
                ${colors[1].toRGBString()} 50%,
                ${colors[2].toRGBString()} 100%
            )`;
        node.style.boxShadow = `0 0 ${(size * 3) / 2}px ${colors[2].toRGBAString()}`;

        return new Star(node, true);
    }

    hide(): void {
        super.hide();
        this._node.classList.remove('control_blinking');
    }
}
