import MenuScreen from './MenuScreen';

/**
 * Screen of game start menu.
 */
export default class MenuScreenStart extends MenuScreen {
    startGameBtn: HTMLElement;

    constructor(node: HTMLElement) {
        super(node);
        this.startGameBtn = this._node.querySelector('.menu__btn_start-game')!;
    }
}
