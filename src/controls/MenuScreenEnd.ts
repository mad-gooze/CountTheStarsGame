import MenuScreen from './MenuScreen';
import { t } from '../i18n';

/**
 * Screen of game end menu.
 */
export default class MenuScreenEnd extends MenuScreen {
    retryBtn: HTMLElement;
    private _scoreText: HTMLElement;

    constructor(node: HTMLElement) {
        super(node);
        this.retryBtn = this._node.querySelector('.menu__btn_retry')!;
        this._scoreText = this._node.querySelector('.menu__text_end-score')!;
    }

    set score(score: number) {
        this._scoreText.textContent = t.endScore(score);
    }
}
