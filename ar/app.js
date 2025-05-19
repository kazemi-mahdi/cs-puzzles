(() => {
    'use strict';

    const CONFIG = {
        spacing: 2.2,
        blockSize: 0.8,
        textOffset: 1.5,
        baseHeight: 0.5,
        textScale: 0.8,
        stabilization: 0.8,
        line: { color: '#FFF', height: 0.1, depth: 0.1 }
    };

    const TIMELINE_DATA = [
        {
            year: '1843',
            title: 'Ada Lovelace',
            description: 'First Computer Program',
            color: '#FF6B6B',
            link: '/ada-lovelace'
        },
        {
            year: '1936',
            title: 'Alan Turing',
            description: 'Turing Machine',
            color: '#4ECDC4',
            link: '/alan-turing'
        },
        {
            year: '1952',
            title: 'Grace Hopper',
            description: 'First Compiler',
            color: '#45B7D1',
            link: '/grace-hopper'
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
        container: document.getElementById('timeline-container'),
        fallback: document.getElementById('fallback')
    };

    // Core Functions
    async function initializeAR() {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                showFallback('Camera API not supported');
                return;
            }

            updateStatus('camera', 'Accessing camera...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            // Add cursor component to scene
            elements.scene.setAttribute('cursor', 'rayOrigin: mouse');
            elements.scene.setAttribute('raycaster', 'objects: .clickable');

            setupMarkerHandlers();
            setupPerformance();
            buildTimeline();

        } catch (error) {
            showFallback(`Camera error: ${error.message}`);
        }
    }

    function buildTimeline() {
        if (!elements.container) return;
        elements.container.innerHTML = '';
        
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
        block.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
        block.setAttribute('width', CONFIG.blockSize);
        block.setAttribute('height', CONFIG.blockSize);
        block.setAttribute('depth', CONFIG.blockSize);
        block.setAttribute('color', event.color);
        block.setAttribute('class', 'timeline-block clickable');
        
        // Add stabilization animation
        block.setAttribute('animation__pos', {
            property: 'position',
            dur: 300,
            easing: 'easeOutQuad',
            to: `${position.x} ${position.y} ${position.z}`
        });

        // Add click/touch handlers
        block.addEventListener('click', () => handleNavigation(event.link));
        block.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleNavigation(event.link);
        });

        // Add physics body for stability
        block.setAttribute('static-body', '');
        elements.container.appendChild(block);

        // Create text
        const text = document.createElement('a-text');
        text.setAttribute('value', `${event.year}\n${event.title}\n${event.description}`);
        text.setAttribute('position', {
            x: position.x,
            y: position.y + CONFIG.textOffset,
            z: -0.2
        });
        text.setAttribute('rotation', { x: -90, y: 0, z: 0 });
        text.setAttribute('align', 'center');
        text.setAttribute('color', '#FFF');
        text.setAttribute('scale', `${CONFIG.textScale} ${CONFIG.textScale} ${CONFIG.textScale}`);
        text.setAttribute('look-at', '[camera]');
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

    // Stabilization handler
    let lastPosition = null;
    function stabilizeElements() {
        if (!elements.container) return;
        
        const currentPos = elements.container.getAttribute('position');
        if (!lastPosition) {
            lastPosition = currentPos;
            return;
        }

        // Smooth position updates
        const smoothedPos = {
            x: lastPosition.x * CONFIG.stabilization + currentPos.x * (1 - CONFIG.stabilization),
            y: lastPosition.y * CONFIG.stabilization + currentPos.y * (1 - CONFIG.stabilization),
            z: lastPosition.z * CONFIG.stabilization + currentPos.z * (1 - CONFIG.stabilization)
        };

        elements.container.setAttribute('position', smoothedPos);
        lastPosition = smoothedPos;
        requestAnimationFrame(stabilizeElements);
    }

    function setupMarkerHandlers() {
        if (!elements.marker) return;

        elements.marker.addEventListener('markerFound', () => {
            updateStatus('marker', 'Marker detected');
            elements.marker.setAttribute('visible', 'true');
            stabilizeElements();
            elements.container.setAttribute('interactive', 'true');
        });

        elements.marker.addEventListener('markerLost', () => {
            updateStatus('marker', 'Searching for marker...');
            elements.marker.setAttribute('visible', 'false');
        });
    }

    function setupPerformance() {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            elements.scene.setAttribute('renderer', 'antialias: false; precision: low');
        }
    }

    // Helpers
    function updateStatus(type, message, isError = false) {
        if (elements.status[type]) {
            elements.status[type].textContent = message;
            elements.status[type].style.color = isError ? '#FF6B6B' : '#FFF';
        }
    }

    function showFallback(reason) {
        elements.fallback.classList.add('visible');
        document.getElementById('fallback-reason').textContent = reason;
    }

    function handleNavigation(url) {
        window.location.href = url;
    }

    // Initialization
    document.addEventListener('DOMContentLoaded', () => {
        initializeAR();
        document.getElementById('enter-site').addEventListener('click', () => {
            window.location.href = '/';
        });
    });
})();