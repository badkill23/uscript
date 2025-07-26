/**
 * Librería avanzada para manipulación del DOM en userscripts
 * @name DOMAdvanced
 * @version 1.2.0
 * @description Librería para buscar, seleccionar, esperar y manipular elementos del DOM con manejo de errores
 */
const DOMAdvanced = (() => {
    // Configuración por defecto
    const defaults = {
        timeout: 10000, // 10 segundos
        pollInterval: 100, // 100ms
        scrollStep: 100, // píxeles por paso de scroll
        maxScrollAttempts: 50, // intentos máximos de scroll
        visibleCheck: true, // verificar visibilidad por defecto
        throwErrors: false // no lanzar errores por defecto
    };

    // Verificar si un elemento es visible
    const isVisible = (element) => {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    };

    // Función para esperar con tiempo de espera
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Espera a que un selector esté presente en el DOM
     * @param {string} selector - Selector CSS a esperar
     * @param {object} options - Opciones de configuración
     * @returns {Promise<Element|null>} - Elemento encontrado o null si no se encontró
     */
    const waitForSelector = async (selector, options = {}) => {
        const config = { ...defaults, ...options };
        const { timeout, pollInterval, visibleCheck, throwErrors } = config;
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const checkSelector = () => {
                const element = document.querySelector(selector);
                
                if (element && (!visibleCheck || isVisible(element))) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    const error = new Error(`Timeout: Selector "${selector}" no encontrado después de ${timeout}ms`);
                    if (throwErrors) {
                        reject(error);
                    } else {
                        console.warn(error.message);
                        resolve(null);
                    }
                } else {
                    setTimeout(checkSelector, pollInterval);
                }
            };
            
            checkSelector();
        });
    };

    /**
     * Hace scroll hasta que el elemento es visible
     * @param {string|Element} selector - Selector CSS o elemento DOM
     * @param {object} options - Opciones de configuración
     * @returns {Promise<Element|null>} - Elemento encontrado o null si no se encontró
     */
    const scrollToSelector = async (selector, options = {}) => {
        const config = { ...defaults, ...options };
        const { scrollStep, maxScrollAttempts, throwErrors } = config;
        
        let element = typeof selector === 'string' ? 
            await waitForSelector(selector, { ...options, visibleCheck: false }) : 
            selector;
        
        if (!element) {
            const error = new Error(`Elemento no encontrado: ${typeof selector === 'string' ? selector : 'Elemento proporcionado'}`);
            if (throwErrors) throw error;
            console.warn(error.message);
            return null;
        }

        let attempts = 0;
        return new Promise((resolve, reject) => {
            const scrollCheck = () => {
                attempts++;
                const rect = element.getBoundingClientRect();
                
                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    resolve(element);
                    return;
                }
                
                if (attempts >= maxScrollAttempts) {
                    const error = new Error(`No se pudo hacer scroll al elemento después de ${attempts} intentos`);
                    if (throwErrors) {
                        reject(error);
                    } else {
                        console.warn(error.message);
                        resolve(element); // Devuelve el elemento aunque no esté completamente visible
                    }
                    return;
                }
                
                window.scrollBy({
                    top: rect.top < 0 ? -scrollStep : scrollStep,
                    behavior: 'smooth'
                });
                
                requestAnimationFrame(scrollCheck);
            };
            
            scrollCheck();
        });
    };

    /**
     * Activa un evento en un elemento (click, focus, etc.)
     * @param {string|Element} selector - Selector CSS o elemento DOM
     * @param {string} event - Tipo de evento a activar (ej. 'click')
     * @param {object} options - Opciones de configuración
     * @returns {Promise<boolean>} - True si el evento se activó correctamente
     */
    const triggerEvent = async (selector, event = 'click', options = {}) => {
        const config = { ...defaults, ...options };
        const element = typeof selector === 'string' ? 
            await waitForSelector(selector, config) : 
            selector;
        
        if (!element) {
            const error = new Error(`No se pudo encontrar el elemento para activar ${event}`);
            if (config.throwErrors) throw error;
            console.warn(error.message);
            return false;
        }
        
        try {
            const evt = new MouseEvent(event, {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(evt);
            return true;
        } catch (e) {
            if (config.throwErrors) throw e;
            console.warn(`Error al activar ${event}:`, e);
            return false;
        }
    };

    /**
     * Obtiene todos los elementos que coinciden con el selector
     * @param {string} selector - Selector CSS
     * @param {object} options - Opciones de configuración
     * @returns {Promise<Element[]>} - Array de elementos encontrados
     */
    const selectAll = async (selector, options = {}) => {
        const config = { ...defaults, ...options };
        await waitForSelector(selector, { ...config, visibleCheck: false });
        
        const elements = Array.from(document.querySelectorAll(selector));
        if (config.visibleCheck) {
            return elements.filter(isVisible);
        }
        return elements;
    };

    /**
     * Observa cambios en el DOM para detectar la aparición de un selector
     * @param {string} selector - Selector CSS a observar
     * @param {function} callback - Función a ejecutar cuando aparece el selector
     * @param {object} options - Opciones de configuración
     * @returns {MutationObserver} - Instancia del observador
     */
    const observeSelector = (selector, callback, options = {}) => {
        const config = { ...defaults, ...options };
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element && (!config.visibleCheck || isVisible(element))) {
                callback(element, obs);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
        
        return observer;
    };

    // API pública
    return {
        waitForSelector,
        scrollToSelector,
        triggerEvent,
        selectAll,
        observeSelector,
        isVisible,
        config: (newConfig) => Object.assign(defaults, newConfig),
        
        // Aliases para mayor comodidad
        waitFor: waitForSelector,
        scrollTo: scrollToSelector,
        click: (selector, options) => triggerEvent(selector, 'click', options),
        focus: (selector, options) => triggerEvent(selector, 'focus', options),
        hover: (selector, options) => triggerEvent(selector, 'mouseover', options)
    };
})();

/*
// Uso en userscripts:
// ==UserScript==
// @name         Mi Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Ejemplo de uso de DOMAdvanced
// @author       Tú
// @match        *://*/*
// @grant        none
// @require      https://raw.githubusercontent.com/tupath/to/DOMAdvanced.js
// ==/UserScript==


(async function() {
    'use strict';
    
    // Ejemplo de uso:
    try {
        // Configuración global
        DOMAdvanced.config({ timeout: 5000, throwErrors: true });
        
        // Esperar un elemento y hacer click
        const button = await DOMAdvanced.waitForSelector('.my-button');
        if (button) {
            await DOMAdvanced.scrollToSelector(button);
            await DOMAdvanced.click(button);
        }
        
        // Observar la aparición de un elemento dinámico
        DOMAdvanced.observeSelector('.dynamic-content', (element) => {
            console.log('¡Contenido dinámico apareció!', element);
        });
        
    } catch (error) {
        console.error('Error en el userscript:', error);
    }
})();
*/
