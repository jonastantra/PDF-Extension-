/**
 * Módulo de Internacionalización (i18n)
 * Soporte para 14 idiomas con detección automática
 */

const I18nModule = (() => {
    // Lista de idiomas soportados
    const SUPPORTED_LANGUAGES = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'zh_CN', name: 'Chinese', nativeName: '简体中文' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
        { code: 'pt_BR', name: 'Portuguese', nativeName: 'Português (Brasil)' },
        { code: 'ru', name: 'Russian', nativeName: 'Русский' },
        { code: 'ja', name: 'Japanese', nativeName: '日本語' },
        { code: 'de', name: 'German', nativeName: 'Deutsch' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
        { code: 'ko', name: 'Korean', nativeName: '한국어' },
        { code: 'it', name: 'Italian', nativeName: 'Italiano' },
        { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
        { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' }
    ];

    // Idiomas RTL (derecha a izquierda)
    const RTL_LANGUAGES = ['ar', 'he', 'fa'];

    let currentLanguage = 'es';
    let preferredLanguage = null;

    /**
     * Normaliza código de idioma
     */
    function normalizeLanguageCode(langCode) {
        if (!langCode) return 'es';
        
        const specialCases = {
            'zh-CN': 'zh_CN',
            'zh-Hans': 'zh_CN',
            'zh': 'zh_CN',
            'pt-BR': 'pt_BR',
            'pt': 'pt_BR'
        };

        if (specialCases[langCode]) {
            return specialCases[langCode];
        }

        // Convertir guión a guión bajo para códigos con región
        const normalized = langCode.replace('-', '_');
        
        // Verificar si existe tal cual
        if (SUPPORTED_LANGUAGES.find(l => l.code === normalized)) {
            return normalized;
        }

        // Tomar solo la parte del idioma (sin región)
        const baseLang = langCode.split(/[-_]/)[0];
        
        // Verificar si el idioma base está soportado
        if (SUPPORTED_LANGUAGES.find(l => l.code === baseLang)) {
            return baseLang;
        }

        return 'es'; // Fallback
    }

    /**
     * Detecta el idioma del navegador
     */
    function detectBrowserLanguage() {
        try {
            const browserLang = chrome.i18n.getUILanguage();
            return normalizeLanguageCode(browserLang);
        } catch (e) {
            // Fallback para navegadores sin chrome.i18n
            const navLang = navigator.language || navigator.userLanguage || 'es';
            return normalizeLanguageCode(navLang);
        }
    }

    /**
     * Obtiene una traducción
     * @param {string} key - Clave del mensaje
     * @param {Array} substitutions - Sustituciones opcionales
     * @returns {string} Mensaje traducido
     */
    function t(key, substitutions = []) {
        try {
            const message = chrome.i18n.getMessage(key, substitutions);
            if (message) {
                return message;
            }
        } catch (e) {
            console.warn(`i18n: Error getting message for key "${key}"`, e);
        }

        // Debug: mostrar key si no hay traducción
        console.warn(`i18n: Translation missing for key "${key}"`);
        return `[${key}]`;
    }

    /**
     * Traduce todos los elementos con atributos data-i18n
     */
    function translatePage() {
        // Traducir contenido de texto
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = t(key);
            if (translation && !translation.startsWith('[')) {
                element.textContent = translation;
            }
        });

        // Traducir placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
            const key = input.getAttribute('data-i18n-placeholder');
            const translation = t(key);
            if (translation && !translation.startsWith('[')) {
                input.placeholder = translation;
            }
        });

        // Traducir títulos/tooltips
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = t(key);
            if (translation && !translation.startsWith('[')) {
                element.title = translation;
            }
        });

        // Traducir valores de opciones en selects
        document.querySelectorAll('option[data-i18n]').forEach(option => {
            const key = option.getAttribute('data-i18n');
            const translation = t(key);
            if (translation && !translation.startsWith('[')) {
                option.textContent = translation;
            }
        });
    }

    /**
     * Aplica dirección RTL si es necesario
     */
    function applyRTLIfNeeded() {
        const lang = detectBrowserLanguage();
        const isRTL = RTL_LANGUAGES.includes(lang.split('_')[0]);
        
        if (isRTL) {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl-layout');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl-layout');
        }
    }

    /**
     * Obtiene el idioma actual
     */
    function getCurrentLanguage() {
        return currentLanguage;
    }

    /**
     * Obtiene la lista de idiomas soportados
     */
    function getSupportedLanguages() {
        return SUPPORTED_LANGUAGES;
    }

    /**
     * Verifica si el idioma actual es RTL
     */
    function isRTL() {
        return RTL_LANGUAGES.includes(currentLanguage.split('_')[0]);
    }

    /**
     * Guarda preferencia de idioma
     */
    async function setPreferredLanguage(langCode) {
        const normalized = normalizeLanguageCode(langCode);
        if (SUPPORTED_LANGUAGES.find(l => l.code === normalized)) {
            preferredLanguage = normalized;
            currentLanguage = normalized;
            try {
                await chrome.storage.local.set({ preferredLanguage: normalized });
            } catch (e) {
                localStorage.setItem('preferredLanguage', normalized);
            }
            return true;
        }
        return false;
    }

    /**
     * Carga preferencia de idioma guardada
     */
    async function loadPreferredLanguage() {
        try {
            const result = await chrome.storage.local.get('preferredLanguage');
            if (result.preferredLanguage) {
                preferredLanguage = result.preferredLanguage;
                currentLanguage = preferredLanguage;
                return preferredLanguage;
            }
        } catch (e) {
            const saved = localStorage.getItem('preferredLanguage');
            if (saved) {
                preferredLanguage = saved;
                currentLanguage = saved;
                return saved;
            }
        }
        
        // Si no hay preferencia guardada, usar idioma del navegador
        currentLanguage = detectBrowserLanguage();
        return currentLanguage;
    }

    /**
     * Crea el selector de idioma
     */
    function createLanguageSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const wrapper = document.createElement('div');
        wrapper.className = 'language-selector-wrapper';
        wrapper.innerHTML = `
            <label for="language-select" data-i18n="settings_language"></label>
            <select id="language-select" class="language-select">
                ${SUPPORTED_LANGUAGES.map(lang => `
                    <option value="${lang.code}" ${lang.code === currentLanguage ? 'selected' : ''}>
                        ${lang.nativeName}
                    </option>
                `).join('')}
            </select>
        `;

        container.appendChild(wrapper);

        const select = wrapper.querySelector('#language-select');
        select.addEventListener('change', async (e) => {
            await setPreferredLanguage(e.target.value);
            applyRTLIfNeeded();
            translatePage();
            
            // Notificar cambio de idioma
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: e.target.value } 
            }));
        });

        return select;
    }

    /**
     * Inicializa el sistema i18n
     */
    async function init() {
        await loadPreferredLanguage();
        applyRTLIfNeeded();
        
        // Traducir página cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', translatePage);
        } else {
            translatePage();
        }
    }

    // API pública
    return {
        init,
        t,
        translatePage,
        getCurrentLanguage,
        getSupportedLanguages,
        isRTL,
        setPreferredLanguage,
        loadPreferredLanguage,
        createLanguageSelector,
        applyRTLIfNeeded,
        normalizeLanguageCode,
        detectBrowserLanguage
    };
})();

// Exportar para uso en otros módulos
if (typeof window !== 'undefined') {
    window.I18nModule = I18nModule;
    window.t = I18nModule.t; // Atajo global para traducciones
}

