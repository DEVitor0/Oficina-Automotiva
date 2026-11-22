import { $, $$, clamp, docTop } from './utils';

const GEAR = { sobre: ['1', 'Sobre nós'], proc: ['1', 'Como trabalhamos'], serv: ['2', 'Serviços'], port: ['3', 'Portfólio'], op: ['4', 'Opiniões'], foot: ['5', 'Contato'] };

// Marcha + barra de "rpm" (progresso da página)
export function initHud() {
    const hud = $('#g-hud'), gear = $('#g-gear'), name = $('#g-hud-name'), fill = $('#g-hud-fill');
    if (!hud) return null;
    let scenes = [], docH = 1, cur = '';
    return {
        measure(S) {
            scenes = $$('[data-scene]').map((el) => ({ key: el.dataset.scene, top: docTop(el) }));
            docH = Math.max(1, document.documentElement.scrollHeight - S.vh);
        },
        update(S) {
            const c = S.y + S.vh * 0.5;
            let k = '';
            scenes.forEach((s) => { if (c >= s.top) k = s.key; });
            hud.classList.toggle('is-on', !!k && k !== 'port');
            hud.dataset.tone = k === 'op' ? 'light' : 'dark';
            if (k && k !== cur) { cur = k; gear.textContent = GEAR[k][0]; name.textContent = GEAR[k][1]; }
            fill.style.transform = `scaleX(${clamp(S.y / docH, 0, 1).toFixed(4)})`;
        },
    };
}
