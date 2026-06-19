import { getRandomInt } from './Utils';
import type { Sounds } from './sounds';

/**
 * Plays background music and sound effects via the HTML5 Audio API.
 */
export default class SoundEffects {
    private _nextTrackCallback: (songName: string) => void;
    private _sounds: Sounds;
    private _mute = false;
    private _lastEffectNumbers: Record<string, number> = {};
    private _players: Record<number, HTMLAudioElement> = {};
    private _nextPlayerId = 0;
    private _musicPlayer: HTMLAudioElement;
    private _prevTrackNumber = -1;
    private _started = false;

    constructor(sounds: Sounds, nextTrackCallback: (songName: string) => void) {
        this._nextTrackCallback = nextTrackCallback;
        this._sounds = sounds;

        this._musicPlayer = new Audio();
        this._musicPlayer.addEventListener('ended', () => this._nextTrack());
    }

    /**
     * Start background music. Must be called from a user gesture (click/tap),
     * otherwise the browser's autoplay policy blocks playback. Safe to call
     * more than once - only the first call has an effect.
     */
    start(): void {
        if (this._started) {
            return;
        }
        this._started = true;
        this._nextTrack();
    }

    private _randomTrackNumber(): number {
        return getRandomInt(0, this._sounds.music.length - 1);
    }

    private _nextTrack(): void {
        let nextTrackNumber: number;
        do {
            nextTrackNumber = this._randomTrackNumber();
        } while (nextTrackNumber === this._prevTrackNumber); // pick a track different from the previous one

        const track = this._sounds.music[nextTrackNumber];
        this._prevTrackNumber = nextTrackNumber;

        this._musicPlayer.src = this._sounds.path + track.file;
        void this._musicPlayer.play();

        this._nextTrackCallback(track.name);
    }

    private _playSound(url: string): void {
        if (this._mute) {
            return;
        }
        const id = this._nextPlayerId++;
        const player = new Audio();
        this._players[id] = player;
        player.src = this._sounds.path + url;
        player.addEventListener('ended', () => delete this._players[id]);
        void player.play();
    }

    playEffect(effectName: string): void {
        // sounds of the effects are cycled
        let effectNumber = this._lastEffectNumbers[effectName];
        if (!Number.isInteger(effectNumber)) {
            effectNumber = -1;
        }

        effectNumber = (effectNumber + 1) % this._sounds.effects[effectName].length;
        this._playSound(this._sounds.effects[effectName][effectNumber]);
        this._lastEffectNumbers[effectName] = effectNumber;
    }

    mute(): void {
        this._mute = !this._mute;
        this._musicPlayer.muted = this._mute;
        for (const playerId in this._players) {
            this._players[playerId].muted = this._mute;
        }
    }
}
