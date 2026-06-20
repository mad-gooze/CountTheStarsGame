/**
 * Capture real in-game Count The Stars screenshots with headless Chrome.
 *
 * Drives the actual built game over the Chrome DevTools Protocol: for each
 * language (ru/en/tr) and platform (desktop 1920x1080, mobile 1080x1920) it
 * shoots the menu, a live round, and the game-over screen — 18 PNGs total,
 * written next to this script.
 *
 * Build first (`npm run build`), then run with WebSocket support:
 *   node --experimental-websocket store/capture_screens.mjs
 * The script starts its own `vite preview` server unless BASE is set. The npm
 * "screens" script wraps the whole thing (build + capture).
 *
 * Env overrides: CHROME (binary path), BASE (use an already-running server).
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const OUT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(OUT_DIR, '..');
const CHROME =
    process.env.CHROME ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PREVIEW_PORT = 4323;
const BASE = process.env.BASE || `http://localhost:${PREVIEW_PORT}`;
const DEBUG_PORT = 9335;

const LANGS = ['ru', 'en', 'tr'];
// The game uses fixed (em-based) font sizes, so on a huge logical viewport the
// text looks tiny. We keep the logical (CSS) viewport small so the UI fills the
// frame, and use deviceScaleFactor to render crisply up to the final pixel size
// (width*scale x height*scale).
const PLATFORMS = {
    desktop: { width: 960, height: 540, scale: 2, mobile: false }, // -> 1920x1080
    mobile: { width: 540, height: 960, scale: 2, mobile: true }, //   -> 1080x1920
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function waitForServer(url, attempt = 0) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            res.resume();
            resolve();
        }).on('error', () => {
            if (attempt > 40) return reject(new Error('preview server not ready'));
            setTimeout(() => waitForServer(url, attempt + 1).then(resolve, reject), 250);
        });
    });
}

async function startPreview() {
    if (process.env.BASE) return null; // caller manages their own server
    const bin = path.join(ROOT, 'node_modules', '.bin', 'vite');
    const server = spawn(bin, ['preview', '--port', String(PREVIEW_PORT)], {
        cwd: ROOT,
        stdio: 'ignore',
    });
    await waitForServer(BASE);
    return server;
}

async function main() {
    const server = await startPreview();
    const chrome = spawn(CHROME, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        `--user-data-dir=/tmp/cts-capture-profile`,
        `--remote-debugging-port=${DEBUG_PORT}`,
        '--window-size=1920,1920',
        'about:blank',
    ]);

    try {
        const target = await waitForTarget();
        const cdp = await connect(target.webSocketDebuggerUrl);
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');

        for (const lang of LANGS) {
            for (const [name, dims] of Object.entries(PLATFORMS)) {
                await captureSet(cdp, lang, name, dims);
            }
        }
        cdp.close();
    } finally {
        chrome.kill();
        server?.kill();
    }
}

function waitForTarget(attempt = 0) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${DEBUG_PORT}/json`, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
                const page = JSON.parse(data).find((t) => t.type === 'page');
                page ? resolve(page) : retry();
            });
        }).on('error', retry);

        function retry() {
            if (attempt > 30) return reject(new Error('Chrome not ready'));
            setTimeout(() => waitForTarget(attempt + 1).then(resolve, reject), 300);
        }
    });
}

function connect(url) {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = {};
    ws.addEventListener('message', (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id && pending[msg.id]) pending[msg.id](msg);
    });
    const send = (method, params = {}) =>
        new Promise((resolve) => {
            const i = ++id;
            pending[i] = resolve;
            ws.send(JSON.stringify({ id: i, method, params }));
        });
    return new Promise((resolve) => {
        ws.addEventListener('open', () =>
            resolve({
                send,
                close: () => ws.close(),
                async eval(expression, awaitPromise = false) {
                    const o = await send('Runtime.evaluate', {
                        expression,
                        returnByValue: true,
                        awaitPromise,
                    });
                    return o.result?.result?.value;
                },
            })
        );
    });
}

async function captureSet(cdp, lang, platform, dims) {
    const { width, height, scale, mobile } = dims;
    await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: scale,
        mobile,
    });

    // Fresh state so the game-over screen reliably shows "New record!".
    await cdp.send('Page.navigate', { url: `${BASE}/?lang=${lang}` });
    await sleep(1500);
    await cdp.eval('localStorage.clear()');
    await cdp.send('Page.navigate', { url: `${BASE}/?lang=${lang}` });
    await sleep(2500);
    await cdp.eval('document.fonts.ready', true);
    // Start the soundtrack so the control shows a real track name, not "caption".
    await cdp.eval(
        `document.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}))`
    );
    await sleep(400);

    const shot = (n) =>
        snap(cdp, `screen_${lang}_${platform}_${n}.png`, width * scale, height * scale);

    // 1) Menu.
    await shot('1_menu');

    // 2) Gameplay: start, then count a handful of stars.
    await cdp.eval(`document.querySelector('.menu__btn_start-game').click()`);
    await sleep(1200); // wait out the start transition before the first star
    for (let i = 0; i < 12; i++) {
        await cdp.eval(
            `(()=>{const s=[...document.querySelectorAll('.stars-holder .control_star')];const last=s[s.length-1];if(last)last.click();})()`
        );
        await sleep(140);
    }
    await sleep(400);
    await shot('2_game');

    // 3) Game over: keep tapping an already-counted star until the run ends.
    for (let i = 0; i < 8; i++) {
        const ended = await cdp.eval(
            `!document.querySelector('.menu__screen_end-game').classList.contains('menu__screen_inactive')`
        );
        if (ended) break;
        await cdp.eval(
            `(()=>{const s=[...document.querySelectorAll('.stars-holder .control_star')];if(s.length>1)s[0].click();})()`
        );
        await sleep(220);
    }
    await sleep(1100); // let the end screen fade in
    await shot('3_over');
}

async function snap(cdp, name, outWidth, outHeight) {
    // Capture the emulated viewport; its pixel size is logical size * scale.
    const o = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, name), Buffer.from(o.result.data, 'base64'));
    console.log(`  wrote ${name} (${outWidth}x${outHeight})`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
