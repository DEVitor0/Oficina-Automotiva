import { $, $$, clamp, damp } from './utils';

// Opiniões: carrossel em 3D (arraste, setas, pontos e teclado).
export function initCoverflow() {
    const root = $('#g-cf');
    if (!root) return null;
    const cards = $$('.g-quote', root);
    const dotsBox = $('#g-cf-dots');
    const prev = $('#g-cf-prev'), next = $('#g-cf-next');
    const N = cards.length;
    let target = 0, pos = 0, drag = null, cw = 560;
    const dots = cards.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', `Depoimento ${i + 1} de ${N}`);
        b.addEventListener('click', () => go(i));
        dotsBox.appendChild(b); return b;
    });
    const go = (i) => { target = clamp(Math.round(i), 0, N - 1); };
    prev.addEventListener('click', () => go(target - 1));
    next.addEventListener('click', () => go(target + 1));
    root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { go(target - 1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { go(target + 1); e.preventDefault(); }
    });
    root.addEventListener('pointerdown', (e) => {
        drag = { x: e.clientX, p: pos, moved: false };
        root.classList.add('is-drag');
        try { root.setPointerCapture(e.pointerId); } catch (_) {}
    });
    root.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (Math.abs(dx) > 4) drag.moved = true;
        pos = clamp(drag.p - dx / (cw * 0.55), -0.35, N - 0.65);
        target = clamp(Math.round(pos), 0, N - 1);
    });
    const end = () => { if (!drag) return; drag = null; root.classList.remove('is-drag'); target = clamp(Math.round(pos), 0, N - 1); };
    root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);

    let visible = false;
    if ('IntersectionObserver' in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '100px' }).observe(root); else visible = true;

    function paint() {
        const mob = root.clientWidth < 700;
        cards.forEach((c, i) => {
            const d = i - pos, a = Math.abs(d);
            const x = d * cw * (mob ? 0.5 : 0.64);
            const z = -Math.min(a, 3) * 170;
            const ry = clamp(-d * 24, -48, 48);
            const sc = 1 - Math.min(a, 2) * 0.07;
            c.style.transform = `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
            c.style.zIndex = String(100 - Math.round(a * 10));
            c.style.setProperty('--veil', clamp(a * 0.55, 0, 0.85).toFixed(3));
            c.style.visibility = a > 3.2 ? 'hidden' : 'visible';
            c.setAttribute('aria-hidden', a > 0.6 ? 'true' : 'false');
        });
        dots.forEach((d, i) => d.classList.toggle('is-on', i === target));
        prev.disabled = target === 0; next.disabled = target === N - 1;
    }
    return {
        measure() { cw = Math.min(560, innerWidth * 0.8); },
        update(S, dt) {
            if (!visible) return;
            if (!drag) pos = damp(pos, target, 7, dt);
            paint();
        },
    };
}
