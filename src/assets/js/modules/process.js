import { $, $$, clamp, smooth, docTop, reduceMotion } from './utils';

// Como trabalhamos: trilho horizontal de passos ligado à rolagem.
// A roda 3D (engine/stage) anda pela "estrada" no mesmo ritmo.
export function initProcess() {
    const track = $('#g-proc-track');
    const rail = $('#g-proc-rail');
    const fill = $('#g-proc-fill');
    if (!track || !rail || reduceMotion) return null;
    const steps = $$('.g-step', rail);
    let top = 0, h = 0, vw = innerWidth, railW = 0, lefts = [], widths = [], txs = [];
    return {
        measure(S) {
            top = docTop(track); h = track.offsetHeight; vw = S.vw;
            railW = rail.scrollWidth;
            lefts = steps.map((s) => s.offsetLeft); widths = steps.map((s) => s.offsetWidth);
            const max = Math.max(0, railW - vw);
            // posição do trilho em que cada passo fica centralizado (limitada às pontas)
            txs = steps.map((s, i) => -Math.min(max, Math.max(0, lefts[i] + widths[i] / 2 - vw / 2)));
        },
        update(S) {
            const u = clamp((S.y - top) / Math.max(1, h - S.vh), 0, 1);
            S.procU = u;
            if (S.y < top - S.vh || S.y > top + h) return;
            const n = steps.length - 1;
            const p = u * n, i = Math.min(n - 1, Math.floor(p)), f = p - i;
            const k = smooth(0.22, 0.78, f); // cada passo "para" no centro antes de seguir
            const tx = txs[i] + (txs[i + 1] - txs[i]) * k;
            rail.style.transform = `translate3d(${tx.toFixed(1)}px, -50%, 0)`;
            steps.forEach((el, i) => {
                const c = lefts[i] + widths[i] / 2 + tx;
                const d = (c - vw / 2) / vw;
                const a = Math.abs(d);
                const on = 1 - smooth(0.12, 0.42, a);
                el.style.transform = `rotateY(${(-d * 22).toFixed(2)}deg) scale(${(1 - Math.min(a, 1) * 0.1).toFixed(3)})`;
                el.style.opacity = (0.35 + 0.65 * (1 - smooth(0.2, 0.75, a))).toFixed(3);
                el.style.setProperty('--on', on.toFixed(3));
            });
            fill.style.transform = `scaleX(${(0.1 + 0.8 * u).toFixed(4)})`;
        },
    };
}
