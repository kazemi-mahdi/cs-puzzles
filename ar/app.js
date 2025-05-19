(() => {
    'use strict';

    const CONFIG = {
        spacing: 2.2,
        blockSize: 0.8,
        textOffset: 1.2,
        baseHeight: 0.5,
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

            setupMarkerHandlers();
            setupPerformance();
            buildTimeline();

        } catch (error) {
            showFallback(`Camera error: ${error.message}`);
        }
    }

    function buildTimeline() {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        container.innerHTML = '';
        
        TIMELINE_DATA.forEach((event, index) => {
            const position = calculatePosition(index);
            
            // Create block
            const block = document.createElement('a-box');
            block.setAttribute('position', `${position.x} ${position.y} 0`);
            block.setAttribute('width', CONFIG.blockSize);
            block.setAttribute('height', CONFIG.blockSize);
            block.setAttribute('depth', CONFIG.blockSize);
            block.setAttribute('color', event.color);
            block.setAttribute('class', 'timeline-block');
            block.addEventListener('click', () => navigateTo(event.link));
            container.appendChild(block);

            // Create connector
            if (index > 0) createConnector(index, position, container);

            // Create text
            const text = document.createElement('a-text');
            text.setAttribute('value', `${event.year}\n${event.title}\n${event.description}`);
            text.setAttribute('position', `${position.x} ${position.y + CONFIG.textOffset} 0`);
            text.setAttribute('scale', '0.5 0.5 0.5');
            text.setAttribute('class', 'timeline-text');
            text.setAttribute('look-at', '[camera]');
            container.appendChild(text);
        });
    }

    function calculatePosition(index) {
        const startX = -(TIMELINE_DATA.length - 1) * CONFIG.spacing / 2;
        return {
            x: startX + index * CONFIG.spacing,
            y: CONFIG.baseHeight
        };
    }

    function createConnector(index, position, container) {
        const prevPos = calculatePosition(index - 1);
        const line = document.createElement('a-box');
        line.setAttribute('position', `${(prevPos.x + position.x)/2} ${position.y} 0`);
        line.setAttribute('width', CONFIG.spacing - CONFIG.blockSize);
        line.setAttribute('height', CONFIG.line.height);
        line.setAttribute('depth', CONFIG.line.depth);
        line.setAttribute('color', CONFIG.line.color);
        container.appendChild(line);
    }

    // Event Handlers
    function setupMarkerHandlers() {
        if (!elements.marker) return;

        elements.marker.addEventListener('markerFound', () => {
            updateStatus('marker', 'Marker detected');
            elements.marker.setAttribute('visible', 'true');
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

    function navigateTo(url) {
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