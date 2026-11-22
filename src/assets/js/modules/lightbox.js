import { $, $$ } from './utils';

export function initLightbox() {
    const lb = $('#g-lb'), img = $('#g-lb-img');
    if (!lb) return;
    const srcs = $$('.g-shot img').map((i) => ({ src: i.src, alt: i.alt }));
    let i = 0, opener = null;
    const show = (n) => { i = (n + srcs.length) % srcs.length; img.src = srcs[i].src; img.alt = srcs[i].alt; };
    const open = (n) => { opener = document.activeElement; show(n); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#g-lb-close').focus(); };
    const close = () => { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus({ preventScroll: true }); };
    document.addEventListener('g:lightbox', (e) => open(e.detail));
    $('#g-lb-close').addEventListener('click', close);
    $('#g-lb-prev').addEventListener('click', () => show(i - 1));
    $('#g-lb-next').addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
        if (lb.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(i - 1);
        if (e.key === 'ArrowRight') show(i + 1);
    });
}
