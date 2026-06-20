import ScoresControl from './controls/ScoresControl';
import MistakesControl from './controls/MistakesControl';
import SoundControl from './controls/SoundControl';
import Star from './controls/Star';
import BackgroundStars from './controls/BackgroundStars';
import MenuScreenStart from './controls/MenuScreenStart';
import MenuScreenEnd from './controls/MenuScreenEnd';
import StarsHolder from './controls/StarsHolder';

import sounds from './sounds';
import SoundEffects from './SoundEffects';
import { applyStaticTranslations } from './i18n';
import type Yandex from './yandex';

const HIDE_TIMEOUT = 800;
const NEW_STAR_EFFECT = 'newStar';
const WRONG_STAR_EFFECT = 'wrongStar';

export default class App {
    private _yandex: Yandex;
    private _best: number;
    private _mistakesControl: MistakesControl;
    private _scoresControl: ScoresControl;
    private _soundControl: SoundControl;
    private _soundEffects: SoundEffects;
    private _stars: Star[] = [];
    private _starsHolder: StarsHolder;
    private _menuScreenStart: MenuScreenStart;
    private _menuScreenEnd: MenuScreenEnd;

    constructor(yandex: Yandex, best: number) {
        this._yandex = yandex;
        this._best = best;

        applyStaticTranslations();

        const select = (selector: string) =>
            document.querySelector<HTMLElement>(selector)!;

        this._mistakesControl = new MistakesControl(select('.control_mistakes'));
        this._scoresControl = new ScoresControl(select('.control_scores'));
        this._soundControl = new SoundControl(select('.control_sound'));

        this._soundEffects = new SoundEffects(sounds, (songName) =>
            this._soundControl.updateSongName(songName)
        );
        this._soundControl.muteCallback = () => this._soundEffects.mute();

        // Browsers block audio that isn't started from a user gesture, so kick
        // off the background music on the first interaction with the page.
        document.addEventListener('pointerdown', () => this._soundEffects.start(), {
            once: true,
        });

        // Persistent, non-clickable star field drawn behind everything.
        new BackgroundStars(select('.bg-stars'));

        this._starsHolder = new StarsHolder(select('.stars-holder'));

        this._menuScreenStart = new MenuScreenStart(select('.menu__screen_start'));
        this._menuScreenStart.startGameBtn.addEventListener('click', () => {
            this._startGame();
        });

        this._menuScreenEnd = new MenuScreenEnd(select('.menu__screen_end-game'));
        this._menuScreenEnd.retryBtn.addEventListener('click', () => {
            // Yandex policy: show an interstitial between sessions, not on the
            // first play. Wait for it to close before restarting.
            void this._yandex.showFullscreenAd().then(() => this._startGame());
        });

        this._menuScreenStart.best = this._best;
        this._soundControl.show();
        this._menuScreenStart.show();
    }

    private _addStar(clickable = false, soundEffect?: string): void {
        const star = Star.generateRandom();
        this._stars.push(star);
        star.addToDOM(this._starsHolder.node);
        setTimeout(star.show.bind(star), 100);

        if (clickable) {
            star.addEventListener('click', () => {
                this._processStarClick(star);
            });
        }
        if (soundEffect) {
            this._soundEffects.playEffect(soundEffect);
        }
    }

    private _processStarClick(star: Star): void {
        const index = this._stars.indexOf(star);
        if (index === this._stars.length - 1) {
            this._scoresControl.value++;
            this._addStar(true, NEW_STAR_EFFECT);
        } else {
            this._mistakesControl.value--;
            if (this._mistakesControl.value < 0) {
                this._endGame();
                this._soundEffects.playEffect(WRONG_STAR_EFFECT);
            } else {
                this._addStar(true, WRONG_STAR_EFFECT);
            }
        }
    }

    private _endGame(): void {
        this._starsHolder.hide();
        this._mistakesControl.hide();
        this._scoresControl.hide();

        const score = this._scoresControl.value;
        const isRecord = score > this._best;
        if (isRecord) {
            this._best = score;
            void this._yandex.setBest(score);
        }

        this._menuScreenEnd.score = score;
        this._menuScreenEnd.best = this._best;
        this._menuScreenEnd.showRecord(isRecord);
        this._menuScreenEnd.show();
    }

    private _startGame(): void {
        this._menuScreenStart.hide();
        this._menuScreenEnd.hide();
        // remove drawn stars
        for (const star of this._stars) {
            star.hide();
        }
        setTimeout(() => {
            for (const star of this._stars) {
                star.remove();
            }
            this._stars = [];
            this._addStar(true, NEW_STAR_EFFECT); // add first star
        }, HIDE_TIMEOUT);

        // re-init in-game UI
        this._mistakesControl.dropValue();
        this._scoresControl.dropValue();
        this._mistakesControl.show();
        this._scoresControl.show();
        this._starsHolder.show();
    }
}
