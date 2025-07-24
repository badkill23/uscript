// ==UserScript==
// @name         Utils DOM
// @namespace    badkill
// @description  Módulo reutilizable con diferentes funciones
// @version      1.0.5
// @author       badkill
// @homepageURL  https://github.com/badkill23
// @supportURL   https://github.com/badkill23/uscript/issues
// @updateURL    https://github.com/badkill23/uscript/raw/main/Utils.user.js
// @downloadURL  https://github.com/badkill23/uscript/raw/main/Utils.user.js
// @grant        none
// ==/UserScript==


(function (global) {
    'use strict';

    const utilsDOM = {
        qSelector(selector) {
            return document.querySelector(selector);
        },

        qSelecID(selector) {
            return document.getElementById(selector);
        },

        qSelectors(selector) {
            return document.querySelectorAll(selector);
        },

        activarElemento(selector) {
            const el = document.querySelector(selector);
            if (el) el.focus();
            return el;
        },

        seleccionarElemento(selector) {
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
        },

        scrollElemento(selector, options = { behavior: "smooth", block: "center" }) {
            const el = document.querySelector(selector);
            if (el) el.scrollIntoView(options);
            return el;
        },

	activateAndScroll(selector, options = { behavior: "smooth", block: "center" }) {
        if (selector) {
            //selector.disabled = false;
            selector.scrollIntoView(options);
            selector.focus();
            if (selector.select) selector.select();
        }
    }
    };

    // Exportar como global para usar en otros scripts
    global.utilsDOM = utilsDOM;

})(window);
