import Control from './Control';

/**
 * Represents Sound Control
 */
export default class SoundControl extends Control {
    muteCallback: (() => void) | undefined;
    private _songName: HTMLElement;
    private _muteBtn: HTMLElement;

    constructor(node: HTMLElement) {
        super(node);

        this.muteCallback = undefined;
        this._songName = node.querySelector('.control__text_song-name')!;
        this._muteBtn = node.querySelector('.control__btn')!;
        this._muteBtn.addEventListener('click', () => {
            this._muteBtn.classList.toggle('icon-volume-high');
            this._muteBtn.classList.toggle('icon-volume-off');
            this.muteCallback?.();
        });
    }

    /** Update displaying song name. */
    updateSongName(name: string): void {
        this._songName.innerHTML = name;
    }
}
