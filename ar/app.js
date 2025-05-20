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
                    },
                    onComplete: () => {},
                    onError: () => {}
                })
            }
            
            // Check for AR.js
            if (typeof AFRAME === 'undefined') {
                throw new Error('A-Frame not loaded');
            }
            
            debugLog('A-Frame loaded: ' + AFRAME.version);
            
            // Update status
            updateStatus('browser', 'AR enabled browser detected');
            
            // Check browser compatibility
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Browser does not support camera access for AR');
            }
            
            debugLog('Camera API available');
            updateStatus('camera', 'Requesting camera access...');
            
            // Initialize app components
            debugLog('Setting up AR scene...');
            setupARScene();
            
            // Initialize other components
            setupMarkerHandlers();
            
            // Check for markers in the DOM
            const markers = document.querySelectorAll('a-marker');
            debugLog(`Found ${markers.length} markers in DOM`);
            markers.forEach((marker, i) => {
                const type = marker.getAttribute('type') || marker.getAttribute('preset') || 'unknown';
                const id = marker.id || `marker-${i}`;
                debugLog(`Marker ${i+1}: ${id}, Type: ${type}`);
            });
            
            // Build basic timeline elements for testing
            buildTimeline();
            
            // Hide loader
            if (elements.loader) {
                elements.loader.classList.add('hidden');
            }
            
            // Simplify the UI - remove unnecessary elements
            const simplifyUI = () => {
                // Remove any complex UI elements that might interfere with basic AR testing
                document.querySelectorAll('.progress-badge, .modal').forEach(el => el.remove());
            };
            
            setTimeout(simplifyUI, 1000);
            
            debugLog('AR initialization complete - waiting for marker detection');
            updateStatus('marker', 'Searching for marker...');
            
        } catch (err) {
            console.error('Failed to initialize AR:', err);
            if (document.getElementById('ar-debug')) {
                document.getElementById('ar-debug').innerHTML += 
                    `<div style="color:red">ERROR: ${err.message}</div>`;
            }
            showFallback(err.message);
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
        console.log('Setting up AR scene...');
        
        // Create a scene
        elements.scene = document.querySelector('a-scene');
        
        if (!elements.scene) {
            console.error('A-Frame scene not found');
            return;
        }
        
        // Set performance settings
        const performanceSettings = isMobile() 
            ? CONFIG.performance.mobile 
            : CONFIG.performance.desktop;
        
        // Apply settings to scene attributes
        Object.entries(performanceSettings).forEach(([key, value]) => {
            elements.scene.setAttribute(key, value);
        });
        
        // Set up marker
        elements.marker = document.querySelector('a-marker');
        
        if (!elements.marker) {
            console.error('AR marker not found');
            return;
        }
        
        console.log('Marker found in DOM:', elements.marker.id || 'unnamed-marker');
        
        // Remove any existing containers
        const existingContainer = document.getElementById('timeline-container');
        if (existingContainer) {
            existingContainer.parentNode.removeChild(existingContainer);
            console.log('Removed existing timeline container');
        }
        
        // Add a container for our timeline blocks
        elements.container = document.createElement('a-entity');
        elements.container.id = 'timeline-container';
        elements.container.setAttribute('position', '0 0.5 0'); // Position above the marker
        elements.container.setAttribute('visible', true); // Make visible by default for debugging
        elements.marker.appendChild(elements.container);
        
        // Add a simple debug cube directly on the marker
        const debugCube = document.createElement('a-box');
        debugCube.setAttribute('color', 'red');
        debugCube.setAttribute('position', '0 0 0');
        debugCube.setAttribute('scale', '0.5 0.5 0.5');
        debugCube.setAttribute('opacity', '0.8');
        elements.marker.appendChild(debugCube);
        
        // Add text to show marker is detected
        const debugText = document.createElement('a-text');
        debugText.setAttribute('value', 'MARKER DETECTED');
        debugText.setAttribute('position', '0 1 0');
        debugText.setAttribute('align', 'center');
        debugText.setAttribute('color', 'yellow');
        debugText.setAttribute('scale', '1 1 1');
        elements.marker.appendChild(debugText);
        
        console.log('AR scene setup complete with debug elements');
    }

    // Build the timeline with event blocks
    function buildTimeline() {
        if (!elements.container) {
            console.error('Timeline container not found!');
            return;
        }

        console.log('Building timeline with container:', elements.container);

        // Clear any existing blocks
        while (elements.container.firstChild) {
            elements.container.removeChild(elements.container.firstChild);
        }
        
        // Ensure container is visible
        elements.container.setAttribute('visible', true);
        
        // Create a title text directly above the container
        const titleText = document.createElement('a-text');
        titleText.setAttribute('value', 'AR TIMELINE');
        titleText.setAttribute('color', '#FFFF00'); // Bright yellow
        titleText.setAttribute('align', 'center');
        titleText.setAttribute('position', '0 1 0');
        titleText.setAttribute('scale', '1.5 1.5 1.5');
        elements.container.appendChild(titleText);
        
        // Add a simple spinning sphere
        const sphere = document.createElement('a-sphere');
        sphere.setAttribute('color', '#FF00FF'); // Bright magenta
        sphere.setAttribute('position', '0 0 0');
        sphere.setAttribute('radius', '0.3');
        sphere.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear');
        elements.container.appendChild(sphere);
        
        // Create a colorful grid of simple objects instead of a complex timeline
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
        const shapes = ['box', 'sphere', 'cylinder', 'torus'];
        
        for (let i = 0; i < 4; i++) {
            const x = (i - 1.5) * 0.8; // Space them out horizontally
            const shape = document.createElement(`a-${shapes[i]}`);
            shape.setAttribute('color', colors[i]);
            shape.setAttribute('position', `${x} 0 0.5`);
            shape.setAttribute('animation', 'property: position; to: '+x+' 0.5 0.5; dir: alternate; dur: 1000; loop: true');
            elements.container.appendChild(shape);
        }
        
        console.log('Created simplified test elements for debugging AR marker detection');
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

    // Create a simple block for testing (primitive cube)
    function createSimpleBlock(event, position, index) {
        // Create primitive box for testing
        const cube = document.createElement('a-box');
        cube.className = 'timeline-block';
        
        // Convert color string to hex if needed
        let color = event.color || getColorForIndex(index);
        
        // Set attributes
        cube.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
        cube.setAttribute('width', '0.4');
        cube.setAttribute('height', '0.4');
        cube.setAttribute('depth', '0.4');
        cube.setAttribute('color', color);
        cube.setAttribute('visible', true);
        
        // Add text for year
        const yearText = document.createElement('a-text');
        yearText.setAttribute('value', event.year);
        yearText.setAttribute('position', '0 0.3 0');
        yearText.setAttribute('align', 'center');
        yearText.setAttribute('color', '#FFFFFF');
        yearText.setAttribute('scale', '0.5 0.5 0.5');
        cube.appendChild(yearText);
        
        // Animation for testing
        const animation = document.createElement('a-animation');
        animation.setAttribute('attribute', 'rotation');
        animation.setAttribute('dur', '4000');
        animation.setAttribute('to', '0 360 0');
        animation.setAttribute('repeat', 'indefinite');
        animation.setAttribute('easing', 'linear');
        cube.appendChild(animation);
        
        // Add to container
        elements.container.appendChild(cube);
        console.log(`Created simple block for ${event.title} at position:`, position);
        
        return cube;
    }
    
    // Create a simple connector (line) between blocks
    function createSimpleConnector(index, currentPosition) {
        if (index <= 0 || !TIMELINE_DATA[index-1]) return;
        
        // Get previous position
        const prevPosition = calculatePosition(index-1);
        
        // Create line entity
        const line = document.createElement('a-entity');
        line.setAttribute('line', {
            start: `${prevPosition.x} ${prevPosition.y} ${prevPosition.z}`,
            end: `${currentPosition.x} ${currentPosition.y} ${currentPosition.z}`,
            color: '#FFFFFF',
            opacity: 0.7
        });
        
        elements.container.appendChild(line);
        return line;
    }
    
    // Helper function to get a color for index
    function getColorForIndex(index) {
        const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF6D01', '#46BDC6'];
        return colors[index % colors.length];
    }

    // Set up marker detection handlers
    function setupMarkerHandlers() {
        if (!elements.marker) return;

        elements.marker.addEventListener('markerFound', () => {
            // Log immediately to console for debugging
            console.log('%c MARKER DETECTED! ', 'background: green; color: white; font-size: 20px');
            updateStatus('marker', 'Marker detected');
                
            // Clear any existing badge elements that might be causing issues
            const badges = document.querySelectorAll('.progress-badge');
            badges.forEach(badge => badge.remove());
            
            // Ensure the marker itself is visible
            elements.marker.setAttribute('visible', true);
            
            // Create an immediate visual indicator that the marker was found
            const detectionIndicator = document.createElement('a-entity');
            detectionIndicator.innerHTML = `
                <a-sphere color="#FF0000" radius="0.2" position="0 0.5 0" animation="property: scale; to: 1.5 1.5 1.5; dur: 500; easing: easeOutElastic; loop: 3"></a-sphere>
                <a-text value="MARKER FOUND" color="white" align="center" position="0 1 0" scale="1 1 1"></a-text>
            `;
            elements.marker.appendChild(detectionIndicator);
            
            // Clear and rebuild the timeline with the simple elements
            console.log('Building timeline after marker detection');
            buildTimeline();
            
            // Alert in a timeout to verify code is still running
            setTimeout(() => {
                console.log('Marker detection still active after 2 seconds');
                
                // Make sure all blocks are visible and animated
                document.querySelectorAll('a-sphere, a-box, a-cylinder, a-torus').forEach(el => {
                    // Set a bright material to ensure visibility
                    el.setAttribute('material', 'emissive: ' + el.getAttribute('color'));
                    el.setAttribute('material', 'emissiveIntensity: 0.5');
                });
                
                // Create a floating text in scene space to confirm it's working
                const floatingText = document.createElement('a-text');
                floatingText.setAttribute('value', 'AR WORKING!');
                floatingText.setAttribute('position', '0 2 -3'); // Position in camera space
                floatingText.setAttribute('color', '#FF00FF');
                floatingText.setAttribute('align', 'center');
                floatingText.setAttribute('scale', '5 5 5');
                floatingText.setAttribute('look-at', '[camera]');
                elements.scene.appendChild(floatingText);
            }, 2000);
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
