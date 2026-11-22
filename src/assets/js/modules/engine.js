import { $, $$, clamp, lerp, smooth, damp, docTop, reduceMotion } from './utils';
import { createStage } from './stage';

/**
 * Motor de rolagem: lê o scrollY uma vez por quadro, calcula as "cenas"
 * (seções com data-scene), mistura as poses do objeto 3D e chama os módulos.
 */
const POSES = {
    desktop: {
        hero: { op: 0, ax: 0.44, ay: 0, sc: 1.1, rx: 0.08, ry: -0.45, rz: 0, ex: 0, spin: 0.6 },
        sobre: { op: 1, ax: 0.45, ay: 0, sc: 1.15, rx: 0.08, ry: -0.45, rz: 0, ex: 0, spin: 0.6 },
        proc: { op: 1, ax: -0.8, ay: -0.428, sc: 0.55, rx: 0, ry: 0, rz: 0, ex: 0, spin: 0 },
        serv: { op: 1, ax: 0.32, ay: 0, sc: 0.98, rx: 0.14, ry: -1.12, rz: 0, ex: 1, spin: 0.35 },
        port: { op: 0.6, ax: 0, ay: 0.06, sc: 0.5, rx: 0.02, ry: -0.35, rz: 0, ex: 0, spin: 1.4 },
        op: { op: 0, ax: 0, ay: 0, sc: 1, rx: 0, ry: -0.4, rz: 0, ex: 0, spin: 0.6 },
        foot: { op: 0, ax: 0, ay: 0, sc: 1, rx: 0, ry: -0.4, rz: 0, ex: 0, spin: 0.6 },
    },
    mobile: {
        hero: { op: 0, ax: 0, ay: 0.1, sc: 0.8, rx: 0.1, ry: -0.5, rz: 0, ex: 0, spin: 0.6 },
        sobre: { op: 0.35, ax: 0, ay: 0.05, sc: 1.1, rx: 0.1, ry: -0.45, rz: 0, ex: 0, spin: 0.6 },
        proc: { op: 1, ax: -0.8, ay: -0.467, sc: 0.42, rx: 0, ry: 0, rz: 0, ex: 0, spin: 0 },
        serv: { op: 1, ax: 0, ay: 0.3, sc: 0.56, rx: 0.1, ry: -1.12, rz: Math.PI / 2, ex: 1, spin: 0.35 },
        port: { op: 0.55, ax: 0, ay: 0.08, sc: 0.4, rx: 0.02, ry: -0.35, rz: 0, ex: 0, spin: 1.4 },
        op: { op: 0, ax: 0, ay: 0, sc: 1, rx: 0, ry: -0.4, rz: 0, ex: 0, spin: 0.6 },
        foot: { op: 0, ax: 0, ay: 0, sc: 1, rx: 0, ry: -0.4, rz: 0, ex: 0, spin: 0.6 },
    },
};
const KEYS = ['op', 'ax', 'ay', 'sc', 'rx', 'ry', 'rz', 'ex', 'spin'];
const SERVICE_EX = [1, 1, 1, 1, 0.04, 0.85];

