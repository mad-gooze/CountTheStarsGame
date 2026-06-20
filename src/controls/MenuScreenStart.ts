import MenuScreen from './MenuScreen';
import { t } from '../i18n';

/**
 * Screen of game start menu.
 */
export default class MenuScreenStart extends MenuScreen {
    startGameBtn: HTMLElement;
    private _bestText: HTMLElement;

    constructor(node: HTMLElement) {
        super(node);
        this.startGameBtn = this._node.querySelector('.menu__btn_start-game')!;
        this._bestText = this._node.querySelector('.menu__best')!;
    }

    /** Show the personal best, or nothing until the player has a record. */
    set best(score: number) {
        this._bestText.textContent = score > 0 ? t.best(score) : '';
    }
}
