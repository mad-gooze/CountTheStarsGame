import MenuScreen from './MenuScreen';

/**
 * Screen of game end menu.
 */
export default class MenuScreenEnd extends MenuScreen {
    retryBtn: HTMLElement;
    private _textScore: HTMLElement;
    private _textPlural: HTMLElement;

    constructor(node: HTMLElement) {
        super(node);
        this.retryBtn = this._node.querySelector('.menu__btn_retry')!;
        this._textScore = this._node.querySelector('.menu__text_score')!;
        this._textPlural = this._node.querySelector('.menu__text_plural')!;
    }

    set score(score: number) {
        this._textScore.innerHTML = String(score);
        this._textPlural.style.display = score === 1 ? 'none' : 'inline';
    }
}
