import 'normalize.css';
import '@fontsource/poiret-one/400.css';
import './styles/style.css';

import Yandex from './yandex';

/**
 * Bootstrap order matters: the Yandex SDK reports the player's language, and our
 * i18n layer resolves the active language at module-evaluation time. So we
 * initialise the SDK, publish the language on `window`, and only then load the
 * game module so its translations come up in the right language from the start.
 */
async function bootstrap(): Promise<void> {
    const yandex = await Yandex.init();
    // Only override i18n when the platform actually told us a language; off
    // platform we let ?lang / the browser decide.
    if (yandex.lang) {
        window.__GAME_LANG__ = yandex.lang;
    }

    const best = await yandex.getBest();

    const { default: App } = await import('./App');
    new App(yandex, best);

    // Hide the platform loading splash now that the game is interactive.
    yandex.ready();
}

window.addEventListener('load', () => {
    void bootstrap();
});
