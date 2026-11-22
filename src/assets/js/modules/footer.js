import { $, clamp, damp, lerp, docTop } from './utils';

const NS = 'http://www.w3.org/2000/svg';

// Rodapé: conta-giros que acelera ao chegar no fim da página + formulário.
export function initFooter() {
    const footer = $('#contato');
    const box = $('#g-gauge');
    const year = $('#g-year');
    if (year) year.textContent = new Date().getFullYear();
    if (!footer || !box) return null;

    const el = (n, a, parent) => { const e = document.createElementNS(NS, n); Object.keys(a || {}).forEach((k) => e.setAttribute(k, a[k])); if (parent) parent.appendChild(e); return e; };
    const svg = el('svg', { viewBox: '0 0 400 400' }, box);
    const P = (r, deg) => [200 + r * Math.cos((deg * Math.PI) / 180), 200 + r * Math.sin((deg * Math.PI) / 180)];
    const ang = (v) => 135 + (v / 8) * 270;
    el('circle', { cx: 200, cy: 200, r: 198, fill: '#e9efe9' }, svg);
    el('circle', { cx: 200, cy: 200, r: 188, fill: '#06221b' }, svg);
    el('circle', { cx: 200, cy: 200, r: 176, fill: 'none', stroke: 'rgba(255,255,255,.08)', 'stroke-width': 2 }, svg);
    // zona vermelha (aqui: amarela da marca)
    const arc = (r, a0, a1) => { const [x0, y0] = P(r, a0), [x1, y1] = P(r, a1); return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`; };
    el('path', { d: arc(168, ang(6.5), ang(8)), stroke: '#fffb38', 'stroke-width': 10, fill: 'none' }, svg);
    for (let i = 0; i <= 16; i++) {
        const v = i / 2, major = i % 2 === 0;
        const [x0, y0] = P(major ? 150 : 158, ang(v)), [x1, y1] = P(176, ang(v));
        el('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: v >= 6.5 ? '#fffb38' : '#eef3ee', 'stroke-width': major ? 4 : 2 }, svg);
        if (major) { const [tx, ty] = P(124, ang(v)); const t = el('text', { x: tx, y: ty + 9, 'text-anchor': 'middle', fill: '#eef3ee', 'font-size': 26, 'font-weight': 700, 'font-style': 'italic', 'font-family': '"G Num", Roboto, sans-serif' }, svg); t.textContent = v; }
    }
    const lab = el('text', { x: 200, y: 262, 'text-anchor': 'middle', fill: '#aec2ba', 'font-size': 14, 'font-family': '"G Body", Poppins, sans-serif' }, svg); lab.textContent = 'x1000 r/min';
    el('image', { href: './src/assets/img/icones/logo-1.png', x: 150, y: 285, width: 100, height: 29 }, svg);
    const needle = el('g', { class: 'needle' }, svg);
    el('polygon', { points: '165,196 348,200 165,204', fill: '#fffb38' }, needle);
    el('circle', { cx: 200, cy: 200, r: 16, fill: '#177559', stroke: '#e9efe9', 'stroke-width': 5 }, svg);

    let top = 0, h = 0, v = 0, kick = 0;
    const set = (val) => needle.style.transform = `rotate(${ang(clamp(val, 0, 8))}deg)`;
    set(0);

    const form = $('#g-news'), msg = $('#g-news-msg'), input = $('#g-news-email');
    if (form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        msg.classList.toggle('is-err', !ok);
        msg.textContent = ok ? 'Pronto! Você vai receber as novidades da Garage.' : 'Digite um e-mail válido, por exemplo nome@email.com.';
        if (ok) { kick = 1.1; input.value = ''; }
    });

    return {
        measure() { top = docTop(footer); h = footer.offsetHeight; },
        update(S, dt) {
            const p = clamp((S.y + S.vh - top) / Math.min(h, S.vh * 1.1), 0, 1);
            if (p <= 0 && v < 0.02) return;
            kick = damp(kick, 0, 3, dt);
            const e = 1 - Math.pow(1 - p, 3);
            const idle = p > 0.95 ? Math.sin(S.t * 9) * 0.09 : 0;
            v = damp(v, e * 6.9 + idle + kick, 6, dt);
            set(v);
        },
    };
}
