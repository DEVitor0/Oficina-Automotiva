document.addEventListener('DOMContentLoaded', function () {
    // Gerenciamento de Pop-up
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

    // Carrossel
    const container = document.querySelector('.sections__opiniões__gerenciador');
    const itens = document.querySelectorAll('.sections__opiniões__itens');
    const pontos = document.querySelectorAll('.sections__opiniões__navegação__pontos');

    let indiceAtual = 0;
    const itensPorSlide = 2;
    const totalSlides = Math.ceil(itens.length / itensPorSlide);

    const atualizarCarrossel = () => {
        itens.forEach(item => item.style.display = 'none');

        for (let i = indiceAtual * itensPorSlide; i < (indiceAtual + 1) * itensPorSlide && i < itens.length; i++) {
            itens[i].style.display = 'flex';
        }

        // Atualiza a cor das bolinhas
        pontos.forEach((ponto, indice) => {
            if (indice === indiceAtual) {
                ponto.style.backgroundColor = '#636464';
            } else {
                ponto.style.backgroundColor = '#97989b';
            }
        });
    };

    const irParaSlide = (indice) => {
        indiceAtual = indice;
        atualizarCarrossel();
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
                indiceAtual--;
            } else {
                indiceAtual = totalSlides - 1;
            }
        } else if (moverX < -100) {
            if (indiceAtual < totalSlides - 1) {
                indiceAtual++;
            } else {
                indiceAtual = 0;
            }
        }
        arrastando = false;
        atualizarCarrossel();
    });

    container.addEventListener('mouseleave', () => {
        if (!arrastando) return;
        arrastando = false;
        atualizarCarrossel();
    });

    atualizarCarrossel();
});
