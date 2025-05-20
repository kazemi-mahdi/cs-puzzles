// i18n Utility Module
const I18n = (function() {
    'use strict';
    
    // Default language
    let currentLang = 'en';
    
    // Available languages
    const availableLanguages = ['en', 'es'];
    
    // Translations
    const translations = {
        en: {
            ui: {
                loading: 'Initializing AR...',
                cameraAccess: 'Accessing camera...',
                markerSearch: 'Looking for marker...',
                markerFound: 'Marker detected!',
                noCamera: 'Camera access denied',
                incompatibleBrowser: 'Your browser does not support WebAR',
                tapToView: 'Tap cube to view details',
                close: 'Close',
                progress: 'Progress',
                complete: 'Timeline Complete!',
                enterSite: 'Exit AR Mode',
                startExperience: 'Start AR Experience'
            },
            timeline: {
                title: 'Computer Science Timeline'
            },
            errors: {
                cameraError: 'Error accessing camera: ',
                arError: 'AR initialization error: ',
                markerError: 'Marker detection error: ',
                mediaError: 'Error loading media: '
            }
        },
        es: {
            ui: {
                loading: 'Inicializando AR...',
                cameraAccess: 'Accediendo a la cámara...',
                markerSearch: 'Buscando marcador...',
                markerFound: '¡Marcador detectado!',
                noCamera: 'Acceso a la cámara denegado',
                incompatibleBrowser: 'Tu navegador no es compatible con WebAR',
                tapToView: 'Toca el cubo para ver detalles',
                close: 'Cerrar',
                progress: 'Progreso',
                complete: '¡Cronología Completa!',
                enterSite: 'Salir del Modo AR',
                startExperience: 'Iniciar Experiencia AR'
            },
            timeline: {
                title: 'Cronología de la Informática'
            },
            errors: {
                cameraError: 'Error al acceder a la cámara: ',
                arError: 'Error de inicialización de AR: ',
                markerError: 'Error de detección de marcador: ',
                mediaError: 'Error al cargar medios: '
            }
        }
    };

    // Browser language detection
    function detectBrowserLanguage() {
        const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
        return availableLanguages.includes(browserLang) ? browserLang : 'en';
    }
    
    // Get currently active language
    function getLanguage() {
        return currentLang;
    }
    
    // Switch language
    function setLanguage(lang) {
        if (availableLanguages.includes(lang)) {
            currentLang = lang;
            // Save preference to localStorage
            localStorage.setItem('ar-timeline-lang', lang);
            // Dispatch event for components to update
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
            return true;
        }
        return false;
    }
    
    // Get a translation key
    function t(key, replacements = {}) {
        // Support for nested keys like 'ui.loading'
        const keyPath = key.split('.');
        let translation = translations[currentLang];
        
        for (const k of keyPath) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key; // Return the key as fallback
            }
        }
        
        // Apply replacements if any
        if (typeof translation === 'string' && Object.keys(replacements).length > 0) {
            for (const [placeholder, value] of Object.entries(replacements)) {
                translation = translation.replace(`{{${placeholder}}}`, value);
            }
        }
        
        return translation;
    }
    
    // Initialize i18n
    function init() {
        // Try to load saved language preference
        const savedLang = localStorage.getItem('ar-timeline-lang');
        if (savedLang && availableLanguages.includes(savedLang)) {
            currentLang = savedLang;
        } else {
            // Use browser language or default to English
            currentLang = detectBrowserLanguage();
        }
        
        // Update UI elements with translations
        updateUITranslations();
        
        // Add event listener for language change
        document.addEventListener('languageChanged', () => {
            updateUITranslations();
        });
    }
    
    // Update UI elements with current language
    function updateUITranslations() {
        // Update specific UI elements
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = t(key);
        });
    }
    
    // Public API
    return {
        init,
        t,
        getLanguage,
        setLanguage,
        availableLanguages
    };
})();

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
