document.addEventListener("DOMContentLoaded",(function(){var e=document.querySelectorAll(".sections__pop-up__caixas__titulos"),t=document.querySelectorAll(".sections__pop-up__caixas__textos");if(e.length===t.length){e.forEach((function(n,o){n.addEventListener("click",(function(){var s=t[o],c=n.querySelector("i");if(s&&c){var a=s.classList.contains("open");t.forEach((function(e){e.classList.contains("open")&&e.classList.remove("open")})),e.forEach((function(e){var t=e.querySelector("i");t&&(t.classList.remove("fa-minus"),t.classList.add("fa-plus"))})),a||(s.classList.add("open"),c.classList.remove("fa-plus"),c.classList.add("fa-minus"))}}))}));var n=document.querySelector(".sections__opiniões__gerenciador"),o=document.querySelectorAll(".sections__opiniões__itens"),s=document.querySelectorAll(".sections__opiniões__navegação__pontos"),c=0,a=Math.ceil(o.length/2),i=function(){o.forEach((function(e){return e.classList.remove("ativo")}));for(var e=2*c;e<2*(c+1)&&e<o.length;e++)o[e].classList.add("ativo");s.forEach((function(e,t){e.style.backgroundColor=t===c?"#636464":"#97989b"}))},r=function(e){var t=Array.from(o).slice(2*c,2*(c+1)),n=Array.from(o).slice(2*e,2*(e+1));t.forEach((function(e){return e.classList.add("fade-exit")})),n.forEach((function(e){return e.classList.add("fade-enter")})),setTimeout((function(){t.forEach((function(e){e.classList.remove("fade-exit"),e.classList.add("fade-exit-active")})),n.forEach((function(e){e.classList.remove("fade-enter"),e.classList.add("fade-enter-active")})),setTimeout((function(){t.forEach((function(e){return e.classList.remove("fade-exit-active")})),n.forEach((function(e){return e.classList.remove("fade-enter-active")})),c=e,i()}),500)}),50)};s.forEach((function(e,t){e.addEventListener("click",(function(){r(t)}))}));var u,l=!1;n.addEventListener("mousedown",(function(e){u=e.pageX,l=!0})),n.addEventListener("mousemove",(function(e){l&&e.pageX})),n.addEventListener("mouseup",(function(e){if(l){var t=e.pageX-u;t>100?r(c>0?c-1:a-1):t<-100&&r(c<a-1?c+1:0),l=!1}})),n.addEventListener("mouseleave",(function(){l&&(l=!1)})),i(),document.querySelector(".sections__opiniões").addEventListener("selectstart",(function(e){e.preventDefault()}));var d=document.querySelector(".nav__hamburger"),f=document.getElementById("nav__menu");d.addEventListener("click",(function(){d.classList.toggle("open"),f.classList.toggle("open")}))}}));
//# sourceMappingURL=bundle.js.map