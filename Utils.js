// Utils.js - Librería reutilizable


(function (global) {
    'use strict';

        const qSelector(selector) {
            return document.querySelector(selector);
        };

        const qSelecID(selector) {
            return document.getElementById(selector);
        };

        const qSelectors(selector) {
            return document.querySelectorAll(selector);
        };

        const activarElemento(selector) {
            const el = document.querySelector(selector);
            if (el) el.focus();
            return el;
        };

        const seleccionarElemento(selector) {
            const el = document.querySelector(selector);
            if (el && el.select) {
                el.select();
            } else if (el && document.createRange) {
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            return el;
        };

        const scrollElemento(selector, options = { behavior: "smooth", block: "center" }) {
            const el = document.querySelector(selector);
            if (el) el.scrollIntoView(options);
            return el;
        };

	const activateAndScroll(selector, options = { behavior: "smooth", block: "center" }) {
        if (selector) {
            //selector.disabled = false;
            selector.scrollIntoView(options);
            selector.focus();
            if (selector.select) selector.select();
        }
    	};

	const isMobile() {
            const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            return regex.test(navigator.userAgent);
	};

    // Exportar como global para usar en otros scripts
    global.Utils = {
    qSelector,
    qSelecID,
    qSelectors,
    activarElemento,
    seleccionarElemento,
    scrollElemento,
    activateAndScroll,
    isMobile
  };

})(window);
