import MenuScreen from './MenuScreen';
import { t } from '../i18n';

/**
 * Screen of game end menu.
 */
export default class MenuScreenEnd extends MenuScreen {
    retryBtn: HTMLElement;
    private _scoreText: HTMLElement;
    private _bestText: HTMLElement;
    private _recordText: HTMLElement;

    constructor(node: HTMLElement) {
        super(node);
        this.retryBtn = this._node.querySelector('.menu__btn_retry')!;
        this._scoreText = this._node.querySelector('.menu__text_end-score')!;
        this._bestText = this._node.querySelector('.menu__best')!;
        this._recordText = this._node.querySelector('.menu__record')!;
        this._recordText.textContent = t.newRecord;
    }

    set score(score: number) {
        this._scoreText.textContent = t.endScore(score);
    }

    set best(score: number) {
        this._bestText.textContent = t.best(score);
    }

    /** Reveal the "new record!" badge when the player beat their best. */
    showRecord(isRecord: boolean): void {
        this._recordText.style.visibility = isRecord ? 'visible' : 'hidden';
    }
}
