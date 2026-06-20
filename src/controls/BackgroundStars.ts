import { getRandom, getRandomInt } from '../Utils';

// Stars per square pixel of viewport. Faint "dust" is plentiful; a handful of
// larger glowing stars accent the sky, matching the store screenshots.
const DUST_FACTOR = 0.00013;
const GLOW_FACTOR = 0.000013;

/**
 * A static, full-screen field of small non-clickable stars drawn behind the
 * game. Unlike the gameplay stars it is generated once and never cleared, so
 * the sky stays populated across the menu, a round, and the game-over screen.
 */
export default class BackgroundStars {
    constructor(container: HTMLElement) {
        const area = window.innerWidth * window.innerHeight;
        const dust = Math.round(area * DUST_FACTOR);
        const glow = Math.round(area * GLOW_FACTOR);

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < dust; i++) {
            fragment.appendChild(this._createStar(false));
        }
        for (let i = 0; i < glow; i++) {
            fragment.appendChild(this._createStar(true));
        }
        container.appendChild(fragment);
    }

    private _createStar(glowing: boolean): HTMLElement {
        const node = document.createElement('div');
        node.classList.add('bg-star');

        const size = glowing ? getRandomInt(3, 6) : getRandomInt(1, 3);
        node.style.width = node.style.height = `${size}px`;
        node.style.left = `${getRandom(0, 100)}%`;
        node.style.top = `${getRandom(0, 100)}%`;

        // Twinkle: each star fades between its own min/max opacity on its own
        // loop, desynchronised via a negative (already-running) delay.
        const maxOpacity = glowing ? getRandom(0.7, 1) : getRandom(0.3, 0.9);
        const minOpacity = maxOpacity * getRandom(0.2, 0.5);
        node.style.setProperty('--max-opacity', maxOpacity.toFixed(2));
        node.style.setProperty('--min-opacity', minOpacity.toFixed(2));
        node.style.opacity = maxOpacity.toFixed(2);
        node.style.animationDuration = `${getRandom(2, 6).toFixed(2)}s`;
        node.style.animationDelay = `-${getRandom(0, 6).toFixed(2)}s`;

        if (glowing) {
            node.classList.add('bg-star_glow');
            node.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 200, 0.8)`;
        }

        return node;
    }
}
