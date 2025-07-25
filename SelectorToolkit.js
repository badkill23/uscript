// SelectorToolkit.js - Librería reutilizable

(function(global) {
  'use strict';

  const wait = ms => new Promise(res => setTimeout(res, ms));

  const waitForSelector = async (selector, timeout = 10000, interval = 200) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await wait(interval);
    }
    throw new Error(`⛔ Selector "${selector}" no disponible tras ${timeout}ms`);
  };

  const safeQuerySelector = selector => {
    try {
      return document.querySelector(selector);
    } catch (err) {
      console.warn(`⚠️ Selector inválido: ${selector}`, err);
      return null;
    }
  };

  const activateElement = el => {
    if (!el) return console.warn('🚫 Elemento no disponible para activar');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.click?.();
    el.focus?.();
  };

  const highlightElement = el => {
    if (el) {
      el.style.outline = '2px solid #f00';
      el.style.transition = 'outline 0.3s ease-in-out';
    }
  };

  const run = async selector => {
    try {
      const el = await waitForSelector(selector);
      activateElement(el);
      highlightElement(el);
    } catch (error) {
      console.error(`💥 Error al ejecutar SelectorToolkit:`, error);
    }
  };

  global.SelectorToolkit = {
    waitForSelector,
    safeQuerySelector,
    activateElement,
    highlightElement,
    run
  };
})(window);
