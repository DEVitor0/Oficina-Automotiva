import { $, $$, clamp, lerp, smooth, docTop } from './utils';

// Portfólio: um túnel. Cada projeto vem do fundo da estrada até passar por você.
const LAYOUT = [
    { w: 34, x: 24, y: -5 }, { w: 24, x: 25, y: 9 }, { w: 17, x: 26, y: -4 },
    { w: 24, x: 25, y: 8 }, { w: 28, x: 24, y: -6 }, { w: 24, x: 25, y: 6 },
];
const RANGE = 3600, FIRST = 0.17, SPAN = 0.8;

export function initTunnel() {
    const track = $('#g-port-track');
    if (!track) return null;
    const shots = $$('.g-shot', track);
    const intro = $('#g-port-intro');
    const road = $('#g-port-road');
    const scene = $('#g-port-scene');
    const nEl = $('#g-port-n'), fill = $('#g-port-fill');
    let top = 0, h = 0, vh = innerHeight, lastIdx = -1;
    const N = shots.length;
    const arrival = (i) => FIRST + (i / (N - 1)) * SPAN;
    const mobile = () => innerWidth < 820;

    shots.forEach((fig, i) => {
        fig.querySelector('button').addEventListener('click', () => document.dispatchEvent(new CustomEvent('g:lightbox', { detail: i })));
        fig.querySelector('button').addEventListener('focus', () => {
            const y = top + arrival(i) * (h - vh);
            window.scrollTo({ top: y, behavior: 'auto' });
        });
    });
    let px = 0, py = 0;
    window.addEventListener('pointermove', (e) => { px = (e.clientX / innerWidth) * 2 - 1; py = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

    return {
        measure(S) { top = docTop(track); h = track.offsetHeight; vh = S.vh; },
        update(S) {
            const u = (S.y - top) / Math.max(1, h - S.vh);
            if (u < -0.35 || u > 1.35) { shots.forEach((f) => { f.style.opacity = 0; f.style.pointerEvents = 'none'; }); return; }
            const uc = clamp(u, 0, 1);
            const mob = mobile();
            const vw = S.vw / 100, vhh = S.vh / 100;
            const k = mob ? 1.95 : 1;
            shots.forEach((fig, i) => {
                const L = LAYOUT[i], side = i % 2 ? 1 : -1;
                const z = (uc - arrival(i)) * RANGE;
                const approach = smooth(-1800, 0, z);
                const xx = side * vw * lerp(mob ? 20 : 30, mob ? 11 : 13, approach) * (mob ? 1 : 1);
                const yy = L.y * vhh * (mob ? 1.6 : 1);
                const ry = -side * lerp(26, 10, approach);
                const op = smooth(-2900, -1900, z) * (1 - smooth(260, 540, z));
                fig.style.width = (L.w * k * (mob ? 0.95 : 1)) + 'vw';
                fig.style.opacity = op.toFixed(3);
                fig.style.pointerEvents = op > 0.5 && z > -700 ? 'auto' : 'none';
                fig.style.transform = `translate3d(${xx.toFixed(1)}px, ${yy.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
                fig.style.zIndex = Math.round(1000 + z);
            });
            scene.style.transform = `rotateY(${(px * 2.2).toFixed(2)}deg) rotateX(${(py * -1.6).toFixed(2)}deg)`;
            const io = 1 - smooth(0.02, 0.15, uc);
            intro.style.opacity = io.toFixed(3);
            intro.style.transform = `translateZ(${(-uc * 900).toFixed(0)}px) scale(${(1 + uc * 1.4).toFixed(3)})`;
            intro.style.pointerEvents = io > 0.5 ? 'auto' : 'none';
            road.style.setProperty('--off', (uc * RANGE * 0.6).toFixed(0) + 'px');
            fill.style.transform = `scaleX(${uc.toFixed(4)})`;
            const idx = clamp(Math.round((uc - FIRST) / (SPAN / (N - 1))), 0, N - 1);
            if (idx !== lastIdx) { lastIdx = idx; nEl.textContent = String(idx + 1).padStart(2, '0'); }
        },
    };
}
