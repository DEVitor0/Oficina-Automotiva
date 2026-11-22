# Oficina Automotiva

Este projeto foi desenvolvido para testar meus conhecimentos em HTML, SCSS e JavaScript, juntamente com plugins como Webpack, ESLint e Git.

Você pode visualizar o projeto https://devitor0.github.io/Oficina-Automotiva/.

## Tecnologias Utilizadas

- **HTML**
  ![HTML](https://img.icons8.com/color/48/000000/html-5.png)
  
- **SCSS**
  ![SCSS](https://img.icons8.com/color/48/000000/sass.png)
  
- **JavaScript**
  ![JavaScript](https://img.icons8.com/color/48/000000/javascript.png)
  
- **Webpack**
  ![Webpack](https://img.icons8.com/color/48/000000/webpack.png)
  
- **ESLint**
  ![ESLint](https://img.icons8.com/color/48/000000/eslint.png)
  
- **Git**
  ![Git](https://img.icons8.com/color/48/000000/git.png)

## Criador do Projeto

Vitor Moreira


---

## Atualização: experiência 3D abaixo do hero

O hero (imagem da Lamborghini + fundo) **não foi alterado**: continua usando os CSS originais.
Tudo abaixo dele foi refeito com three.js (local, `public/assets/js/vendor/three.min.js`) e animações ligadas à rolagem.

| Seção | O que acontece |
|---|---|
| Sobre | Roda de corrida em 3D (feita por código, sem arquivo de modelo) gira e reage ao mouse e à velocidade da rolagem |
| Como trabalhamos | A roda "dirige" pela estrada enquanto os passos do atendimento (recepção, diagnóstico, oficina, entrega) passam; a roda rola sem escorregar |
| Serviços | Vista explodida da roda e do freio: cada serviço destaca uma peça (roda, pinça, cubo e porca, disco, pneu) |
| Portfólio | Túnel: os projetos vêm do fundo da estrada até passarem por você; clique para ampliar |
| Opiniões | Carrossel 3D (arraste, setas, pontos e teclado) |
| Contato | Conta-giros que acelera ao chegar no fim da página |

### Arquivos
- `index.html`: hero original + novas seções
- `public/assets/css/garage.css`: estilos novos (tokens de cor no `:root`)
- `src/assets/js/script.js` + `src/assets/js/modules/*`: código-fonte (compile com o webpack, como antes, para gerar `public/assets/js/bundle.js`)

### Acessibilidade e fallback
- `prefers-reduced-motion`: sem seções fixadas, sem túnel; tudo vira lista/grade estática
- Sem WebGL: o palco 3D some e o conteúdo continua legível
- Os textos de Sobre, Serviços (item 3) e Opiniões são provisórios: troque pelos reais
