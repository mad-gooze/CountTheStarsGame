import Control from './Control';

/**
 * Place where stars are displayed.
 */
export default class StarsHolder extends Control {
    constructor(node: HTMLElement) {
        super(node);
        this._hiddenClass = 'stars-holder_inactive';
    }

    get node(): HTMLElement {
        return this._node;
    }
}
