import { createEngine } from './modules/engine';
import { initNav } from './modules/nav';
import { initReveal } from './modules/reveal';
import { initAccordion } from './modules/accordion';
import { initProcess } from './modules/process';
import { initServices } from './modules/services';
import { initTunnel } from './modules/tunnel';
import { initCoverflow } from './modules/coverflow';
import { initFooter } from './modules/footer';
import { initHud } from './modules/hud';
import { initLightbox } from './modules/lightbox';

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initReveal();
    initAccordion();
    initLightbox();

    const engine = createEngine();
    [initProcess(), initServices(), initTunnel(), initCoverflow(), initFooter(), initHud()]
        .filter(Boolean)
        .forEach((m) => engine.add(m));
    engine.start();
});
