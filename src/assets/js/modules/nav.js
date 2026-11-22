import { $, $$, docTop, reduceMotion } from './utils';

// Menu hambúrguer (mesmo comportamento do original) + links de navegação
export function initNav() {
    const hamburger = $('.nav__hamburger');
    const menu = $('#nav__menu');
    if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            menu.classList.toggle('open');
        });
    }
    const go = (id) => {
        let y = 0;
        if (id !== 'top') {
            const el = document.getElementById(id);
            if (!el) return;
            y = docTop(el);
        }
        window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
        if (hamburger && menu) { hamburger.classList.remove('open'); menu.classList.remove('open'); }
    };
    $$('[data-go]').forEach((li) => li.addEventListener('click', () => go(li.dataset.go)));
    $$('a[href^="#"]').forEach((a) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        a.addEventListener('click', (e) => { e.preventDefault(); go(id); });
    });
}
