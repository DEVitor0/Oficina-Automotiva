import { $, $$, clamp } from './utils';

// Serviços: o passo de rolagem escolhe qual item/peça 3D está em destaque.
export function initServices() {
    const track = $('#g-serv-track');
    if (!track) return null;
    const items = $$('.g-serv__item', track);
    const countEl = $('#g-serv-n');
    let top = 0, h = 0, vh = innerHeight, cur = -1;
    const setActive = (i) => {
        if (i === cur) return;
        cur = i;
        items.forEach((it, k) => {
            it.classList.toggle('is-active', k === i);
            it.querySelector('.g-serv__btn').setAttribute('aria-expanded', k === i ? 'true' : 'false');
        });
        if (countEl) countEl.textContent = i + 1;
    };
    items.forEach((it, i) => {
        it.querySelector('.g-serv__btn').addEventListener('click', () => {
            const y = top + ((i + 0.5) / 6) * (h - vh);
            window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        });
    });
    setActive(0);
    return {
        measure(S) { top = track.getBoundingClientRect().top + window.scrollY; h = track.offsetHeight; vh = S.vh; },
        update(S) { if (S.serviceIndex != null) setActive(clamp(S.serviceIndex, 0, 5)); },
    };
}
