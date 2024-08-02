document.addEventListener('DOMContentLoaded', function () {
    const titulos = document.querySelectorAll('.sections__pop-up__caixas__titulos');
    const textos = document.querySelectorAll('.sections__pop-up__caixas__textos');

    if (titulos.length !== textos.length) {
        return;
    }

    titulos.forEach((titulo, indice) => {
        titulo.addEventListener('click', () => {
            const texto = textos[indice];
            const icone = titulo.querySelector('i');

            if (texto && icone) {
                const estaAberto = texto.classList.contains('open');

                textos.forEach(t => {
                    if (t.classList.contains('open')) {
                        t.classList.remove('open');
                    }
                });

                titulos.forEach(t => {
                    const i = t.querySelector('i');
                    if (i) {
                        i.classList.remove('fa-minus');
                        i.classList.add('fa-plus');
                    }
                });

                if (!estaAberto) {
                    texto.classList.add('open');
                    icone.classList.remove('fa-plus');
                    icone.classList.add('fa-minus');
                }
            }
        });
    });

    const container = document.querySelector('.sections__opiniões__gerenciador');
    const itens = document.querySelectorAll('.sections__opiniões__itens');
    const pontos = document.querySelectorAll('.sections__opiniões__navegação__pontos');

    let indiceAtual = 0;
    const itensPorSlide = 2; // Mostra 2 itens por slide
    const totalSlides = Math.ceil(itens.length / itensPorSlide);

    const atualizarCarrossel = () => {
        itens.forEach(item => item.classList.remove('ativo'));

        for (let i = indiceAtual * itensPorSlide; i < (indiceAtual + 1) * itensPorSlide && i < itens.length; i++) {
            itens[i].classList.add('ativo');
        }

        pontos.forEach((ponto, indice) => {
            if (indice === indiceAtual) {
                ponto.style.backgroundColor = '#636464';
            } else {
                ponto.style.backgroundColor = '#97989b';
            }
        });
    };

    const irParaSlide = (indice) => {
        const slideAtual = Array.from(itens).slice(indiceAtual * itensPorSlide, (indiceAtual + 1) * itensPorSlide);
        const novoSlide = Array.from(itens).slice(indice * itensPorSlide, (indice + 1) * itensPorSlide);

        slideAtual.forEach(item => item.classList.add('fade-exit'));
        novoSlide.forEach(item => item.classList.add('fade-enter'));

        setTimeout(() => {
            slideAtual.forEach(item => {
                item.classList.remove('fade-exit');
                item.classList.add('fade-exit-active');
            });
            novoSlide.forEach(item => {
                item.classList.remove('fade-enter');
                item.classList.add('fade-enter-active');
            });

            setTimeout(() => {
                slideAtual.forEach(item => item.classList.remove('fade-exit-active'));
                novoSlide.forEach(item => item.classList.remove('fade-enter-active'));
                indiceAtual = indice;
                atualizarCarrossel();
            }, 500);
        }, 50);
    };

    pontos.forEach((ponto, indice) => {
        ponto.addEventListener('click', () => {
            irParaSlide(indice);
        });
    });

    let inicioX, atualX, arrastando = false;

    container.addEventListener('mousedown', (e) => {
        inicioX = e.pageX;
        arrastando = true;
    });

    container.addEventListener('mousemove', (e) => {
        if (!arrastando) return;
        atualX = e.pageX;
    });

    container.addEventListener('mouseup', (e) => {
        if (!arrastando) return;
        const moverX = e.pageX - inicioX;
        if (moverX > 100) {
            if (indiceAtual > 0) {
                irParaSlide(indiceAtual - 1);
            } else {
                irParaSlide(totalSlides - 1);
            }
        } else if (moverX < -100) {
            if (indiceAtual < totalSlides - 1) {
                irParaSlide(indiceAtual + 1);
            } else {
                irParaSlide(0);
            }
        }
        arrastando = false;
    });

    container.addEventListener('mouseleave', () => {
        if (!arrastando) return;
        arrastando = false;
    });

    atualizarCarrossel();

    const opinioesSection = document.querySelector('.sections__opiniões');
    opinioesSection.addEventListener('selectstart', (event) => {
        event.preventDefault();
    });

    const hamburger = document.querySelector('.nav__hamburger');
    const menu = document.getElementById('nav__menu');

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('open');
        menu.classList.toggle('open');
    });

});