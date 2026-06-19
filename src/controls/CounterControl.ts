import Control from './Control';

/**
 * Represents Control with a counter
 */
export default class CounterControl extends Control {
    protected _defaultValue: number;
    protected _value = 0;

    constructor(node: HTMLElement, defaultVal: number) {
        super(node);
        this._defaultValue = defaultVal;
    }

    get value(): number {
        return this._value;
    }

    set value(val: number) {
        this._value = val;
    }

    /** Drop counter to default */
    dropValue(): void {
        this.value = this._defaultValue;
    }
}
