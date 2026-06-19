import CounterControl from './CounterControl';

/**
 * Counter Control displaying the number of counted stars.
 */
export default class ScoresControl extends CounterControl {
    private _countNode: HTMLElement;

    constructor(node: HTMLElement) {
        super(node, 0);
        this._countNode = this._node.querySelector('.control__count')!;
    }

    get value(): number {
        return super.value;
    }

    set value(val: number) {
        super.value = val;
        this._countNode.innerHTML = String(val);
    }
}
