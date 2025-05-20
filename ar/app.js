(() => {
    'use strict';

    const CONFIG = {
        spacing: 2.5,         // Space between timeline blocks 
        blockSize: 0.8,       // Size of each cube
        textOffset: 1.5,      // Offset for text above blocks
        baseHeight: 0.5,      // Base height of timeline
        textScale: 0.9,       // Size of text elements
        performance: {
            mobile: {
                antialias: false,
                precision: 'mediump',
                maxCanvasWidth: 1024,
                maxCanvasHeight: 768
            },
            desktop: {
                antialias: true,
                precision: 'highp',
                maxCanvasWidth: 1920,
                maxCanvasHeight: 1080
            }
        },
        line: { color: '#FFF', height: 0.1, depth: 0.1 }
    };

    // Load timeline data from external file
    let TIMELINE_DATA = [];
    
    // We'll load this dynamically, but have a fallback if script loading fails
    try {
        if (typeof TIMELINE_EVENTS !== 'undefined') {
            TIMELINE_DATA = TIMELINE_EVENTS;
        }
    } catch(e) {
        console.warn('Timeline data not loaded from external file, using fallback data');
        // Fallback data if external file fails to load
        TIMELINE_DATA = [
            {
                id: 'ada-1843',
                year: '1843',
                title: { en: 'Ada Lovelace', es: 'Ada Lovelace' },
                description: { 
                    en: 'First Computer Program',
                    es: 'Primer Programa de Computadora'
                },
                details: {
                    en: 'Ada Lovelace is considered the first computer programmer, as she wrote the first algorithm intended to be processed by a machine - Charles Babbage\'s Analytical Engine.',
                    es: 'Ada Lovelace es considerada la primera programadora, ya que escribió el primer algoritmo destinado a ser procesado por una máquina - el Motor Analítico de Charles Babbage.'
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
                details: {
                    en: 'Alan Turing introduced the concept of a theoretical computing machine that could simulate any algorithm. This laid the foundation for modern computer science.',
                    es: 'Alan Turing introdujo el concepto de una máquina de computación teórica que podía simular cualquier algoritmo. Esto sentó las bases de la informática moderna.'
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
                details: {
                    en: 'Grace Hopper developed the first compiler, A-0, which translated mathematical code into machine language. This innovation paved the way for modern programming languages.',
                    es: 'Grace Hopper desarrolló el primer compilador, A-0, que traducía código matemático a lenguaje de máquina. Esta innovación allanó el camino para los lenguajes de programación modernos.'
                },
                color: '#45B7D1',
                media: {
                    type: 'image',
                    url: 'media/hopper.jpg',
                    thumbnail: 'thumbnails/hopper-thumb.webp'
                }
            }
        ];
    }

    // DOM Elements
    const elements = {
        status: {
            browser: document.getElementById('browser-info'),
            camera: document.getElementById('camera-status'),
            marker: document.getElementById('marker-status')
        },
        scene: document.querySelector('a-scene'),
        marker: document.getElementById('marker'),
        container: document.getElementById('timeline-container'),
        fallback: document.getElementById('fallback'),
        loader: document.getElementById('loader'),
        loaderText: document.getElementById('loader-text')
    };

    // i18n Configuration (to be replaced with more robust solution)
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
            // Initialize i18n first if available
            if (window.I18n) {
                window.I18n.init();
                updateLoader(10, I18n.t('ui.loading'));
            } else {
                updateLoader(10, i18n.translations[i18n.currentLang].loading);
            }
            
            // Check for Web AR capability
            if (!navigator.mediaDevices?.getUserMedia) {
                showFallback('Camera API not supported');
                if (window.Analytics) {
                    window.Analytics.trackError('browser', 'Camera API not supported');
                }
                return;
            }

            // Initialize asset loader if available
            if (window.AssetLoader) {
                const assetManifest = createAssetManifest();
                AssetLoader.setCallbacks({
                    onProgress: (progress) => {
                        updateLoader(30 + (progress.progress * 0.6), // Scale between 30-90%
                            window.I18n ? I18n.t('ui.loading') : i18n.translations[i18n.currentLang].loading);
                    },
                    onComplete: () => {
                        updateLoader(90, window.I18n ? I18n.t('ui.cameraAccess') : i18n.translations[i18n.currentLang].cameraAccess);
                    },
                    onError: (errors) => {
                        console.warn('Asset loading errors:', errors);
                    }
                });
                await AssetLoader.preloadAssets(assetManifest);
            }

            // Request camera access
            updateLoader(30, window.I18n ? I18n.t('ui.cameraAccess') : i18n.translations[i18n.currentLang].cameraAccess);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            // Set up AR scene
            setupARScene();

            // Load components
            setupMarkerHandlers();
            setupPerformance();
            setupLanguageSwitcher();
            
            // Initialize analytics
            if (window.Analytics) {
                Analytics.init();
            } else {
                initializeAnalytics();
            }

            // Build the timeline
            buildTimeline();

            // All done - hide the loader
            updateLoader(100, '');
            elements.loader.classList.add('hidden');
            setTimeout(() => {
                elements.loader.style.display = 'none';
            }, 500);

        } catch (error) {
            const errorMessage = window.I18n 
                ? `${I18n.t('errors.arError')}${error.message}` 
                : `${i18n.translations[i18n.currentLang].error}${error.message}`;
                
            showFallback(errorMessage);
            
            if (window.Analytics) {
                Analytics.trackError('initialization', error.message);
            }
        }
    }
    
    // Helper to create asset manifest
    function createAssetManifest() {
        const manifest = {
            images: {},
            models: {}
        };
        
        // Add images from timeline data
        TIMELINE_DATA.forEach(event => {
            if (event.media && event.media.url) {
                manifest.images[`media-${event.id}`] = event.media.url;
            }
            if (event.media && event.media.thumbnail) {
                manifest.images[`thumb-${event.id}`] = event.media.thumbnail;
            }
        });
        
        // Add other assets
        manifest.images['checkmark'] = 'assets/images/checkmark.png';
        
        return manifest;
    }
    
    // Set up the AR scene with optimal settings
    function setupARScene() {
        // Add cursor component for interaction
        elements.scene.setAttribute('cursor', {
            rayOrigin: 'mouse',
            fuse: false
        });
        
        // Add raycaster for interaction
        elements.scene.setAttribute('raycaster', {
            objects: '.clickable',
            far: 50
        });
        
        // Add marker-stabilizer component to marker
        if (elements.marker) {
            elements.marker.setAttribute('marker-stabilizer', {
                smooth: true,
                smoothCount: 10,
                smoothTolerance: 0.01,
                smoothThreshold: 5,
                skipFrames: isMobile() ? 2 : 1
            });
        }
    }

    // Build the timeline with event blocks
    function buildTimeline() {
        if (!elements.container) return;

        // Sort events chronologically
        TIMELINE_DATA.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        
        // Clear any existing blocks
        while (elements.container.firstChild) {
            elements.container.removeChild(elements.container.firstChild);
        }
        
        // Add progress tracker with improved options
        elements.container.setAttribute('progress-tracker', {
            totalEvents: TIMELINE_DATA.length,
            storageKey: 'cs-timeline-visited',
            showBadge: true,
            badgePosition: 'top-right'
        });
        
        // Create blocks for each event
        TIMELINE_DATA.forEach((event, index) => {
            const position = calculatePosition(index);
            createBlock(event, position, index);
            
            // Create connector (except for the first block)
            if (index > 0) {
                createConnector(index, position);
            }
        });
        
        // Log timeline creation
        console.log(`Timeline built with ${TIMELINE_DATA.length} events`);
        
        // Track event in analytics
        if (window.Analytics) {
            Analytics.trackEvent(
                Analytics.categories.NAVIGATION, 
                'timelineBuilt', 
                'Timeline Construction', 
                TIMELINE_DATA.length
            );
        }
    }

    // Calculate position for each timeline block
    function calculatePosition(index) {
        const startX = -(TIMELINE_DATA.length - 1) * CONFIG.spacing / 2;
        return {
            x: startX + index * CONFIG.spacing,
            y: CONFIG.baseHeight,
            z: 0
        };
    }

    // Create a timeline block for an event
    function createBlock(event, position, index = 0) {
        // Get the current language
        const lang = window.I18n ? I18n.getLanguage() : i18n.currentLang;
        
        // Create the block entity
        const block = document.createElement('a-entity');
        
        // Set timeline-block component
        block.setAttribute('timeline-block', {
            eventId: event.id,
            year: event.year,
            title: event.title[lang] || event.title.en,
            description: event.description[lang] || event.description.en,
            details: event.details ? (event.details[lang] || event.details.en) : '',
            color: event.color,
            mediaUrl: event.media.url,
            mediaType: event.media.type,
            position: `${position.x} ${position.y} ${position.z}`,
            size: CONFIG.blockSize,
            hoverAnimation: true,
            entranceAnimation: true,
            language: lang
        });
        
        // Add to the container
        elements.container.appendChild(block);
        
        return block;
    }

    // Create a connector line between blocks
    function createConnector(index, position) {
        if (index <= 0 || !elements.container) return;
        
        const prevPosition = calculatePosition(index - 1);
        const connector = document.createElement('a-entity');
        
        // Calculate the midpoint and distance
        const midX = (prevPosition.x + position.x) / 2;
        const distance = position.x - prevPosition.x;
        
        // Set geometry
        connector.setAttribute('geometry', {
            primitive: 'box',
            width: distance,
            height: CONFIG.line.height,
            depth: CONFIG.line.depth
        });
        
        // Set material
        connector.setAttribute('material', {
            color: CONFIG.line.color,
            opacity: 0.7,
            transparent: true
        });
        
        // Set position
        connector.setAttribute('position', {
            x: midX,
            y: position.y,
            z: position.z
        });
        
        // Add to container
        elements.container.appendChild(connector);
    }

    // Set up marker detection handlers
    function setupMarkerHandlers() {
        if (!elements.marker) return;

        elements.marker.addEventListener('markerFound', () => {
            updateStatus('marker', window.I18n 
                ? I18n.t('ui.markerFound') 
                : i18n.translations[i18n.currentLang].markerFound);
                
            elements.marker.setAttribute('visible', 'true');
            
            // Show all elements with a slight delay for stability
            setTimeout(() => {
                elements.container.setAttribute('visible', true);
                document.querySelectorAll('.title-text').forEach(el => {
                    el.setAttribute('visible', true);
                });
                document.querySelectorAll('.timeline-block').forEach(el => {
                    el.setAttribute('visible', true);
                });
            }, 100);
            
            // Track marker found event
            if (window.Analytics) {
                Analytics.trackEvent(
                    Analytics.categories.INTERACTION,
                    'markerFound',
                    'Marker Detection'
                );
            }
        });

        elements.marker.addEventListener('markerLost', () => {
            updateStatus('marker', window.I18n 
                ? I18n.t('ui.markerSearch') 
                : i18n.translations[i18n.currentLang].markerSearch);
                
            elements.marker.setAttribute('visible', 'false');
            
            // Hide all elements immediately
            elements.container.setAttribute('visible', false);
            document.querySelectorAll('.title-text').forEach(el => {
                el.setAttribute('visible', false);
            });
            document.querySelectorAll('.timeline-block').forEach(el => {
                el.setAttribute('visible', false);
            });
        });
        
        // Add marker stabilization event
        elements.marker.addEventListener('stable', () => {
            console.log('Marker stabilized');
        });
    }

    // Configure performance settings based on device
    function setupPerformance() {
        if (isMobile()) {
            // Apply mobile performance settings
            elements.scene.setAttribute('renderer', CONFIG.performance.mobile);
            
            // Reduce raycaster precision for better performance
            elements.scene.setAttribute('raycaster', {
                objects: '.clickable',
                far: 50,
                interval: 100, // Less frequent raycasting on mobile
                origin: 'mouse'
            });
        } else {
            // Apply desktop performance settings
            elements.scene.setAttribute('renderer', CONFIG.performance.desktop);
            
            // Better raycaster for desktop
            elements.scene.setAttribute('raycaster', {
                objects: '.clickable',
                far: 100,
                interval: 0, // Constant raycasting
                origin: 'mouse'
            });
        }
        
        // Add cursor for better interaction
        elements.scene.setAttribute('cursor', {
            rayOrigin: 'mouse',
            fuse: false
        });
    }

    // Set up language switching
    function setupLanguageSwitcher() {
        const buttons = document.querySelectorAll('#lang-switcher button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const lang = button.dataset.lang;
                setLanguage(lang);
            });
        });
    }

    // Change the application language
    function setLanguage(lang) {
        // Use improved i18n module if available
        if (window.I18n) {
            I18n.setLanguage(lang);
        } else {
            i18n.currentLang = lang;
            // Re-build timeline with new language
            buildTimeline();
            // Update UI text
            updateStatus('marker', i18n.translations[lang].markerSearch);
        }
        
        // Track language change
        if (window.Analytics) {
            Analytics.trackLanguageChange(lang);
        } else if (window.gtag) {
            gtag('event', 'languageChange', {
                'event_category': 'Settings',
                'event_label': lang
            });
        }
    }

    // Helper function to detect mobile devices
    function isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Update status messages
    function updateStatus(type, message, isError = false) {
        if (elements.status[type]) {
            elements.status[type].textContent = message;
            elements.status[type].style.color = isError ? '#FF6B6B' : '#FFF';
        }
    }

    // Update loader progress
    function updateLoader(progress, message) {
        // Update progress visually if element exists
        const progressBar = document.querySelector('.loader-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update text message
        if (elements.loaderText) {
            elements.loaderText.textContent = message;
        }
    }

    // Show fallback message when AR fails
    function showFallback(reason) {
        if (elements.fallback) {
            elements.fallback.classList.add('visible');
            const reasonElement = document.getElementById('fallback-reason');
            if (reasonElement) {
                reasonElement.textContent = reason;
            }
        }
        
        // Hide the loader
        if (elements.loader) {
            elements.loader.style.display = 'none';
        }
        
        // Track the fallback event
        if (window.Analytics) {
            Analytics.trackError('fallback', reason);
        }
    }

    // Initialize analytics
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
        // Load external scripts first if needed
        const scripts = [
            // Add script paths here if needed
            // 'utils/i18n.js',
            // 'utils/asset-loader.js',
            // 'utils/analytics.js',
            // 'data/timeline-events.js'
        ];
        
        const loadScripts = scripts.map(src => {
            return new Promise((resolve, reject) => {
                if (!src) {
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                
                script.onload = () => resolve();
                script.onerror = () => {
                    console.warn(`Failed to load script: ${src}`);
                    resolve(); // Resolve anyway to continue initialization
                };
                
                document.head.appendChild(script);
            });
        });
        
        // Initialize app after scripts are loaded
        Promise.all(loadScripts)
            .then(() => {
                initializeAR();
                
                // Initialize analytics after AR is initialized
                if (!window.Analytics) {
                    initializeAnalytics();
                }
                
                // Setup exit button
                document.getElementById('enter-site')?.addEventListener('click', () => {
                    window.location.href = '/';
                });
            })
            .catch(err => {
                console.error('Error initializing application:', err);
                showFallback('Failed to initialize application');
            });
    });
})();
