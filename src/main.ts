import 'normalize.css';
import '@fontsource/poiret-one/400.css';
import './styles/style.css';

import ScoresControl from './controls/ScoresControl';
import MistakesControl from './controls/MistakesControl';
import SoundControl from './controls/SoundControl';
import Star from './controls/Star';
import MenuScreenStart from './controls/MenuScreenStart';
import MenuScreenEnd from './controls/MenuScreenEnd';
import StarsHolder from './controls/StarsHolder';

import sounds from './sounds';
import SoundEffects from './SoundEffects';
import { applyStaticTranslations } from './i18n';

const BACKGROUND_STARS_NUMBER_FACTOR = 0.0004;
const HIDE_TIMEOUT = 800;
const NEW_STAR_EFFECT = 'newStar';
const WRONG_STAR_EFFECT = 'wrongStar';

class App {
    private _mistakesControl: MistakesControl;
    private _scoresControl: ScoresControl;
    private _soundControl: SoundControl;
    private _soundEffects: SoundEffects;
    private _stars: Star[] = [];
    private _starsHolder: StarsHolder;
    private _menuScreenStart: MenuScreenStart;
    private _menuScreenEnd: MenuScreenEnd;

    constructor() {
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

        this._starsHolder = new StarsHolder(select('.stars-holder'));
        const starsNumber =
            document.body.clientWidth *
            document.body.clientHeight *
            BACKGROUND_STARS_NUMBER_FACTOR;

        for (let i = 0; i <= starsNumber; i++) {
            this._addStar();
        }

        this._menuScreenStart = new MenuScreenStart(select('.menu__screen_start'));
        this._menuScreenStart.startGameBtn.addEventListener('click', () => {
            this._startGame();
        });

        this._menuScreenEnd = new MenuScreenEnd(select('.menu__screen_end-game'));
        this._menuScreenEnd.retryBtn.addEventListener('click', () => {
            this._startGame();
        });

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

        this._menuScreenEnd.show();
        this._menuScreenEnd.score = this._scoresControl.value;
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

window.addEventListener('load', () => {
    new App();
});
