import { $$ } from './utils';

export function initAccordion() {
    const items = $$('.g-acc__item');
    items.forEach((item) => {
        const btn = item.querySelector('.g-acc__btn');
        btn.addEventListener('click', () => {
            const open = item.classList.contains('is-open');
            items.forEach((o) => { o.classList.remove('is-open'); o.querySelector('.g-acc__btn').setAttribute('aria-expanded', 'false'); });
            if (!open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
        });
    });
}
