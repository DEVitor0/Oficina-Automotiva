import { $$ } from './utils';

// Revelações ao entrar na tela (classe .is-in).
// Observa o contêiner e libera os filhos [data-rv] em sequência (entrada orquestrada).
export function initReveal() {
    const items = $$('[data-rv]');
    const groups = new Map();
    items.forEach((el) => {
        const p = el.parentElement;
        if (!groups.has(p)) groups.set(p, []);
        groups.get(p).push(el);
    });
    groups.forEach((list) => list.forEach((el, i) => el.style.setProperty('--d', i)));
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((ents) => {
        ents.forEach((e) => {
            if (!e.isIntersecting) return;
            (groups.get(e.target) || []).forEach((el) => el.classList.add('is-in'));
            io.unobserve(e.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    groups.forEach((_, p) => io.observe(p));
}
