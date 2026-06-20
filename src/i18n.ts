/**
 * Tiny i18n layer. The active language is chosen from the language the Yandex
 * Games SDK reports (set on `window` by the bootstrap before this module is
 * imported), falling back to the `?lang` query param (en | ru | tr), then the
 * browser language, then English.
 */

export type Lang = 'en' | 'ru' | 'tr';

export interface Messages {
    /** Document <title>. */
    title: string;
    /** Start-screen heading. */
    heading: string;
    /** Start-screen description. */
    intro: string;
    /** Start-game button. */
    start: string;
    /** Retry button. */
    retry: string;
    /** "Counted stars:" label (trailing NBSP keeps a gap before the count). */
    countedStars: string;
    /** "Mistakes left:" label. */
    mistakesLeft: string;
    /** End-screen sentence, with language-correct pluralisation. */
    endScore(score: number): string;
    /** Best-score label, e.g. "Best: 42". */
    best(score: number): string;
    /** Shown on the end screen when the player beats their record. */
    newRecord: string;
}

/** Russian plural selector (one / few / many). */
function ruPlural(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
}

const MESSAGES: Record<Lang, Messages> = {
    en: {
        title: 'Count The Stars - a simple meditative game',
        heading: 'Count The Stars',
        intro: 'Count the stars by clicking them as they appear in the sky. Try to count as many of them as you can.',
        start: 'Start',
        retry: 'Retry',
        countedStars: 'Counted stars: ',
        mistakesLeft: 'Mistakes left:',
        endScore: (n) => `You have counted ${n} ${n === 1 ? 'star' : 'stars'}`,
        best: (n) => `Best: ${n}`,
        newRecord: 'New record!',
    },
    ru: {
        title: 'Count The Stars — простая медитативная игра',
        heading: 'Count The Stars',
        intro: 'Считайте звёзды, кликая по ним, когда они появляются в небе. Постарайтесь насчитать как можно больше.',
        start: 'Начать',
        retry: 'Заново',
        countedStars: 'Сосчитано звёзд: ',
        mistakesLeft: 'Осталось ошибок:',
        endScore: (n) => `Вы насчитали ${n} ${ruPlural(n, 'звезду', 'звезды', 'звёзд')}`,
        best: (n) => `Рекорд: ${n}`,
        newRecord: 'Новый рекорд!',
    },
    tr: {
        title: 'Count The Stars — basit, sakinleştirici bir oyun',
        heading: 'Count The Stars',
        intro: 'Gökyüzünde belirdikçe yıldızlara tıklayarak onları sayın. Olabildiğince çoğunu saymaya çalışın.',
        start: 'Başla',
        retry: 'Tekrar',
        countedStars: 'Sayılan yıldız: ',
        mistakesLeft: 'Kalan hata:',
        // Turkish does not pluralise nouns that follow a number.
        endScore: (n) => `${n} yıldız saydınız`,
        best: (n) => `Rekor: ${n}`,
        newRecord: 'Yeni rekor!',
    },
};

const DEFAULT_LANG: Lang = 'en';

/** Languages Yandex may report that map onto our Russian locale. */
const RU_LIKE = ['be', 'kk', 'uk', 'uz'];

declare global {
    interface Window {
        /** Locale code injected by the bootstrap from the Yandex SDK. */
        __GAME_LANG__?: string;
    }
}

function isLang(value: string | null | undefined): value is Lang {
    return value != null && value in MESSAGES;
}

/**
 * Map any locale code (ours, the browser's, or one of the many Yandex reports)
 * onto a supported language. Per the Yandex guidelines: `ru` for the
 * Russian-adjacent locales, `en` for everything we don't translate.
 */
function normalizeLang(code: string | null | undefined): Lang | null {
    if (!code) return null;
    const short = code.slice(0, 2).toLowerCase();
    if (isLang(short)) return short;
    if (RU_LIKE.includes(short)) return 'ru';
    return null;
}

/**
 * Resolve the active language: SDK-provided language → ?lang param → browser
 * language → English.
 */
export function detectLang(): Lang {
    const fromSdk = normalizeLang(window.__GAME_LANG__);
    if (fromSdk) return fromSdk;

    const param = new URLSearchParams(window.location.search).get('lang');
    if (isLang(param)) return param;

    const fromBrowser = normalizeLang(navigator.language);
    if (fromBrowser) return fromBrowser;

    return DEFAULT_LANG;
}

export const lang: Lang = detectLang();
export const t: Messages = MESSAGES[lang];

/**
 * Apply the active language to the document: <title>, <html lang> and every
 * element carrying a `data-i18n="<key>"` attribute (string messages only).
 */
export function applyStaticTranslations(): void {
    document.title = t.title;
    document.documentElement.lang = lang;

    for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
        const key = el.dataset.i18n as keyof Messages;
        const value = t[key];
        if (typeof value === 'string') {
            el.textContent = value;
        }
    }
}
