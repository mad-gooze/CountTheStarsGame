import Control from './Control';

/**
 * Represents screen of menu.
 */
export default class MenuScreen extends Control {
    constructor(node: HTMLElement) {
        super(node);
        this._hiddenClass = 'menu__screen_inactive';
    }
}
