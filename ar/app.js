(() => {
    'use strict';

    const CONFIG = {
        spacing: 1.5,
        blockSize: 0.4,
        textOffset: 0.8,
        baseHeight: 0.5,
        textScale: 0.4,
        line: { color: '#FFF', height: 0.05, depth: 0.05 }
    };

    const TIMELINE_DATA = [
        {
            id: 'ada-1843',
            year: '1843',
            title: { en: 'Ada Lovelace', es: 'Ada Lovelace' },
            description: { 
                en: 'First Computer Program',
                es: 'Primer Programa de Computadora'
            },
            color: '#FF6B6B',
            media: {
                type: 'image',
                url: 'media/ada.jpg',
                thumbnail: 'thumbnails/ada-thumb.webp'
            }
        },
        {
            id: 'turing-1936',
            year: '1936',
            title: { en: 'Alan Turing', es: 'Alan Turing' },
            description: {
                en: 'Turing Machine',
                es: 'Máquina de Turing'
            },
            color: '#4ECDC4',
            media: {
                type: 'image',
                url: 'media/turing.jpg',
                thumbnail: 'thumbnails/turing-thumb.webp'
            }
        },
        {
            id: 'hopper-1952',
            year: '1952',
            title: { en: 'Grace Hopper', es: 'Grace Hopper' },
            description: {
                en: 'First Compiler',
                es: 'Primer Compilador'
            },
            color: '#45B7D1',
            media: {
                type: 'image',
                url: 'media/hopper.jpg',
                thumbnail: 'thumbnails/hopper-thumb.webp'
            }
        }
    ];

    // DOM Elements
    const elements = {
        status: {
            browser: document.getElementById('browser-info'),
            camera: document.getElementById('camera-status'),
            marker: document.getElementById('marker-status')
        },
        scene: document.querySelector('a-scene'),
        marker: document.getElementById('marker'),
        cameraContainer: document.getElementById('camera-container'),
        container: document.getElementById('timeline-container'),
        fallback: document.getElementById('fallback'),
        loader: document.getElementById('loader'),
        loaderText: document.getElementById('loader-text')
    };

    // i18n Configuration
    const i18n = {
        currentLang: 'en',
        translations: {
            en: {
                loading: 'Initializing AR...',
                cameraAccess: 'Accessing camera...',
                markerSearch: 'Searching for marker...',
                markerFound: 'Marker detected',
                error: 'Error: '
            },
            es: {
                loading: 'Inicializando AR...',
                cameraAccess: 'Accediendo a la cámara...',
                markerSearch: 'Buscando marcador...',
                markerFound: 'Marcador detectado',
                error: 'Error: '
            }
        }
    };

    // Core Functions
    async function initializeAR() {
        try {
            updateLoader(0, i18n.translations[i18n.currentLang].loading);
            
            if (!navigator.mediaDevices?.getUserMedia) {
                showFallback('Camera API not supported');
                return;
            }

            updateLoader(30, i18n.translations[i18n.currentLang].cameraAccess);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            // Add cursor component to scene
            elements.scene.setAttribute('cursor', 'rayOrigin: mouse');
            elements.scene.setAttribute('raycaster', 'objects: .clickable');

            setupMarkerHandlers();
            setupPerformance();
            setupLanguageSwitcher();
            buildTimeline();

            updateLoader(100, '');
            elements.loader.style.display = 'none';

        } catch (error) {
            showFallback(`${i18n.translations[i18n.currentLang].error}${error.message}`);
        }
    }

    function buildTimeline() {
        if (!elements.container) return;
        elements.container.innerHTML = '';
        
        // Initially hide the container
        elements.container.setAttribute('visible', false);
        
        // Add progress tracker
        elements.container.setAttribute('progress-tracker', {
            totalEvents: TIMELINE_DATA.length
        });
        
        TIMELINE_DATA.forEach((event, index) => {
            const position = calculatePosition(index);
            createBlock(event, position);
            if (index > 0) createConnector(index, position);
        });
    }

    function calculatePosition(index) {
        const startX = -(TIMELINE_DATA.length - 1) * CONFIG.spacing / 2;
        return {
            x: startX + index * CONFIG.spacing,
            y: CONFIG.baseHeight,
            z: 0
        };
    }

    function createBlock(event, position) {
        const block = document.createElement('a-box');
        block.setAttribute('timeline-block', {
            eventId: event.id,
            year: event.year,
            title: event.title[i18n.currentLang],
            description: event.description[i18n.currentLang],
            color: event.color,
            mediaUrl: event.media.url,
            mediaType: event.media.type,
            position: `${position.x} ${position.y} ${position.z}`
        });
        
        elements.container.appendChild(block);

        // Create text
        const text = document.createElement('a-text');
        text.setAttribute('value', `${event.year}\n${event.title[i18n.currentLang]}\n${event.description[i18n.currentLang]}`);
        text.setAttribute('position', {
            x: position.x,
            y: position.y + CONFIG.textOffset,
            z: 0
        });
        text.setAttribute('rotation', { x: -90, y: 0, z: 0 });
        text.setAttribute('align', 'center');
        text.setAttribute('color', '#FFF');
        text.setAttribute('scale', `${CONFIG.textScale} ${CONFIG.textScale} ${CONFIG.textScale}`);
        text.setAttribute('geometry', 'primitive: plane; width: 1.2; height: 0.8');
        text.setAttribute('material', 'color: #000; opacity: 0.8; transparent: true');
        text.setAttribute('class', 'timeline-text');
        elements.container.appendChild(text);
    }

    function createConnector(index, position) {
        const prevPos = calculatePosition(index - 1);
        const line = document.createElement('a-box');
        line.setAttribute('position', `${(prevPos.x + position.x)/2} ${position.y} 0`);
        line.setAttribute('width', CONFIG.spacing - CONFIG.blockSize);
        line.setAttribute('height', CONFIG.line.height);
        line.setAttribute('depth', CONFIG.line.depth);
        line.setAttribute('color', CONFIG.line.color);
        elements.container.appendChild(line);
    }

    function setupMarkerHandlers() {
        if (!elements.marker) return;

        elements.marker.addEventListener('markerFound', () => {
            updateStatus('marker', i18n.translations[i18n.currentLang].markerFound);
            elements.marker.setAttribute('visible', 'true');
            
            // Show all elements
            elements.container.setAttribute('visible', true);
            document.querySelectorAll('.title-text').forEach(el => {
                el.setAttribute('visible', true);
            });
            document.querySelectorAll('.timeline-block').forEach(el => {
                el.setAttribute('visible', true);
            });
        });

        elements.marker.addEventListener('markerLost', () => {
            updateStatus('marker', i18n.translations[i18n.currentLang].markerSearch);
            elements.marker.setAttribute('visible', 'false');
            
            // Hide all elements
            elements.container.setAttribute('visible', false);
            document.querySelectorAll('.title-text').forEach(el => {
                el.setAttribute('visible', false);
            });
            document.querySelectorAll('.timeline-block').forEach(el => {
                el.setAttribute('visible', false);
            });
        });
    }

    function setupPerformance() {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            elements.scene.setAttribute('renderer', 'antialias: false; precision: low');
        }
    }

    function setupLanguageSwitcher() {
        const buttons = document.querySelectorAll('#lang-switcher button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const lang = button.dataset.lang;
                setLanguage(lang);
            });
        });
    }

    function setLanguage(lang) {
        i18n.currentLang = lang;
        buildTimeline();
        
        // Update status messages
        updateStatus('marker', i18n.translations[lang].markerSearch);
        
        // Track language change
        if (window.gtag) {
            gtag('event', 'languageChange', {
                'event_category': 'Settings',
                'event_label': lang
            });
        }
    }

    // Helpers
    function updateStatus(type, message, isError = false) {
        if (elements.status[type]) {
            elements.status[type].textContent = message;
            elements.status[type].style.color = isError ? '#FF6B6B' : '#FFF';
        }
    }

    function updateLoader(progress, message) {
        if (elements.loaderText) {
            elements.loaderText.textContent = message;
        }
    }

    function showFallback(reason) {
        elements.fallback.classList.add('visible');
        document.getElementById('fallback-reason').textContent = reason;
    }

    // Analytics
    function initializeAnalytics() {
        if (window.gtag) {
            gtag('event', 'page_view', {
                'page_title': 'CS Timeline AR',
                'page_location': window.location.href
            });
        }
    }

    // Initialization
    document.addEventListener('DOMContentLoaded', () => {
        initializeAR();
        initializeAnalytics();
        
        document.getElementById('enter-site').addEventListener('click', () => {
            window.location.href = '/';
        });
    });
})();