import CounterControl from './CounterControl';

const ALLOWED_MISTAKES = 3;

/**
 * Control for displaying how many mistakes are left
 */
export default class MistakesControl extends CounterControl {
    private _starIcons: HTMLElement[] = [];

    constructor(node: HTMLElement) {
        super(node, ALLOWED_MISTAKES);

        for (let i = 0; i < this._defaultValue; i++) {
            const icon = document.createElement('div');
            icon.classList.add('control__star-icon');
            this._starIcons.push(icon);
            this._node.appendChild(icon);
        }
    }

    get value(): number {
        return super.value;
    }

    set value(val: number) {
        val = Math.min(this._defaultValue, val);

        super.value = val;

        // show star icons from 0 to counter - 1, hide the others
        for (let i = 0; i < this.value; i++) {
            this._starIcons[i].style.opacity = '1';
        }
        for (let i = Math.max(this.value, 0); i < this._defaultValue; i++) {
            this._starIcons[i].style.opacity = '0';
        }
    }
}
