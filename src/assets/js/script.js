document.addEventListener('DOMContentLoaded', function () {
    const titulos = document.querySelectorAll('.sections__pop-up__caixas__titulos');
    const textos = document.querySelectorAll('.sections__pop-up__caixas__textos');

    if (titulos.length !== textos.length) {
        return;
    }

    titulos.forEach((titulo, index) => {
        titulo.addEventListener('click', () => {
            const texto = textos[index];
            const icon = titulo.querySelector('i');

            if (texto && icon) {
                const isOpen = texto.classList.contains('open');
                
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

                if (!isOpen) {
                    texto.classList.add('open');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                }
            }
        });
    });
});
