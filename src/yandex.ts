/**
 * Thin wrapper around the Yandex Games SDK.
 *
 * The SDK is only present when the game runs inside the Yandex Games iframe,
 * where `/sdk.js` is served by the platform. Everywhere else (local dev,
 * GitHub Pages) the script fails to load and we fall back to a no-op
 * implementation that persists the best score in `localStorage`, so the game
 * stays fully playable off-platform.
 */

const BEST_KEY = 'best';
/** Don't block startup forever if an ad never fires its callbacks. */
const ADV_TIMEOUT = 8000;

interface YaPlayer {
    getData(keys?: string[]): Promise<Record<string, unknown>>;
    setData(data: Record<string, unknown>, flush?: boolean): Promise<void>;
}

interface YaAdvCallbacks {
    onOpen?: () => void;
    onClose?: (wasShown?: boolean) => void;
    onError?: (error: unknown) => void;
    onRewarded?: () => void;
}

interface YaSDK {
    environment: { i18n: { lang: string } };
    features?: { LoadingAPI?: { ready(): void } };
    adv: {
        showFullscreenAdv(opts: { callbacks: YaAdvCallbacks }): void;
        showRewardedVideo(opts: { callbacks: YaAdvCallbacks }): void;
    };
    getPlayer(opts?: { scopes?: boolean }): Promise<YaPlayer>;
}

declare global {
    interface Window {
        YaGames?: { init(): Promise<YaSDK> };
    }
}

function loadSdkScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.YaGames) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = '/sdk.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Yandex SDK unavailable'));
        document.head.appendChild(script);
    });
}

/**
 * Wraps the platform SDK, exposing only what the game needs. When the SDK is
 * unavailable, `sdk`/`player` stay `null` and every method degrades to a sane
 * local fallback.
 */
export default class Yandex {
    /**
     * Language reported by the platform (e.g. "ru", "be", "tr"), or `null` when
     * the SDK is absent — in which case i18n falls back to ?lang / the browser.
     */
    readonly lang: string | null;
    private _sdk: YaSDK | null;
    private _player: YaPlayer | null;

    private constructor(sdk: YaSDK | null, player: YaPlayer | null) {
        this._sdk = sdk;
        this._player = player;
        this.lang = sdk?.environment.i18n.lang ?? null;
    }

    static async init(): Promise<Yandex> {
        try {
            await loadSdkScript();
            const sdk = await window.YaGames!.init();
            // `scopes: false` lets us store progress without a login prompt.
            const player = await sdk
                .getPlayer({ scopes: false })
                .catch(() => null);
            return new Yandex(sdk, player);
        } catch {
            return new Yandex(null, null);
        }
    }

    /** Tell the platform the game has finished loading and is interactive. */
    ready(): void {
        this._sdk?.features?.LoadingAPI?.ready();
    }

    async getBest(): Promise<number> {
        if (this._player) {
            try {
                const data = await this._player.getData([BEST_KEY]);
                const value = Number(data[BEST_KEY]);
                if (Number.isFinite(value)) return value;
            } catch {
                /* fall through to local storage */
            }
        }
        return Number(localStorage.getItem(BEST_KEY)) || 0;
    }

    async setBest(value: number): Promise<void> {
        try {
            localStorage.setItem(BEST_KEY, String(value));
        } catch {
            /* private mode / storage disabled */
        }
        if (this._player) {
            try {
                await this._player.setData({ [BEST_KEY]: value });
            } catch {
                /* best-effort; local copy already saved */
            }
        }
    }

    /**
     * Show a fullscreen interstitial ad and resolve once it is closed (or
     * failed, or the platform is absent). Never rejects, so callers can simply
     * `await` it before continuing the game.
     */
    showFullscreenAd(): Promise<void> {
        const adv = this._sdk?.adv;
        if (!adv) return Promise.resolve();

        return new Promise((resolve) => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                resolve();
            };
            const timer = window.setTimeout(finish, ADV_TIMEOUT);
            const close = () => {
                window.clearTimeout(timer);
                finish();
            };
            adv.showFullscreenAdv({
                callbacks: { onClose: close, onError: close },
            });
        });
    }
}