export function createEngine() {
    const S = { y: 0, vh: window.innerHeight, vw: window.innerWidth, vel: 0, t: 0, px: 0, py: 0 };
    const modules = [];
    const scenes = [];
    const stageCanvas = $('#g-stage');
    const stage = createStage(stageCanvas);
    if (!stage) document.documentElement.classList.add('no-webgl');

    const markerEl = $('#g-marker');
    const markerLabel = $('#g-marker-label');
    const serv = { track: null, top: 0, h: 0, el: null };
    let lastMarker = -2, pointer = { x: 0, y: 0 }, pointerS = { x: 0, y: 0 };

    function measure() {
        S.vh = window.innerHeight; S.vw = window.innerWidth;
        scenes.length = 0;
        scenes.push({ key: 'hero', top: 0 });
        $$('[data-scene]').forEach((el) => scenes.push({ key: el.dataset.scene, top: docTop(el), el, h: el.offsetHeight }));
        const tr = $('#g-serv-track');
        if (tr) { serv.track = tr; serv.top = docTop(tr); serv.h = tr.offsetHeight; }
        modules.forEach((m) => m.measure && m.measure(S));
        if (stage) stage.resize();
    }

    const poseSet = () => (S.vw / S.vh < 0.95 || S.vw < 820 ? POSES.mobile : POSES.desktop);

    function blend(c, set) {
        const edge = S.vh * 0.5;
        const out = Object.assign({}, set.hero);
        const weights = {};
        scenes.forEach((sc, i) => {
            if (i === 0) return;
            const w = i === 1 ? smooth(sc.top, sc.top + edge * 1.4, c) : smooth(sc.top - edge, sc.top + edge, c);
            weights[sc.key] = w;
            const p = set[sc.key];
            KEYS.forEach((k) => { out[k] = lerp(out[k], p[k], w); });
        });
        return { pose: out, weights };
    }

    let last = performance.now();
    function frame(now) {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        S.t += dt;
        const y = window.scrollY;
        S.vel = damp(S.vel, (y - S.y) / Math.max(dt, 0.001), 7, dt);
        S.y = y;
        pointerS.x = damp(pointerS.x, pointer.x, 4, dt); pointerS.y = damp(pointerS.y, pointer.y, 4, dt);
        S.px = pointerS.x; S.py = pointerS.y;

        const c = y + S.vh * 0.5;
        const set = poseSet();
        const { pose, weights } = blend(c, set);

        // serviços: passo atual (com "pausa" em cada serviço)
        let sIdx = 0, sF = 0;
        if (serv.track) {
            const u = clamp((y - serv.top) / Math.max(1, serv.h - S.vh), 0, 1);
            const raw = u * 5.999;
            const i = Math.floor(raw), f = raw - i;
            sF = i + smooth(0.3, 0.7, f);
            sIdx = clamp(Math.round(sF), 0, 5);
            S.serviceU = u; S.serviceIndex = sIdx;
        }
        const wServ = (weights.serv || 0) * (1 - (weights.port || 0));
        const wProc = (weights.proc || 0) * (1 - (weights.serv || 0));
        if (wProc > 0) pose.ax = lerp(pose.ax, lerp(-0.8, 0.8, S.procU || 0), wProc);
        if (serv.track) {
            // explosão modulada pelo passo (6 serviços)
            const i0 = Math.floor(clamp(sF, 0, 5)), i1 = Math.min(5, i0 + 1), tt = clamp(sF, 0, 5) - i0;
            const exF = lerp(SERVICE_EX[i0], SERVICE_EX[i1], smooth(0, 1, tt));
            pose.ex = pose.ex * lerp(1, exF, wServ);
        }

        modules.forEach((m) => m.update(S, dt, weights));

        if (stage && !reduceMotion) {
            const state = Object.assign({}, pose, { vel: S.vel, px: S.px, py: S.py, ghost: wServ > 0.5 ? (wServ - 0.5) * 2 : 0, active: sIdx, roll: wProc });
            const drew = stage.update(state, dt, S.t);
            if (drew && wServ > 0.6 && markerEl) {
                if (lastMarker !== sIdx) { const it = serv.track.querySelectorAll('.g-serv__item')[sIdx]; markerLabel.textContent = it ? it.dataset.mark : ''; lastMarker = sIdx; }
                const m = stage.markerAt(sIdx);
                markerEl.style.transform = `translate3d(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px, 0)`;
                markerEl.classList.add('is-on');
            } else if (markerEl) markerEl.classList.remove('is-on');
        } else if (stage && reduceMotion) {
            if (!S._static) { S._static = true; stage.update(Object.assign({}, set.sobre, { vel: 0, px: 0, py: 0, ghost: 0, active: -1 }), 5, 0); }
        }
        requestAnimationFrame(frame);
    }

    function start() {
        window.addEventListener('pointermove', (e) => { pointer.x = (e.clientX / S.vw) * 2 - 1; pointer.y = (e.clientY / S.vh) * 2 - 1; }, { passive: true });
        let lw = window.innerWidth, lh = window.innerHeight, rt;
        window.addEventListener('resize', () => {
            clearTimeout(rt);
            rt = setTimeout(() => {
                // ignora o "pulo" da barra de endereço no celular (só altura)
                if (window.innerWidth === lw && Math.abs(window.innerHeight - lh) < 140) { S.vh = window.innerHeight; return; }
                lw = window.innerWidth; lh = window.innerHeight; measure();
            }, 120);
        });
        if ('ResizeObserver' in window) new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(measure, 150); }).observe(document.body);
        window.addEventListener('load', measure);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
        measure();
        requestAnimationFrame(frame);
    }

    return { S, add: (m) => modules.push(m), start, measure };
}
